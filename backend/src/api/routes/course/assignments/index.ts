import { limits, images } from "@/common/config";
import prisma, {
    fetchedAssignmentArgs
} from "@/common/prisma";
import {
    QueriedSubmission,
    generateList, generateTierFromQueriedData,
    generateYourTier
} from "@/common/tierlist";
import {
    hideAssignmentDetails,
    isProf,
    serializeAssignment
} from "@/common/utils";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
    AssignmentStudentStats,
    Commit,
    FetchedAssignment,
    Submission, TestCase, Tier,
    Tierlist,
    UserFetchedAssignment
} from "codetierlist-types";
import express, { NextFunction, Request, Response } from "express";
import multer from 'multer';
import {
    deleteFile,
    errorHandler,
    fetchAssignmentMiddleware,
    fetchCourseMiddleware,
    getCommitFromRequest,
    getFileFromRequest,
    processSubmission
} from "@/common/utils/api";
import {validateTestcase} from "@/common/updateScores";

const storage = multer.diskStorage({
    filename: function (_, file, callback) {
        callback(null, file.originalname);
    }
});
const upload = multer({
    storage, limits: {
        fileSize: limits.max_file_size, // 20MB
        files: limits.max_file_count // 30 files, 600MB total (total limit is lower but limited by nginx)
    }
});
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) =>
    upload.array('files')(req, res, (err) => {
        if(err){
            if("code" in err && (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_FILE_SIZE')) {
                res.statusCode = 413;

                if (err.code === 'LIMIT_FILE_COUNT') {
                    res.send({message: `File count exceeded. Maximum ${limits.max_file_count} files allowed.`});
                }
                else if (err.code === 'LIMIT_FILE_SIZE') {
                    res.send({message: `File size exceeded. Maximum ${limits.max_file_size / 1000 / 1000} megabytes allowed.`});
                }
                else {
                    res.send({message: "File size or count exceeded."});
                }

                return;
            }
            next(err);
            return;
        }
        next();
    });
const router = express.Router({mergeParams: true});

/**
 * create a new assignment
 *
 * @param name the name of the assignment
 * @param dueDate the due date of the assignment
 * @param description the description of the assignment\
 * @param runner_image the image to use for the runner
 * @param image_version the version of the image to use
 * @param groupSize the size of the groups
 * @param strictDeadlines whether the assignment has strict deadlines
 *
 * @adminonly
 */
router.post("/", fetchCourseMiddleware, errorHandler(async (req, res) => {
    // check if user is prof or admin
    if (!isProf(req.course!, req.user)) {
        res.statusCode = 403;
        res.send({message: 'You are not a professor or admin.'});
        return;
    }

    const {name, dueDate, description} = req.body;
    let {
        runner_image: image,
        image_version,
        groupSize,
        strictDeadlines
    } = req.body;
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

/**
 * Fetches the assignment from the database and sends it to the client.
 *
 * @public
 *
 * @return {UserFetchedAssignment}
 */
router.get("/:assignment", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    const assignment = await prisma.assignment.findUniqueOrThrow({
        where: {
            id: {
                course_id: req.assignment!.course_id,
                title: req.assignment!.title
            }
        }, include: {
            submissions: {
                where: {author_id: req.user.utorid},
                orderBy: {datetime: "desc"},
                take: 1
            },
            test_cases: {
                where: {author_id: req.user.utorid},
                orderBy: {datetime: "desc"},
                take: 1
            },
            groups: {
                where: {members: {some: {utorid: req.user.utorid}}},
            }
        }
    });

    const submissions = assignment.submissions.map(submission => ({
        datetime: submission.datetime,
        id: submission.id,
        course_id: submission.course_id,
        author_id: submission.author_id,
        git_url: submission.git_url,
        git_id: submission.git_id,
        assignment_title: submission.assignment_title,
    } satisfies Omit<Submission, "group_number">));

    res.send({
        ...hideAssignmentDetails(req.assignment!),
        test_cases: assignment.test_cases.map(testCase => ({
            datetime: testCase.datetime,
            id: testCase.id,
            course_id: testCase.course_id,
            author_id: testCase.author_id,
            git_url: testCase.git_url,
            git_id: testCase.git_id,
            assignment_title: testCase.assignment_title,
            valid: testCase.valid
        } satisfies Omit<TestCase, "group_number" | "validation_result" | "coverage">)),
        submissions,
        tier: assignment.groups.length > 0 ? await generateYourTier(assignment.groups[0]) : "?",
        view_tierlist: assignment.test_cases.length > 0 &&
            assignment.submissions.length > 0 &&
            assignment.groups.length > 0 &&
            assignment.test_cases.some(x => x.valid === "VALID"),
    } satisfies (UserFetchedAssignment));
}));

/**
 * Deletes the assignment from the database.
 * @adminonly
 */
router.delete("/:assignment", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    if (!isProf(req.course!, req.user)) {
        res.statusCode = 403;
        res.send({message: 'You are not an instructor.'});
        return;
    }

    await prisma.assignment.update({
        where: {
            id: {
                title: req.assignment!.title,
                course_id: req.assignment!.course_id
            }
        }, data: {hidden: true}
    });
    res.send({});
}));

const checkFilesMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.files === undefined) {
        res.statusCode = 400;
        res.send({message: 'No files were uploaded.'});
        return;
    }
    next();
};

/**
 * Processes the submission and sends the result to the client.
 * @public
 */
router.post("/:assignment/submissions/*", fetchAssignmentMiddleware, uploadMiddleware, checkFilesMiddleware,
    errorHandler(async (req, res) =>
        processSubmission(req, res, "solution")));

/**
 * Processes the test case and sends the result to the client.
 * @public
 */
router.post("/:assignment/testcases/*", fetchAssignmentMiddleware, uploadMiddleware, checkFilesMiddleware,
    errorHandler(async (req, res) =>
        processSubmission(req, res, "testCase")));

/**
 * Fetches the submission from the database and sends it to the client.
 * @public
 */
router.get("/:assignment/submissions/:commitId?", fetchAssignmentMiddleware,
    errorHandler(async (req, res) => {
        const commit = await getCommitFromRequest(req, "solution");
        if (commit === null) {
            if (!req.params.commitId) {
                res.send({log: [], files: []} satisfies Commit);
                return;
            }
            res.statusCode = 404;
            res.send({message: 'Commit not found.'});
            return;
        }
        res.send(commit satisfies Commit);
    }));

/**
 * Gets a file from the submission and sends it to the client.
 * @public
 */
router.get("/:assignment/submissions/:commitId/*", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    await getFileFromRequest(req, res, "solution");
}));

/**
 * Deletes a file from the submission.
 * @public
 */
router.delete("/:assignment/submissions/*", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    await deleteFile(req, res, "solution");
}));

/**
 * Fetches the test case from the database and sends it to the client.
 * @public
 */
router.get("/:assignment/testcases/:commitId?", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    const commit = await getCommitFromRequest(req, "testCase");

    if (commit === null) {
        if (!req.params.commitId) {
            res.send({log: [], files: []} satisfies Commit);
            return;
        }
        res.statusCode = 404;
        res.send({message: 'Commit not found.'});
        return;
    }
    res.send(commit satisfies Commit);
}));

/**
 * Deletes a file from the test case.
 * @public
 */
router.delete("/:assignment/testcases/*", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    await deleteFile(req, res, "testCase");
}));

/**
 * Gets a file from the test case and sends it to the client.
 * @public
 */
router.get("/:assignment/testcases/:commitId/*", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    await getFileFromRequest(req, res, "testCase");
}));

/**
 * Fetches the tierlist from the database and sends it to the client.
 *
 * @param utorid ADMIN ONLY: The utorid of the user to fetch the tierlist for.
 *
 * @public
 */
router.get("/:assignment/tierlist", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    let utorid = req.user.utorid as string;

    if (req.query.utorid) {
        if (!isProf(req.course!, req.user)) {
            res.statusCode = 403;
            res.send({message: 'You are not an instructor.'});
            return;
        } else {
            utorid = req.query.utorid as string;
        }
    }

    const fullFetchedAssignment = await prisma.assignment.findUniqueOrThrow({
        where: {
            id: {
                title: req.assignment!.title,
                course_id: req.assignment!.course_id
            }
        }, include: {
            groups: {
                where: {
                    members: {
                        some: {
                            utorid
                        }
                    }
                },
            }, submissions: {
                where: {
                    author_id: utorid
                },
                orderBy: {
                    datetime: "desc"
                },
                take: 1
            },
            test_cases: {
                where: {
                    author_id: utorid
                },
                orderBy: {
                    datetime: "desc"
                },
                take: 1
            }
        }
    });

    if (!isProf(req.course!, req.user) && (!fullFetchedAssignment.groups[0] ||
        !fullFetchedAssignment.test_cases[0] ||
        !fullFetchedAssignment.submissions[0] ||
        !fullFetchedAssignment.test_cases.some(x => x.valid === "VALID"))) {
        res.send({
            S: [],
            A: [],
            B: [],
            C: [],
            D: [],
            F: []
        } satisfies Tierlist);
        return;
    }

    // so that "YOU" is the user's utorid even if queried by prof
    req.user.utorid = utorid;

    // if there are no groups then there is no tierlist
    if (!fullFetchedAssignment.groups[0]) {
        res.statusCode = 404;
        res.send({message: `No tierlist found for ${utorid}.`});
        return;
    }

    const tierlist = await generateList(fullFetchedAssignment.groups[0], req.user, !isProf(req.course!, req.user));
    res.send(tierlist[0] satisfies Tierlist);
}));

/**
 * Fetches the tierlist from the database and sends it to the client.
 * @adminonly
 */
router.get('/:assignment/stats', fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    if (!isProf(req.course!, req.user)) {
        res.statusCode = 403;
        res.send({message: "You are not a prof"});
        return;
    }
    const fullFetchedAssignment = await prisma.assignment.findUniqueOrThrow({
        where: {
            id:
                {
                    title: req.assignment!.title,
                    course_id: req.assignment!.course_id
                }
        },
        include: {
            groups: true,
            submissions: {
                where: {
                    author_id: req.user.utorid
                }
            }
        }
    });
    const submissions = await prisma.$queryRaw<(QueriedSubmission & {
        email: string,
        group_number: number
    })[]>`
        WITH data as (SELECT COUNT("_ScoreCache".testcase_author_id)        as total,
                             COUNT(CASE WHEN "_ScoreCache".pass THEN 1 END) as passed,
                             "_ScoreCache".solution_author_id               as author_id,
                             T.group_number                                 as group_number
                      FROM "_ScoreCache"
                               INNER JOIN "_Scores" S on S.id = "_ScoreCache".score_id
                               INNER JOIN "Testcases" T on S.testcase_id = T.id
                      WHERE "_ScoreCache".course_id = ${req.course!.id}
                        AND "_ScoreCache".assignment_title = ${req.assignment!.title}
                        AND T.valid = 'VALID'
                      GROUP BY "_ScoreCache".solution_author_id, T.group_number)
        SELECT utorid, "givenName", surname, email, total, passed, group_number
        FROM data
                 INNER JOIN "Users" U on U.utorid = data.author_id
        WHERE total > 0
        ORDER BY total DESC, passed DESC, utorid;
    `;
    const tierlists = fullFetchedAssignment.groups.map(group =>
        generateTierFromQueriedData(submissions.filter(submission => submission.group_number === group.number), undefined, false)[0]);
    const invertedTierlist: Record<string, Tier> = {};
    tierlists.forEach(tierlist =>
        (Object.keys(tierlist) as Tier[]).forEach(tier => tierlist[tier].forEach(name => invertedTierlist[name.utorid] = tier)));
    const students = submissions.map(submission => {
        return {
            utorid: submission.utorid,
            givenName: submission.givenName,
            surname: submission.surname,
            email: submission.email,
            groupNumber: submission.group_number,
            tier: invertedTierlist[submission.utorid],
            testsPassed: Number(submission.passed),
            totalTests: Number(submission.total)
        };
    });
    res.send(students satisfies AssignmentStudentStats);
}));

/**
 * Revalidates all test cases for the assignment.
 * @adminonly
 */
router.post('/:assignment/revalidate', fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    if (!isProf(req.course!, req.user)) {
        res.statusCode = 403;
        res.send({message: "You are not a prof"});
        return;
    }
    const testCases = await prisma.testCase.findMany({
        where: {
            course_id: req.course!.id,
            assignment_title: req.assignment!.title,
        },
        distinct: "author_id",
        orderBy: {datetime: "desc"},
    });

    await prisma.testCase.updateMany({
        where: {
            id: {
                in: testCases.map(x=>x.id)
            }
        },
        data: {
            valid: "PENDING"
        }
    });

    await Promise.all(testCases.map(testCase => validateTestcase(testCase, req.assignment!)));

    res.send({});
}));

export default router;
