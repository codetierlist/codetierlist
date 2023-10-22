import {getAssignment, getUser} from "@/lib/apiUtils";
import prisma from "@/lib/prisma";
import git from 'isomorphic-git';
import fs from "fs";

export async function GET(request: Request, {params}: {
    params: {
        assignment: string,
        courseId: string,
        submissionId: string
    }
}) {
    const {assignment, courseId, submissionId} = params;
    const user = await getUser(request);
    const assignmentObj = await getAssignment(courseId, assignment);
    const course = assignmentObj.course;

    const submission = await prisma.solution.findUnique({
        where: {
            id: {
                author_id: user.utorid,
                assignment_title: assignmentObj.title,
                course_id: course.id
            }
        }
    });

    if (submission === null) {
        return Response.json(JSON.stringify({error: "Submission not found."}), {status: 404});
    }

    const commit = await git.readCommit({
        fs,
        dir: submission.git_url,
        oid: submissionId
    });

    if (commit === null) {
        return Response.json(JSON.stringify({error: "Commit not found."}), {status: 404});
    }

    const files = await git.listFiles({
        fs,
        dir: "./repo",
        ref: commit.oid
    });

    const log = await git.log({fs, dir: "./repo"})
    return Response.json({files, log: log.map(commit => commit.oid)});
}
