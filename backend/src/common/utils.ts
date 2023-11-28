import prisma, {fetchedAssignmentArgs, fetchedCourseArgs} from "./prisma";
import {
    Assignment as PrismaAssignment,
    Course,
    RoleType,
    User
} from "@prisma/client";
import {NextFunction, Request, Response} from "express";
import path from "path";
import Path from "path";
import {promises as fs} from "fs";
import git from "isomorphic-git";
import {Commit, Submission, TestCase} from "codetierlist-types";
import {onNewSubmission, onNewTestCase} from "../api/runner/updateScores";

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
    utorid: string
}) {
    return course.roles.some(role => role.user.utorid === user.utorid && ([RoleType.INSTRUCTOR, RoleType.TA] as RoleType[]).includes(role.type));
}


export const processSubmission = async (req: Request, table: "solution" | "testCase") => {
    // upload files
    const repoPath = path.resolve(`/repos/${req.course!.id}/${req.assignment!.title}/${req.user.utorid}_${table}`);

    // create folder if it doesnt exist
    await fs.mkdir(repoPath, {recursive: true});

    // check if git repo exists
    const query = {
        where: {
            _id: {
                author_id: req.user.utorid,
                assignment_title: req.assignment!.title,
                course_id: req.course!.id
            }
        }
    };
    let submission: TestCase | Submission | null = null;
    if (table === "solution") {
        submission = await prisma.solution.findUnique(query);
    } else {
        submission = await prisma.testCase.findUnique(query);
    }

    if (submission === null) {
        await git.init({fs, dir: repoPath});
    }

    // get files from form data
    for (const file of req.files!) {
        if (file === null) continue;
        await fs.copyFile(file.path, `${repoPath}/${file.filename}`);
    }


    await git.add({fs, dir: repoPath, filepath: '.'});

    const commit = await git.commit({
        fs,
        dir: repoPath,
        message: 'Update files via file upload',
        author: {
            name: req.user.utorid,
            email: req.user.email
        }
    });
    const upset = {
        where: {
            _id: {
                author_id: req.user.utorid,
                assignment_title: req.assignment!.title,
                course_id: req.course!.id
            }
        },
        create: {
            git_id: commit,
            git_url: repoPath,
            course_id: req.course!.id,
            assignment_title: req.assignment!.title,
            author_id: req.user.utorid
        },
        update: {
            git_id: commit
        }
    };

    if (table === "solution") {
        const result = await prisma.solution.upsert(upset);
        await onNewSubmission(result);
    } else {
        const result = await prisma.testCase.upsert(upset);
        await onNewTestCase(result);
    }

    return commit;
};


export const getCommit = async (submission: Submission | TestCase, commitId?: string | null) => {
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

    let files = null;

    try {
        files = await git.listFiles({
            fs,
            dir: submission.git_url,
            ref: commit.oid
        });
    } catch (e: unknown) {
        // listFiles throws an error if the commit is not found
        // https://github.com/isomorphic-git/isomorphic-git/blob/90ea0e34f6bb0956858213281fafff0fd8e94309/src/api/listFiles.js#L33
        return null;
    }

    try {
        const log = await git.log({fs, dir: submission.git_url});
        return {files, log: log.map(commitIterator => commitIterator.oid)};
    } catch (e: unknown) {
        // log throws an error if the commit is not found
        // https://github.com/isomorphic-git/isomorphic-git/blob/90ea0e34f6bb0956858213281fafff0fd8e94309/src/api/log.js#L38
        return null;
    }
};

/**
 * Gets a commit from a submission.
 *
 * @param req the request
 * @param table the table to get the commit from. Either "solution" or "testCase"
 * @returns the commit or null if it does not exist
 */
export const getCommitFromRequest = async (req: Request, table: "solution" | "testCase"): Promise<Commit | null> => {
    const query = {
        where: {
            _id: {
                author_id: req.user.utorid,
                assignment_title: req.assignment!.title,
                course_id: req.course!.id
            }
        }
    };

    let submission: TestCase | Submission | null;

    if (table === "solution") {
        submission = await prisma.solution.findUnique(query);
    } else {
        submission = await prisma.testCase.findUnique(query);
    }

    if (submission === null) {
        return null;
    }

    return await getCommit(submission, req.params.commitId);
};

export const fetchCourseMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const course = await prisma.course.findUnique({
        where: {id: req.params.courseId},
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
                title: req.params.assignment.replace("_", " "),
                course_id: req.params.courseId
            }
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

type JobFiles = { [key: string]: string }
export const getFiles = async (submission: Submission | TestCase): Promise<JobFiles> => {
    const res: JobFiles = {};
    const commit = await getCommit(submission);
    if (!commit) {
        throw new Error("Commit not found in runner");
    }
    await Promise.all(commit.files.map(async (x) => {
        res[x] = await fs.readFile(Path.resolve(submission.git_url, x), {encoding: 'base64'});
    }));
    return res;
};

