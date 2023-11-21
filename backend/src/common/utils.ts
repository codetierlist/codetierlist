import prisma, {fetchedAssignmentArgs, fetchedCourseArgs} from "./prisma";
import {
    Assignment as PrismaAssignment,
    Course,
    RoleType,
    Solution,
    TestCase,
    User
} from "@prisma/client";
import {NextFunction, Request, Response} from "express";
import path from "path";
import fs from "fs";
import git, {ReadBlobResult} from "isomorphic-git";
import {Commit} from "codetierlist-types";

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

const commitFiles = async (req: Request, object: Omit<TestCase | Solution, 'datetime'>, table: "solution" | "testCase") => {
    const repoPath = path.resolve(`/repos/${object.course_id}/${object.assignment_title}/${object.author_id}_${table}`);
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
        const upset = {
            where: {
                id: {
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
            await prisma.solution.upsert(upset);
        } else {
            await prisma.testCase.upsert(upset);
        }
        return commit;
    } catch (e) {
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
export const getCommit = async (req: Request, table: "solution" | "testCase"): Promise<Commit | null> => {
    const query = {
        where: {
            id: {
                author_id: req.user.utorid,
                assignment_title: req.assignment!.title,
                course_id: req.course!.id
            }
        }
    };

    let submission: TestCase | Solution | null;

    if (table === "solution") {
        submission = await prisma.solution.findUnique(query);
    } else {
        submission = await prisma.testCase.findUnique(query);
    }

    if (submission === null) {
        return null;
    }

    let commit = null;

    try {
        commit = await git.readCommit({
            fs,
            dir: submission.git_url,
            oid: req.params.commitId ?? submission.git_id
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
        const log = await git.log({ fs, dir: submission.git_url });
        return { files, log: log.map(commitIterator => commitIterator.oid) };
    } catch (e: unknown) {
        // log throws an error if the commit is not found
        // https://github.com/isomorphic-git/isomorphic-git/blob/90ea0e34f6bb0956858213281fafff0fd8e94309/src/api/log.js#L38
        return null;
    }
};

export const getFile = async (req: Request, res: Response, table: "solution" | "testCase") => {
    let object: Solution | TestCase | null;
    if (table === "solution") {
        object = await prisma.solution.findUnique({
            where: {
                id: {
                    author_id: req.user.utorid,
                    assignment_title: req.assignment!.title,
                    course_id: req.course!.id
                }
            }
        });
    } else {
        object = await prisma.testCase.findUnique({
            where: {
                id: {
                    author_id: req.user.utorid,
                    assignment_title: req.assignment!.title,
                    course_id: req.course!.id
                }
            }
        });
    }
    if (object === null) {
        res.statusCode = 404;
        res.send({error: 'Submission not found.'});
        return;
    }
    let file: ReadBlobResult | null = null;
    try {
        file = await git.readBlob({
            fs,
            dir: object.git_url,
            oid: req.params.commitId ?? object.git_id,
            filepath: req.params.file
        });
    } catch (e) { /* empty */
    }
    if (file === null) {
        res.statusCode = 404;
        res.send({error: 'Commit not found.'});
        return;
    }
    res.send(file.blob);
};

export const deleteFile = async (req: Request, res: Response, table: "solution" | "testCase") => {
    let object: Solution | TestCase | null;
    if (table === "solution") {
        object = await prisma.solution.findUnique({
            where: {
                id: {
                    author_id: req.user.utorid,
                    assignment_title: req.assignment!.title,
                    course_id: req.course!.id
                }
            }
        });
    } else {
        object = await prisma.testCase.findUnique({
            where: {
                id: {
                    author_id: req.user.utorid,
                    assignment_title: req.assignment!.title,
                    course_id: req.course!.id
                }
            }
        });
    }
    if (object === null) {
        res.statusCode = 404;
        res.send({error: 'Submission not found.'});
        return;
    }
    // TODO error handling
    await git.remove({fs, dir:object.git_url, filepath:req.params.file});
    await new Promise<void>(r => fs.unlink(`${object!.git_url}/${req.params.file}`, () => r()));
    const commit = await commitFiles(req, object, table);
    if (commit === null) {
        res.statusCode = 500;
        res.send({error: 'Failed to commit.'});
        return;
    }
    res.send({commit});
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
