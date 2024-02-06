import {
    Commit,
    Submission, TestCase,
    Tierlist,
    UserFetchedAssignment
} from "codetierlist-types";
import express, { NextFunction, Request, Response } from "express";
import multer from 'multer';
import prisma from "../../../../common/prisma";
import {
    generateList,
    generateYourTier
} from "../../../../common/tierlist";
import {
    deleteFile, errorHandler,
    fetchAssignmentMiddleware,
    getCommitFromRequest,
    getFileFromRequest,
    isProf,
    processSubmission
} from "../../../../common/utils";

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const upload = multer({storage});
const router = express.Router({mergeParams: true});

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
        ...req.assignment!,
        test_cases: assignment.test_cases.map(testCase => ({
            datetime: testCase.datetime,
            id: testCase.id,
            course_id: testCase.course_id,
            author_id: testCase.author_id,
            git_url: testCase.git_url,
            git_id: testCase.git_id,
            assignment_title: testCase.assignment_title,
            valid: testCase.valid
        } satisfies Omit<TestCase, "group_number">)),
        submissions,
        tier: assignment.groups.length > 0 ? generateYourTier(assignment.groups[0]) : "?",
    } satisfies (UserFetchedAssignment));
}));


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

router.post("/:assignment/submissions", fetchAssignmentMiddleware, upload.array('files', 100), checkFilesMiddleware,
    errorHandler(async (req, res) =>
        processSubmission(req, res, "solution")));

router.post("/:assignment/testcases", fetchAssignmentMiddleware, upload.array('files', 100), checkFilesMiddleware,
    errorHandler(async (req, res) =>
        processSubmission(req, res, "testCase")));

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

router.get("/:assignment/submissions/:commitId?/:file", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    await getFileFromRequest(req, res, "solution");
}));

router.delete("/:assignment/submissions/:file", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    await deleteFile(req, res, "solution");
}));

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

router.delete("/:assignment/testcases/:file", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    await deleteFile(req, res, "testCase");
}));

router.get("/:assignment/testcases/:commitId?/:file", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    await getFileFromRequest(req, res, "testCase");
}));

router.get("/:assignment/tierlist", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
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
                            utorid: req.user.utorid
                        }
                    }
                },
            }
        }
    });

    if (!fullFetchedAssignment.groups[0]) {
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
    const tierlist = generateList(fullFetchedAssignment.groups[0], req.user, !isProf(req.course!, req.user));
    res.send(tierlist[0] satisfies Tierlist);
}));
//
// router.get('/:assignment/stats', fetchAssignmentMiddleware, errorHandler(async (req, res) => {
//     if (!isProf(req.course!, req.user)) {
//         res.statusCode = 403;
//         res.send({message: "You are not a prof"});
//         return;
//     }
//     console.time('statsFetch');
//     const fullFetchedAssignment = await prisma.assignment.findUniqueOrThrow({
//         where: {
//             id:
//                 {
//                     title: req.assignment!.title,
//                     course_id: req.assignment!.course_id
//                 }
//         },
//         include: {
//             groups: true,
//             submissions: {
//                 where:{
//                     author_id: req.user.utorid
//                 }
//             }
//         }
//     });
//     console.timeEnd('statsFetch');
//     console.time('tierlistGen');
//     const tierlists = fullFetchedAssignment.groups.map(group => generateTierList(group));
//     console.timeEnd('tierlistGen');
//     console.time('otherGen');
//     const invertedTierlist: Record<string, Tier> = {};
//     tierlists.forEach(tierlist => (Object.keys(tierlist) as Tier[]).forEach(tier => tierlist[tier].forEach(name => invertedTierlist[name.utorid] = tier)));
//     const students = fullFetchedAssignment.groups.map(x=>x).flat().map(submission => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const validTests = submission.scores.filter((x:any) => x.test_case.valid === "VALID");
//         return {
//             utorid: submission.author.utorid,
//             givenName: submission.author.givenName,
//             surname: submission.author.surname,
//             email: submission.author.email,
//             tier: invertedTierlist[submission.author.utorid],
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             testsPassed: validTests.filter((x : any) => x.pass).length,
//             totalTests: validTests.length
//         };
//     });
//     res.send(students satisfies AssignmentStudentStats);
//     console.timeEnd('otherGen');
// }));

export default router;
