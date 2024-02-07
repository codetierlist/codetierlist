import {RoleType} from "@prisma/client";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {
    AssignmentWithTier,
    FetchedAssignment,
    FetchedCourseWithTiers,
} from "codetierlist-types";
import {randomUUID} from "crypto";
import express from "express";
import {promises as fs} from "fs";
import {isUTORid} from "is-utorid";
import multer from "multer";
import path from "path";
import {images} from "../../../common/config";
import prisma, {
    fetchedAssignmentArgs
} from "../../../common/prisma";
import {
    generateTierFromQueriedData,
    QueriedSubmission
} from "../../../common/tierlist";
import {
    errorHandler,
    fetchCourseMiddleware, isProf,
    serializeAssignment
} from "../../../common/utils";
import assignmentsRoute from "./assignments";

const storage = multer.diskStorage({
    filename: function (_, file, callback) {
        callback(null, randomUUID() + "." + path.extname(file.originalname));
    }
});

const upload = multer({storage});
const router = express.Router();
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

router.get("/:courseId", fetchCourseMiddleware, errorHandler(async (req, res) => {
    const queriedSubmissions = await prisma.$queryRaw<(QueriedSubmission & { assignment_title: string })[]>`
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


    const assignments: Omit<AssignmentWithTier, "group_size">[] = req.course!.assignments.map(assignment => ({
        title: assignment.title,
        course_id: assignment.course_id,
        due_date: assignment.due_date?.toISOString(),
        description: assignment.description,
        image_version: assignment.image_version,
        runner_image: assignment.runner_image,
        hidden: false,
        strict_deadline: assignment.strict_deadline,
        tier: generateTierFromQueriedData(queriedSubmissions.filter(x => x.assignment_title === assignment.title))[1]
    }));
    res.send({...req.course!, assignments} satisfies FetchedCourseWithTiers);
}));

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

router.post("/:courseId/add", fetchCourseMiddleware, errorHandler(async (req, res) => {
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

router.post("/:courseId/remove", fetchCourseMiddleware, errorHandler(async (req, res) => {
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

router.get("/:courseId/cover", fetchCourseMiddleware, errorHandler(async (req, res) => {
    if (!req.course?.cover) {
        res.statusCode = 404;
        res.send({message: "No cover found"});
        return;
    }
    res.sendFile("/uploads/" + req.course!.cover);
}));
router.post("/:courseId/assignments", fetchCourseMiddleware, errorHandler(async (req, res) => {
    const {name, dueDate, description} = req.body;
    let {runner_image: image, image_version, groupSize, strictDeadlines} = req.body;
    const date = new Date(dueDate);
    if (!groupSize) {
        groupSize = 0;
    }
    if (typeof strictDeadlines !== 'boolean') {
        strictDeadlines = false;
    }
    if (typeof name !== 'string' || isNaN(date.getDate()) || typeof groupSize !== "number" || isNaN(groupSize) || typeof description !== 'string' || name.length === 0 || description.length === 0) {
        res.statusCode = 400;
        res.send({message: 'Invalid request.'});
        return;
    }
    if (!image && !image_version) {
        const runnerConf = images[0];
        image = runnerConf.runner_image;
        image_version = runnerConf.image_version;
    }
    if (image && !image_version || image_version && !image || !images.some(x => x.runner_image == image && x.image_version == image_version)) {
        res.statusCode = 400;
        res.send({message: 'Invalid image.'});
        return;
    }
    if (!name.match(/^[A-Za-z0-9 ]*/)) {
        res.statusCode = 400;
        res.send({message: 'Invalid name.'});
        return;
    }
    try {
        const assignment = await prisma.assignment.create({
            data: {
                title: name,
                due_date: date.toISOString(),
                description,
                image_version,
                runner_image: image,
                group_size: groupSize,
                course: {connect: {id: req.course!.id}},
                strict_deadline: strictDeadlines
            }, ...fetchedAssignmentArgs
        });
        res.statusCode = 201;
        res.send(serializeAssignment(assignment) satisfies FetchedAssignment);
    } catch (e) {
        if ((e as PrismaClientKnownRequestError).code === 'P2002') {
            res.statusCode = 400;
            res.send({message: 'Assignment already exists.'});
        } else {
            throw e;
        }
    }
}));

router.use("/:courseId/assignments", assignmentsRoute);

export default router;
