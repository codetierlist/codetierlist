import express, {NextFunction, Request, Response} from "express";
import prisma, {fullFetchedAssignmentArgs} from "../../../../common/prisma";
import {
    deleteFile,
    fetchAssignmentMiddleware,
    getCommit, getFile,
    isProf,
    processSubmission
} from "../../../../common/utils";
import multer from 'multer';
import {generateTierList, generateYourTier} from "../../../../common/tierlist";
import {
    AssignmentWithTier,
    Commit, FetchedAssignment,
    FetchedAssignmentWithTier, FullFetchedAssignment,
    Tierlist
} from "codetierlist-types";

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const upload = multer({storage});
const router = express.Router({mergeParams: true});

router.get("/:assignment", fetchAssignmentMiddleware, async (req, res) => {
    const assignment: FetchedAssignment = {...req.assignment!};
    if(!isProf(req.course!, req.user)) {
        assignment.submissions = assignment.submissions.filter(submission => submission.author_id === req.user.utorid);
        assignment.test_cases = assignment.test_cases.filter(testCase => testCase.author_id === req.user.utorid);
    }
    const fullFetchedAssignment: FullFetchedAssignment = await prisma.assignment.findUniqueOrThrow({where:{id: {title: assignment.title, course_id: assignment.course_id}}, ...fullFetchedAssignmentArgs});

    res.send({...assignment, tier: generateYourTier(fullFetchedAssignment)} satisfies (FetchedAssignmentWithTier | AssignmentWithTier));
});

router.delete("/:assignment", fetchAssignmentMiddleware, async (req, res) => {
    if (!isProf(req.course!, req.user)) {
        res.statusCode = 403;
        res.send({error: 'You are not an instructor.'});
        return;
    }
    await prisma.assignment.delete({
        where: {
            id: {
                title: req.assignment!.title,
                course_id: req.assignment!.course_id
            }
        }
    });
    res.send({});
});

const checkFilesMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.files === undefined) {
        res.statusCode = 400;
        res.send({error: 'No files were uploaded.'});
        return;
    }
    next();
};

router.post("/:assignment/submissions", fetchAssignmentMiddleware, upload.array('files', 100), checkFilesMiddleware, async (req, res) =>
    processSubmission(req, "solution").then((commit) => commit === null ? res.sendStatus(404) : res.send({commit})));

router.post("/:assignment/testcases", fetchAssignmentMiddleware, upload.array('files', 100), checkFilesMiddleware, async (req, res) =>
    processSubmission(req, "testCase").then((commit) => commit === null ? res.sendStatus(404) : res.send({commit})));

router.get("/:assignment/submissions/:commitId?", fetchAssignmentMiddleware, async (req, res) => {
    const commit = await getCommit(req, "solution");
    if (commit === null) {
        if(!req.params.commitId) {
            res.send({log:[], files:[]} satisfies Commit);
            return;
        }
        res.statusCode = 404;
        res.send({error: 'Commit not found.'});
        return;
    }
    res.send(commit satisfies Commit);
});

router.get("/:assignment/submissions/:commitId?/:file", fetchAssignmentMiddleware, async (req, res) => {
    await getFile(req, res, "solution");
});

router.delete("/:assignment/submissions/:file", fetchAssignmentMiddleware, async (req, res) => {
    await deleteFile(req, res, "solution");
});

router.get("/:assignment/testcases/:commitId?", fetchAssignmentMiddleware, async (req, res) => {
    const commit = await getCommit(req, "testCase");

    if (commit === null) {
        if(!req.params.commitId) {
            res.send({log:[], files:[]} satisfies Commit);
            return;
        }
        res.statusCode = 404;
        res.send({error: 'Commit not found.'});
        return;
    }
    res.send(commit satisfies Commit);
});

router.delete("/:assignment/testcases/:file", fetchAssignmentMiddleware, async (req, res) => {
    await deleteFile(req, res, "testCase");
});

router.get("/:assignment/testcases/:commitId?/:file", fetchAssignmentMiddleware, async (req, res) => {
    await getFile(req, res, "testCase");
});

router.get("/:assignment/tierlist", fetchAssignmentMiddleware, async (req, res) => {
    const fullFetchedAssignment = await prisma.assignment.findUniqueOrThrow({where:{id: {title: req.assignment!.title, course_id: req.assignment!.course_id}}, ...fullFetchedAssignmentArgs});
    res.send(generateTierList(fullFetchedAssignment, req.user) satisfies Tierlist);
});

export default router;
