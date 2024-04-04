import {NextFunction, Request, Response} from "express";
import logger from "../logger";
import {isUTORid} from "is-utorid";
import {Prisma, Solution, TestCase} from "@prisma/client";
import prisma, {fetchedAssignmentArgs, fetchedCourseArgs} from "../prisma";
import {
    exists,
    isProf,
    securePath,
    serializeAssignment
} from "./index";
import {commitFiles, getCommit, getFile, softResetRepo} from "./git";
import {Commit} from "codetierlist-types";
import git, {ReadBlobResult} from "isomorphic-git";
import {promises as fs} from "fs";
import path from "path";
import extract from "extract-zip";
import {config} from "@/common/config";
import AsyncLock from "async-lock";

const lock = new AsyncLock();

const commitAndRespond =  async (res : Response, object: Omit<TestCase | Solution, 'datetime' | 'id'>, table: "solution" | "testCase", prof : boolean) => {
    lock.acquire(object.author_id, async () => {
        const commit = await commitFiles(object, table, prof);
        if (commit === null) {
            res.statusCode = 500;
            res.send({message: 'Failed to process submission.'});
            return;
        }
        if (typeof commit === "object" && "error" in commit) {
            res.statusCode = 400;
            res.send({message: commit.error});
            return;
        }
        res.send({commit});
    });
};

/**
 * Wraps an async api handler to catch any errors and pass them to the next middleware
 * @param cb The async handler to wrap
 */
export const errorHandler = (cb: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        cb(req, res, next).catch(e => {
            logger.error(e);
            next(e);
        });
    };
};

/**
 * Gets a solution or test case from a request.
 * @param req the request
 * @param table the table to get the object from. Either "solution" or "testCase"
 */
const getObjectFromRequest = async (req: Request, table: "solution" | "testCase") => {
    let utorid = req.user.utorid;

    // check if the user has permission to view another user's submission
    if (req.query.utorid && req.query.utorid !== req.user.utorid) {
        if (!isProf(req.course!, req.user) || typeof req.query.utorid !== "string" || !isUTORid(req.query.utorid)) {
            return null;
        }
        utorid = req.query.utorid;
    }

    let object: Solution | TestCase | null;
    const query: Prisma.SolutionFindFirstArgs | Prisma.TestCaseFindFirstArgs = {
        where: {
            author_id: utorid,
            assignment_title: req.assignment!.title,
            course_id: req.course!.id,
        },
        orderBy: {
            datetime: "desc"
        },
        include: {
            group: true
        }
    };
    if (req.params.commitId) {
        query.where!.git_id = req.params.commitId;
    }
    if (table === "solution") {
        object = await prisma.solution.findFirst(query as Prisma.SolutionFindFirstArgs);
    } else {
        object = await prisma.testCase.findFirst(query as Prisma.TestCaseFindFirstArgs);
    }
    if (object && !isProf(object.course_id, req.user) && object?.author_id !== req.user.utorid) {
        return null;
    }
    return object;
};

export const verifySubmission = async (req: Request, res: Response, table: "solution" | "testCase") => {
    if (!req.user.roles.some(role => role.course_id === req.course!.id)) {
        res.statusCode = 403;
        res.send({message: 'You are not enrolled in this course.'});
        return false;
    }
    if (req.assignment!.strict_deadline && req.assignment!.due_date && Date.now() > new Date(req.assignment!.due_date).getTime()) {
        res.statusCode = 403;
        res.send({message: 'The deadline has passed.'});
        return false;
    }
    const submission = await getObjectFromRequest(req, table);
    if (submission && submission.author_id !== req.user.utorid) {
        res.statusCode = 403;
        res.send({message: 'Cannot make a submission for other users.'});
        return false;
    }
    return submission;
};

/**
 * Processes a submission.
 * @param req
 * @param res
 * @param table the table to process the submission for. Either "solution" or "testCase"
 */
export const processSubmission = async (req: Request, res: Response, table: "solution" | "testCase") => {
    // upload files
    const repoPath = path.resolve(`/repos/${req.course!.id}/${req.assignment!.title}/${req.user.utorid}_${table}`);

    // check if git repo exists
    let submission = await verifySubmission(req, res, table);
    if(submission === false) return;

    if (submission === null || submission === undefined || !(await exists(submission.git_url))) {
        if (submission !== null) {
            await prisma.solution.deleteMany({
                where: {
                    assignment_title: req.assignment!.title,
                    course_id: req.course!.id,
                    author_id: req.user.utorid
                }
            });
            submission = null;
        }
        // create folder if it doesnt exist
        await fs.mkdir(repoPath, {recursive: true});
        await git.init({fs, dir: repoPath});
    }
    if (submission && !isProf(req.course!, req.user)) {
        const delay = process.env.SUBMISSION_DELAY_TIME !== undefined ? parseInt(process.env.SUBMISSION_DELAY_TIME) : 0;
        if (Date.now() < submission.datetime.getTime() + delay) {
            res.statusCode = 429;
            res.send({message: `Submission too soon, please wait ${Math.ceil(submission.datetime.getTime() + delay - Date.now()) / 60000} minute(s).`});
            return;
        }
    }
    // get files from form data
    for (const file of req.files!) {
        if (file === null) continue;
        const dest = path.join(repoPath, securePath(req.params[0] ?? "."));
        await fs.mkdir(dest, {recursive: true});
        if (req.query.unzip && file.mimetype === "application/zip") {
            let totalcount = 0;
            try{
                await extract(file.path, {dir: dest, onEntry: entry => {
                    totalcount += 1;
                    if(entry.uncompressedSize>config.max_file_size || totalcount>config.max_file_count) {
                        throw new Error("unzip too big");
                    }
                }});
            } catch (e) {
                if(typeof e === "object" && "message" in e! && e.message === "unzip too big"){
                    res.send({message: "File size or count exceeded."});
                    return;
                }
                throw e;
            }
            continue;
        }
        if ((await fs.lstat(file.path)).isDirectory()) {
            if (submission)
                await softResetRepo(repoPath, submission.git_id);
            else
                await fs.unlink(repoPath);
            res.statusCode = 400;
            res.send({message: "Cannot upload a folder, upload a zip and use query parameter unzip=true instead."});
            return;
        }
        await fs.copyFile(file.path, path.join(dest, securePath(file.originalname)));
    }

    let group: number = -1;
    if (!isProf(req.course!, req.user)) {
        if (submission && submission.group_number !== null) {
            group = submission.group_number;
        } else {
            const otherSubmissions = await getObjectFromRequest(req, table === "solution" ? "testCase" : "solution");
            if (otherSubmissions && otherSubmissions.group_number !== null) {
                group = otherSubmissions.group_number;
            } else {
                const latestGroup = await prisma.group.findFirst({
                    where: {
                        course_id: req.course!.id,
                        assignment_title: req.assignment!.title,
                    }, orderBy: {
                        number: "desc"
                    },
                    include: {
                        _count: {
                            select: {
                                members: true
                            }
                        }
                    }
                });

                if (latestGroup === null || (latestGroup._count.members >= req.assignment!.group_size && req.assignment!.group_size >= 1)) {
                    group = latestGroup === null ? 0 : latestGroup.number + 1;
                } else {
                    group = latestGroup.number;
                }

                await prisma.group.upsert({
                    where: {
                        _id: {
                            number: group,
                            course_id: req.course!.id,
                            assignment_title: req.assignment!.title
                        }
                    },
                    update: {
                        members: {connect: {utorid: req.user.utorid}}
                    },
                    create: {
                        number: group,
                        course_id: req.course!.id,
                        assignment_title: req.assignment!.title,
                        members: {connect: {utorid: req.user.utorid}}
                    }
                });
            }
        }
    }
    /** commit files */
    await commitAndRespond(res, submission ?? {
        git_id: "",
        git_url: repoPath,
        course_id: req.course!.id,
        assignment_title: req.assignment!.title,
        author_id: req.user.utorid,
        group_number: group
    }, table, isProf(req.course!, req.user));
};

/**
 * Gets a file from a request.
 *
 * @param req the request
 * @param res the response
 * @param table the table to get the file from. Either "solution" or "testCase"
 */
export const getFileFromRequest = async (req: Request, res: Response, table: "solution" | "testCase") => {
    const object = await getObjectFromRequest(req, table);
    if (object === null) {
        res.statusCode = 404;
        res.send({message: 'Submission not found.'});
        return;
    }
    let file: ReadBlobResult | null = null;
    try {
        file = await getFile(req.params[0], object.git_url, req.params.commitId ?? object.git_id);
    } catch (e) { /* empty */
    }
    if (file === null) {
        res.statusCode = 404;
        res.send({message: 'File or commit not found.'});
        return;
    }
    res.send(Buffer.from(file.blob));
};

/**
 * Deletes a file from a submission.
 * @param req
 * @param res
 * @param table the table to delete the file from. Either "solution" or "testCase"
 */
export const deleteFile = async (req: Request, res: Response, table: "solution" | "testCase") => {
    const object = await verifySubmission(req, res, table);
    if(object === false) return;

    if (object === null) {
        res.statusCode = 404;
        res.send({message: 'Submission not found.'});
        return;
    }
    if (object.author_id !== req.user.utorid) {
        res.statusCode = 403;
        res.send({message: 'Cannot delete files from other users.'});
        return;
    }
    try {
        await git.remove({fs, dir: object.git_url, filepath: securePath(req.params[0])});
        await fs.rm(`${object!.git_url}/${securePath(req.params[0])}`, {recursive: true, force: true});
    } catch (e) {
        /* if the file doesn't exist then continue */
    }

    await commitAndRespond(res, object, table, isProf(object.course_id, req.user));
};

/**
 * Gets a commit from a submission.
 *
 * @param req the request
 * @param table the table to get the commit from. Either "solution" or "testCase"
 * @returns the commit or null if it does not exist
 */
export const getCommitFromRequest = async (req: Request, table: "solution" | "testCase"): Promise<Commit | null> => {
    const object = await getObjectFromRequest(req, table);

    if (object === null) {
        return null;
    }

    const res = await getCommit(object, req.params.commitId, isProf(object.course_id, req.user));
    if(res === null) {
        return null;
    }
    const query : Prisma.SolutionFindManyArgs &  Prisma.TestCaseFindManyArgs
        = {
            where: {
                author_id: object.author_id,
                course_id: object.course_id,
                assignment_title: object.assignment_title
            },
            take: 20,
            select: {
                datetime: true,
                git_id: true
            },
            orderBy: {
                datetime: "desc"
            }
        };
    const log = table==="solution" ? await prisma.solution.findMany(query):
        await prisma.testCase.findMany(query);
    return {...res, log: log.map(x=>({id: x.git_id, date: x.datetime.getTime()}))};
};

/**
 * Middleware to fetch a course and add it to the request.
 */
export const fetchCourseMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const course = await prisma.course.findUnique({
        where: {
            id: req.params.courseId,
            hidden: false,
            roles: req.user.admin ? undefined : {some: {user: {utorid: req.user.utorid}}}
        },
        ...fetchedCourseArgs
    });
    if (course === null) {
        res.statusCode = 404;
        res.send({
            status: 404,
            message: 'Course not found.',
        });
        return;
    }
    req.course = course;
    next();
};

/**
 * Middleware to fetch an assignment and add it to the request.
 */
export const fetchAssignmentMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const assignment = await prisma.assignment.findUnique({
        where: {
            id: {
                title: req.params.assignment,
                course_id: req.params.courseId,
            },
            course: {
                roles: req.user.admin ? {} : {some: {user: {utorid: req.user.utorid}}}
            },
            hidden: false
        },
        include: {...fetchedAssignmentArgs.include, course: fetchedCourseArgs}
    });
    if (assignment === null) {
        res.statusCode = 404;
        res.send({
            status: 404,
            message: 'Assignment not found.',
        });
        return;
    }
    req.assignment = serializeAssignment(assignment);
    req.course = assignment.course;
    next();
};
