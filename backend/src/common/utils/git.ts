import {
    onNewProfSubmission,
    onNewSubmission,
    onNewTestCase
} from "@/common/updateScores";
import {promises as fs} from "fs";
import path from "path";
import git from "isomorphic-git";
import {Commit, TestCase} from "codetierlist-types";
import {Solution} from "@prisma/client";
import {config} from "../config";
import logger from "../logger";
import prisma from "../prisma";
import {securePath} from "./index";

/**
 * Soft resets the staging area in a git repository to a specific commit.
 * @param repoPath the path to the repository
 * @param commit the commit to reset to
 */
const softResetRepo = async (repoPath: string, commit: string) => {
    let dir = await fs.readdir(repoPath);
    dir = dir.filter(x => x !== ".git").map(x => path.resolve(repoPath, x));
    await Promise.all(dir.map(x => fs.rm(x, {recursive: true, force: true})));
    await git.checkout({dir: repoPath, fs, ref: commit, force: true});
};

/**
 * Commits files to a users' git repo.
 * @param req the request
 * @param object the object to commit
 * @param table the repo to commit to. Either "solution" or "testCase"
 */
export const commitFiles = async (object: Omit<TestCase | Solution, 'datetime' | 'id'>, table: "solution" | "testCase", prof : boolean) => {
    const repoPath = path.resolve(`/repos/${object.course_id}/${object.assignment_title}/${object.author_id}_${table}`);
    const status = await git.statusMatrix({fs, dir: repoPath});

    // no unstaged changes
    if (status.every(x => x[2] == 1)) {
        return {error: "No changes"};
    }
    // too many files added
    if (status.filter(x => x[2] !== 0).length > config.max_file_count
        && status.some(x => x[1] === 0)) {
        await softResetRepo(repoPath, object.git_id);
        return {error: "Too many files added"};
    }
    await git.add({fs, dir: repoPath, filepath: '.'});
    try {
        const commit = await git.commit({
            fs,
            dir: repoPath,
            message: 'Update files via file upload',
            author: {
                name: object.author_id,
                email: "noreply@codetierlist.utm.utoronto.ca"
            }
        });

        const data: Omit<TestCase | Solution, 'datetime' | 'id'> = {
            git_id: commit,
            git_url: repoPath,
            course_id: object.course_id,
            assignment_title: object.assignment_title,
            author_id: object.author_id,
            group_number: object.group_number === -1 ? null : object.group_number
        };
        if (table === "solution") {
            const solutionAssignment = await prisma.solution.create({data, include: {assignment: true}});
            const solution : Optional<typeof solutionAssignment, "assignment"> = solutionAssignment;
            const assignment = solutionAssignment.assignment;
            delete solution.assignment;
            if (prof) {
                await onNewProfSubmission(solution, assignment);
            } else {
                await onNewSubmission(solution, assignment);
            }
        } else {
            const testCaseAssignment = await prisma.testCase.create({data, include: {assignment: true}});
            const testCase : Optional<typeof testCaseAssignment, "assignment"> = testCaseAssignment;
            const assignment = testCaseAssignment.assignment;
            delete testCase.assignment;
            await onNewTestCase(testCase, assignment);
        }
        return commit;
    } catch (e) {
        logger.error(e);
        return null;
    }
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

/**
 * get a file from a commit
 *
 * @param file the file to get
 * @param dir the directory to get the file from
 * @param commitId the commit to get the file from
 */
export const getFile = async (file: string, dir: string, commitId: string) => {
    try {
        return git.readBlob({
            fs,
            dir: dir,
            oid: commitId,
            filepath: securePath(file)
        });
    } catch (e) {
        return null;
    }
};