import prisma, {fetchedAssignmentArgs, fetchedCourseArgs} from "./prisma";
import {
    Prisma,
    Assignment as PrismaAssignment,
    Course,
    RoleType,
    Solution,
    TestCase,
    User
} from "@prisma/client";
import {NextFunction, Request, Response} from "express";
import path from "path";
import {PathLike, promises as fs} from "fs";
import git, {ReadBlobResult} from "isomorphic-git";
import {Commit} from "codetierlist-types";
import {
    onNewProfSubmission,
    onNewSubmission,
    onNewTestCase
} from "./updateScores";

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
export function isProf(course: Course & {
    roles: Array<{
        user: User
        type: RoleType
    }>
}, user: {
    utorid: string,
    admin?: boolean
}) {
    return user.admin === true || course.roles.some(role => role.user.utorid === user.utorid && ([RoleType.INSTRUCTOR, RoleType.TA] as RoleType[]).includes(role.type));
}

const commitFiles = async (req: Request, object: Omit<TestCase | Solution, 'datetime' | 'id'>, table: "solution" | "testCase") => {
    const repoPath = path.resolve(`/repos/${object.course_id}/${object.assignment_title}/${object.author_id}_${table}`);
    const status = await git.statusMatrix({fs, dir:repoPath});
    if (status.every(x=>x[2]==1)) {
        return null;
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

        const data = {
            git_id: commit,
            git_url: repoPath,
            course_id: req.course!.id,
            assignment_title: req.assignment!.title,
            author_id: req.user.utorid
        };
        if (table === "solution") {
            const solution = await prisma.solution.create({data});
            if (isProf(req.course!, req.user)) {
                void onNewProfSubmission(solution, req.assignment!);
            } else {
                void onNewSubmission(solution, req.assignment!);
            }
        } else {
            const testCase = await prisma.testCase.create({data});
            onNewTestCase(testCase, req.assignment!).then();
        }
        return commit;
    } catch (e) {
        return null;
    }
};

const getObjectFromRequest = async (req: Request, table: "solution" | "testCase") => {
    let object: Solution | TestCase | null;
    const query1 = {
        where: {
            author_id: req.user.utorid,
            assignment_title: req.assignment!.title,
            course_id: req.course!.id,
        },
        orderBy: {
            datetime: "desc"
        }
    };
    const query: typeof query1 & {
        where: {
            git_id?: string
        }
    } = query1;
    if (req.params.commitId) {
        query.where.git_id = req.params.commitId;
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
    // upload files
    const repoPath = path.resolve(`/repos/${req.course!.id}/${req.assignment!.title}/${req.user.utorid}_${table}`);

    // check if git repo exists
    let submission = await getObjectFromRequest(req, table);

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

    // commit files
    const commit =  await commitFiles(req, submission ?? {
        git_id: "",
        git_url: repoPath,
        course_id: req.course!.id,
        assignment_title: req.assignment!.title,
        author_id: req.user.utorid
    }, table);
    if (commit === null) {
        res.statusCode = 500;
        res.send({message: 'Failed to commit.'});
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
export const getCommit = async (submission: Solution | TestCase, commitId?: string | null) => {
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
            roles: req.user.admin ? {} : {some: {user: {utorid: req.user.utorid}}}
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
