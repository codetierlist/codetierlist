import { RoleType } from "@prisma/client";
import {
    AssignmentWithTier,
    FetchedCourseWithTiers
} from "codetierlist-types";
import { randomUUID } from "crypto";
import express from "express";
import { promises as fs } from "fs";
import { isUTORid } from "is-utorid";
import multer from "multer";
import path from "path";
import prisma from "../../../common/prisma";
import {
    QueriedSubmission,
    generateTierFromQueriedData
} from "../../../common/tierlist";
import {
    errorHandler,
    fetchCourseMiddleware, isProf
} from "../../../common/utils";
import assignmentsRoute from "./assignments";

const storage = multer.diskStorage({
    filename: function (_, file, callback) {
        callback(null, randomUUID() + "." + path.extname(file.originalname));
    }
});

const upload = multer({storage});
const router = express.Router();

/**
 * create a new course
 * @adminonly
 */
router.post("/", errorHandler(async (req, res) => {
    if (!req.user.admin) {
        res.statusCode = 403;
        res.send({message: 'You are not an admin.'});
        return;
    }
    const {name, code} = req.body;
    if (typeof name !== 'string' || typeof code !== 'string') {
        res.statusCode = 400;
        res.send({message: 'Invalid body.'});
        return;
    }
    const oldCourse = await prisma.course.findFirst({
        where: {
            id: {startsWith: code}
        }, orderBy: {createdAt: "desc"}
    });
    let id: string;
    if (!oldCourse) {
        id = code;
    } else {
        const num = parseInt(oldCourse.id.slice(code.length + 1));
        id = code + '-' + (isNaN(num) ? 1 : num + 1).toString();
    }

    await prisma.course.create({
        data: {
            id,
            name,
            code
        }
    });

    const course = await prisma.course.update({
        where: {id},
        data: {
            roles: {
                create: {
                    user: {connect: {utorid: req.user.utorid}},
                    type: 'INSTRUCTOR'
                }
            }
        }
    });
    res.statusCode = 201;
    res.send(course);
}));

/**
 * get all courses if admin
 * @adminonly
 */
router.get("/", errorHandler(async (req, res) => {
    // must be admin
    if (!req.user.admin) {
        res.statusCode = 403;
        res.send({message: 'You are not an admin.'});
        return;
    }

    const courses = await prisma.course.findMany({
        include: {
            roles: true
        },
        where: {
            hidden: false
        }
    });
    res.send(courses);
}));

/**
 * get a course by id
 * @public
 */
router.get("/:courseId", fetchCourseMiddleware, errorHandler(async (req, res) => {
    const queriedSubmissions = await prisma.$queryRaw<(QueriedSubmission & {
        assignment_title: string
    })[]>`
        WITH userGroups as (SELECT "Groups".number, "Groups".assignment_title
                            FROM "Groups"
                                     INNER JOIN "_GroupToUser" G on "Groups"._id = G."A"
                            WHERE G."B" = ${req.user.utorid}
                              AND "Groups".course_id = ${req.course!.id}),
             data as (SELECT COUNT("_ScoreCache".testcase_author_id)        as total,
                             COUNT(CASE WHEN "_ScoreCache".pass THEN 1 END) as passed,
                             "_ScoreCache".solution_author_id               as author_id,
                             "_ScoreCache".assignment_title
                      FROM "_ScoreCache"
                               INNER JOIN "_Scores" S on S.id = "_ScoreCache".score_id
                               INNER JOIN "Testcases" T on S.testcase_id = T.id
                      WHERE "_ScoreCache".course_id = ${req.course!.id}
                        AND EXISTS(SELECT 1
                                   FROM userGroups
                                   WHERE userGroups.number = T.group_number
                                     AND userGroups.assignment_title =
                                         "_ScoreCache".assignment_title)
                        AND T.valid = 'VALID'
                      GROUP BY "_ScoreCache".solution_author_id,
                               "_ScoreCache".assignment_title)
        SELECT utorid,
               "givenName",
               surname,
               email,
               total,
               passed,
               assignment_title
        FROM data
                 INNER JOIN "Users" U on U.utorid = data.author_id
        WHERE total > 0
        ORDER BY total DESC, passed DESC, utorid;
    `;
    const user = await prisma.user.findUnique({
        where: {utorid: req.user.utorid},
        include: {
            solutions: {
                where: {
                    course_id: req.course!.id
                },
                orderBy: {
                    datetime: "desc"
                },
                distinct: ["assignment_title"]
            },
            testcases: {
                where: {
                    course_id: req.course!.id
                },
                orderBy: {
                    datetime: "desc"
                },
                distinct: ["assignment_title"]
            }
        }
    });
    if (!user) {
        throw new Error("User not found");
    }

    const assignments: Omit<AssignmentWithTier, "group_size">[] = req.course!.assignments.map(assignment => {
        const showTier = user.solutions.some(x => x.assignment_title === assignment.title) &&
            user.testcases.some(x => x.assignment_title === assignment.title && x.valid === "VALID");
        return ({
            title: assignment.title,
            course_id: assignment.course_id,
            due_date: assignment.due_date?.toISOString(),
            description: assignment.description,
            image_version: assignment.image_version,
            runner_image: assignment.runner_image,
            hidden: false,
            strict_deadline: assignment.strict_deadline,
            tier: showTier
                ? generateTierFromQueriedData(queriedSubmissions.filter(x => x.assignment_title === assignment.title), req.user)[1]
                : "?"
        });
    });
    res.send({...req.course!, assignments} satisfies FetchedCourseWithTiers);
}));

/**
 * delete a course
 * @adminonly
 */
router.delete("/:courseId", fetchCourseMiddleware, errorHandler(async (req, res) => {
    if (!req.user.admin) {
        res.statusCode = 403;
        res.send({message: 'You are not an admin.'});
        return;
    }
    await prisma.course.update({
        where: {id: req.course!.id},
        data: {hidden: true}
    });
    await prisma.assignment.updateMany({
        where: {course_id: req.course!.id},
        data: {hidden: true}
    });
    res.send({});
}));

/**
 * add a user to a course
 * @adminonly
 */
router.post("/:courseId/add", fetchCourseMiddleware, errorHandler(async (req, res) => {
    // check if user is prof or admin
    if (!isProf(req.course!, req.user)) {
        res.statusCode = 403;
        res.send({message: 'You are not a professor or admin.'});
        return;
    }

    const {utorids, role}: { utorids: unknown, role?: string } = req.body;
    if (role !== undefined && !(Object.values(RoleType) as string[]).includes(role)) {
        res.statusCode = 400;
        res.send({message: 'Invalid role.'});
        return;
    }
    const newRole = role as RoleType | undefined ?? RoleType.STUDENT;
    if (!utorids || !Array.isArray(utorids) || utorids.some(utorid => typeof utorid !== 'string' || !isUTORid(utorid))) {
        res.statusCode = 400;
        res.send({message: 'utorids must be an array of valid utorids.'});
        return;
    }
    if(newRole !== RoleType.INSTRUCTOR){
        const admins = await prisma.user.findFirst({
            where: {
                utorid: {
                    in: utorids
                },
                admin: true
            }
        });
        if (admins) {
            res.statusCode = 400;
            res.send({message: `${admins.utorid} is an admin and cannot be added as a student or TA.`});
            return;
        }
    }

    await prisma.user.createMany({
        data: utorids.map(utorid => ({
            utorid,
            email: "",
            surname: "",
            givenName: ""
        })),
        skipDuplicates: true
    });
    await prisma.role.createMany({
        data: utorids.map(utorid => ({
            type: newRole,
            course_id: req.course!.id,
            user_id: utorid
        })),
        skipDuplicates: true
    });

    res.send({});

}));

/**
 * remove a user from a course
 * @adminonly
 */
router.post("/:courseId/remove", fetchCourseMiddleware, errorHandler(async (req, res) => {
    // check if user is prof or admin
    if (!isProf(req.course!, req.user)) {
        res.statusCode = 403;
        res.send({message: 'You are not a professor or admin.'});
        return;
    }

    const {utorids, role}: { utorids: unknown, role?: string } = req.body;
    if (role !== undefined && !(Object.values(RoleType) as string[]).includes(role)) {
        res.statusCode = 400;
        res.send({message: 'Invalid role.'});
        return;
    }
    const newRole = role as RoleType | undefined ?? RoleType.STUDENT;
    if (!utorids || !Array.isArray(utorids) || utorids.some(utorid => typeof utorid !== 'string' || !isUTORid(utorid))) {
        res.statusCode = 400;
        res.send({message: 'utorids must be an array of valid utorids.'});
        return;
    }
    await prisma.role.deleteMany({
        where: {
            user_id: {
                in: utorids,
            },
            type: newRole,
        }
    });

    res.send({});

}));

/**
 * update the cover image of a course
 * @adminonly
 */
router.post("/:courseId/cover", fetchCourseMiddleware, upload.single("file"), errorHandler(async (req, res) => {
    if (!req.file || !isProf(req.course!, req.user)) {
        res.statusCode = 400;
        res.send({message: "Must upload a file."});
        return;
    }
    await fs.copyFile(req.file.path, `/uploads/${req.file.filename}`);
    await prisma.course.update({
        where: {id: req.course!.id},
        data: {cover: req.file.filename}
    });
    res.send({});
}));

/**
 * get the cover image of a course
 * @public
 */
router.get("/:courseId/cover", fetchCourseMiddleware, errorHandler(async (req, res) => {
    if (!req.course?.cover) {
        res.statusCode = 404;
        res.send({message: "No cover found"});
        return;
    }
    res.sendFile("/uploads/" + req.course!.cover);
}));

router.use("/:courseId/assignments", assignmentsRoute);

export default router;
