import express, {NextFunction, Request, Response} from "express";
import prisma, {fullFetchedAssignmentArgs} from "../../../../common/prisma";
import {
    deleteFile, errorHandler,
    fetchAssignmentMiddleware,
    getCommitFromRequest,
    getFileFromRequest,
    isProf,
    processSubmission
} from "../../../../common/utils";
import multer from 'multer';
import {
    generateList, generateTierList,
    generateYourTier
} from "../../../../common/tierlist";
import {
    AssignmentStudentStats,
    AssignmentWithTier,
    Commit, FetchedAssignment,
    FetchedAssignmentWithTier, FullFetchedAssignment, Tier,
    Tierlist, UserTier
} from "codetierlist-types";

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const upload = multer({storage});
const router = express.Router({mergeParams: true});

router.get("/:assignment", fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    const assignment: FetchedAssignment = {...req.assignment!};
    if (!isProf(req.course!, req.user)) {
        assignment.submissions = assignment.submissions.filter(submission => submission.author_id === req.user.utorid);
        assignment.test_cases = assignment.test_cases.filter(testCase => testCase.author_id === req.user.utorid);
    }
    const fullFetchedAssignment: FullFetchedAssignment = await prisma.assignment.findUniqueOrThrow({
        where: {
            id: {
                title: assignment.title,
                course_id: assignment.course_id
            }
        }, ...fullFetchedAssignmentArgs
    });

    res.send({
        ...assignment,
        tier: generateYourTier(fullFetchedAssignment)
    } satisfies (FetchedAssignmentWithTier | AssignmentWithTier));
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
        processSubmission(req, "solution").then((commit) => commit === null ? res.sendStatus(404) : res.send({commit}))));

router.post("/:assignment/testcases", fetchAssignmentMiddleware, upload.array('files', 100), checkFilesMiddleware,
    errorHandler(async (req, res) =>
        processSubmission(req, "testCase").then((commit) => commit === null ? res.sendStatus(404) : res.send({commit}))));

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
        }, ...fullFetchedAssignmentArgs
    });
    const tierlist = generateList(fullFetchedAssignment, req.user, !isProf(req.course!, req.user));
    if (!isProf(req.course!, req.user) && tierlist[1] === "?" as UserTier) {
        res.send({S: [], A: [], B: [], C: [], D: [], F: []} satisfies Tierlist);
        return;
    }
    res.send(tierlist[0] satisfies Tierlist);
}));

router.get('/:assignment/stats', fetchAssignmentMiddleware, errorHandler(async (req, res) => {
    if(!isProf(req.course!,req.user)){
        res.statusCode = 403;
        res.send({message:"You are not a prof"});
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
        ...fullFetchedAssignmentArgs,
    });
    const tierlist = generateTierList(fullFetchedAssignment, req.user, false);
    const invertedTierlist: Record<string, Tier> = {};
    (Object.keys(tierlist) as Tier[]).forEach(tier => tierlist[tier].forEach(name => invertedTierlist[name.utorid] = tier));
    const students = fullFetchedAssignment.submissions.map(submission => {
        const validTests = submission.scores.filter(x => x.test_case.valid === "VALID");
        return {
            utorid: submission.author.utorid,
            givenName: submission.author.givenName,
            surname: submission.author.surname,
            email: submission.author.email,
            tier: invertedTierlist[submission.author.utorid],
            testsPassed: validTests.filter(x=>x.pass).length,
            totalTests: validTests.length
        };
    });
    res.send(students satisfies AssignmentStudentStats);
}));
export default router;
