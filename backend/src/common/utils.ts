import {
    Course,
    Prisma,
    Assignment as PrismaAssignment,
    RoleType,
    Solution,
    TestCase
} from "@prisma/client";
import { Commit, FetchedUser } from "codetierlist-types";
import { NextFunction, Request, Response } from "express";
import { PathLike, promises as fs } from "fs";
import { isUTORid } from "is-utorid";
import git, { ReadBlobResult } from "isomorphic-git";
import path from "path";
import prisma, { fetchedAssignmentArgs, fetchedCourseArgs } from "./prisma";
import {
    onNewProfSubmission,
    onNewSubmission,
    onNewTestCase
} from "./updateScores";
import {config} from "./config";

export const errorHandler = (cb: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        cb(req, res, next).catch(e => {
            console.error(e);
            next(e);
        });
    };
};

/**
 * Checks if a user is a prof in a course.
 * @param course
 * @param user
 */
export function isProf(course: Course, user: FetchedUser) {
    return user.admin || user.roles.some(role => course.id===role.course_id && ([RoleType.INSTRUCTOR, RoleType.TA] as RoleType[]).includes(role.type));
}


/**
 * Soft resets the staging area in a git repository to a specific commit.
 * @param repoPath the path to the repository
 * @param commit the commit to reset to
 */
const softResetRepo = async (repoPath: string, commit: string) => {
    // https://github.com/isomorphic-git/isomorphic-git/issues/129
    // Status Matrix Row Indexes
    const FILEPATH = 0;
    const WORKDIR = 2;
    const STAGE = 3;

    // Status Matrix State
    const UNCHANGED = 1;

    const allFiles = await git.statusMatrix({ dir:repoPath, fs });
    // Get all files which have been modified or staged - does not include new untracked files or deleted files
    const modifiedFiles = allFiles
        .filter((row) => row[WORKDIR] > UNCHANGED && row[STAGE] > UNCHANGED)
        .map((row) => row[FILEPATH]);

    // Delete modified/staged files
    await Promise.all(modifiedFiles.map((x) => fs.rm(x)));

    await git.checkout({ dir:repoPath, fs, ref: commit, force: true });
};

const commitFiles = async (req: Request, object: Omit<TestCase | Solution, 'datetime' | 'id'>, table: "solution" | "testCase") => {
    const repoPath = path.resolve(`/repos/${object.course_id}/${object.assignment_title}/${object.author_id}_${table}`);
    const status = await git.statusMatrix({fs, dir:repoPath});
    // no unstaged changes
    if (status.every(x=>x[2]==1)) {
        return {error: "No changes"};
    }
    // too many files added
    if(status.filter(x=>x[2]!==1).length > config.max_file_count){
        await softResetRepo(repoPath, object.git_id);
        return {error : "Too many files added"};
    }
    await git.add({fs, dir: repoPath, filepath: '.'});
    try {
        const commit = await git.commit({
            fs,
            dir: repoPath,
            message: 'Update files via file upload',
            author: {
                name: req.user.utorid,
                email: req.user.email
            }
        });

        const data :  Omit<TestCase | Solution, 'datetime' | 'id'> = {
            git_id: commit,
            git_url: repoPath,
            course_id: req.course!.id,
            assignment_title: req.assignment!.title,
            author_id: req.user.utorid,
            group_number: object.group_number === -1 ? null : object.group_number
        };
        if (table === "solution") {
            const solution = await prisma.solution.create({data});
            if (isProf(req.course!, req.user)) {
                await onNewProfSubmission(solution, req.assignment!);
            } else {
                await onNewSubmission(solution, req.assignment!);
            }
        } else {
            const testCase = await prisma.testCase.create({data});
            await onNewTestCase(testCase, req.assignment!);
        }
        return commit;
    } catch (e) {
        console.error(e);
        return null;
    }
};

const getObjectFromRequest = async (req: Request, table: "solution" | "testCase") => {
    let utorid = req.user.utorid;
    if(req.query.utorid && req.query.utorid !== req.user.utorid){
        if(!isProf(req.course!, req.user) || typeof req.query.utorid !== "string" || !isUTORid(req.query.utorid)){
            return null;
        }
        utorid = req.query.utorid;
    }
    let object: Solution | TestCase | null;
    const query : Prisma.SolutionFindFirstArgs | Prisma.TestCaseFindFirstArgs = {
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
    return object;
};

export const exists = async (p: PathLike) => {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
};

export const processSubmission = async (req: Request, res: Response, table: "solution" | "testCase") => {
    if(!req.user.roles.some(role => role.course_id === req.course!.id)){
        res.statusCode = 403;
        res.send({message: 'You are not enrolled in this course.'});
        return;
    }
    if(req.assignment!.strict_deadline && req.assignment!.due_date && Date.now() > new Date(req.assignment!.due_date).getTime()){
        res.statusCode = 403;
        res.send({message: 'The deadline has passed.'});
        return;
    }
    // upload files
    const repoPath = path.resolve(`/repos/${req.course!.id}/${req.assignment!.title}/${req.user.utorid}_${table}`);

    // check if git repo exists
    let submission = await getObjectFromRequest(req, table);
    if(submission?.author_id !== req.user.utorid){
        res.statusCode = 403;
        res.send({message: 'Cannot make a submission for other users.'});
        return;
    }
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
    if(submission && !isProf(req.course!, req.user)){
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
        await fs.copyFile(file.path, `${repoPath}/${file.filename}`);
    }
    let group : number = -1;
    if(!isProf(req.course!, req.user))
    {
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
                        _id:{
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
    // commit files
    const commit =  await commitFiles(req, submission ?? {
        git_id: "",
        git_url: repoPath,
        course_id: req.course!.id,
        assignment_title: req.assignment!.title,
        author_id: req.user.utorid,
        group_number: group
    }, table);
    if (commit === null) {
        res.statusCode = 500;
        res.send({message: 'Failed to commit.'});
        return;
    }
    if(typeof commit === "object" && "error" in commit){
        res.statusCode = 400;
        res.send({message: commit.error});
        return;
    }
    res.send({commit});
};

/**
 * Gets a commit from a submission.
 *
 * @returns the commit or null if it does not exist
 * @param submission
 * @param commitId
 */
export const getCommit = async (submission: Omit<Solution | TestCase, "group_number">, commitId?: string | null) => {
    let commit = null;
    try {
        commit = await git.readCommit({
            fs,
            dir: submission.git_url,
            oid: commitId ?? submission.git_id
        });
    } catch (e: unknown) {
        // readCommit throws throws an error if the commit is not found
        // https://github.com/isomorphic-git/isomorphic-git/blob/90ea0e34f6bb0956858213281fafff0fd8e94309/src/utils/resolveCommit.js
        return null;
    }

    if (commit === null) {
        return null;
    }

    try {
        const files = await git.listFiles({
            fs,
            dir: submission.git_url,
            ref: commit.oid
        });
        const log = await git.log({fs, dir: submission.git_url});
        const res: Commit = {
            files,
            log: log.map(commitIterator => commitIterator.oid)
        };
        if ((submission as TestCase).valid) {
            res.valid = (submission as TestCase).valid;
        }
        return res;
    } catch (e: unknown) {
        // listFiles/log throws an error if the commit is not found
        // https://github.com/isomorphic-git/isomorphic-git/blob/90ea0e34f6bb0956858213281fafff0fd8e94309/src/api/listFiles.js#L33
        return null;
    }
};
export const getFile = async (file: string, dir: string, commitId: string) => {
    try {
        return git.readBlob({
            fs,
            dir: dir,
            oid: commitId,
            filepath: file
        });
    } catch (e) {
        return null;
    }
};
export const getFileFromRequest = async (req: Request, res: Response, table: "solution" | "testCase") => {
    const object = await getObjectFromRequest(req, table);
    if (object === null) {
        res.statusCode = 404;
        res.send({message: 'Submission not found.'});
        return;
    }
    let file: ReadBlobResult | null = null;
    try {
        file = await getFile(req.params.file, object.git_url, req.params.commitId ?? object.git_id);
    } catch (e) { /* empty */
    }
    if (file === null) {
        res.statusCode = 404;
        res.send({message: 'Commit not found.'});
        return;
    }
    res.send(Buffer.from(file.blob));
};

export const deleteFile = async (req: Request, res: Response, table: "solution" | "testCase") => {
    const object = await getObjectFromRequest(req, table);
    if (object === null) {
        res.statusCode = 404;
        res.send({message: 'Submission not found.'});
        return;
    }
    if(object.author_id !== req.user.utorid) {
        res.statusCode = 403;
        res.send({message: 'Cannot delete files from other users.'});
        return;
    }
    try {
        await git.remove({fs, dir: object.git_url, filepath: req.params.file});
        await fs.unlink(`${object!.git_url}/${req.params.file}`);
    } catch (_) {
        /* if the file doesn't exist then continue */
    }

    const commit = await commitFiles(req, object, table);
    if (commit === null) {
        res.statusCode = 500;
        res.send({message: 'Failed to commit.'});
        return;
    }
    if(typeof commit === "object" && "error" in commit){
        res.statusCode = 400;
        res.send({message: commit.error});
        return;
    }
    res.send({commit});
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

    return await getCommit(object, req.params.commitId);
};

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

export const serializeAssignment = <T extends PrismaAssignment>(assignment: T): Omit<T, "due_date"> & {
    due_date?: string
} => ({...assignment, due_date: assignment.due_date?.toISOString()});

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
            message: 'Course not found.',
        });
        return;
    }
    req.assignment = serializeAssignment(assignment);
    req.course = assignment.course;
    next();
};
