import express, {NextFunction, Request, Response} from "express";
import prisma from "../../../../common/prisma";
import {
    fetchAssignmentMiddleware,
    getCommit,
    isProf,
    processSubmission
} from "../../../../common/utils";
import multer from 'multer';
import {generateTierList} from "../../../../common/tierlist";
import {
    Assignment,
    Commit,
    FetchedAssignment,
    TierList
} from "codetierlist-types";

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const upload = multer({storage});
const router = express.Router({mergeParams: true});

router.get("/:assignment", fetchAssignmentMiddleware, async (req, res) => {
    const assignment = await prisma.assignment.findUnique({
        where: {
            id: {
                title: req.assignment!.title,
                course_id: req.assignment!.course_id
            }
        },
        include: {submissions: isProf(req.course!, req.user)},
    });

    res.send(assignment! satisfies (FetchedAssignment | Assignment));
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
    processSubmission(req, "solution").then(() => res.send({})));

router.post("/:assignment/testcases", fetchAssignmentMiddleware, upload.array('files', 100), checkFilesMiddleware, async (req, res) =>
    processSubmission(req, "testCase").then(() => res.send({})));

router.get("/:assignment/submissions/:commitId?", fetchAssignmentMiddleware, async (req, res) => {
    const commit = await getCommit(req, "solution");
    if (commit === null) {
        res.statusCode = 404;
        res.send({error: 'Commit not found.'});
        return;
    }
    res.send(commit satisfies Commit);
});

router.get("/:assignment/testcases/:commitId?", fetchAssignmentMiddleware, async (req, res) => {
    const commit = await getCommit(req, "testCase");
    if (commit === null) {
        res.statusCode = 404;
        res.send({error: 'Commit not found.'});
        return;
    }
    res.send(commit satisfies Commit);
});

router.get("/:assignment/tierlist", fetchAssignmentMiddleware, async (req, res) => {
    res.send(generateTierList(req.assignment!, req.user) satisfies TierList);
});

export default router;
