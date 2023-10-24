import { getAssignment, getUser } from '@/lib/apiUtils';
import prisma from '@/lib/prisma';
import git from 'isomorphic-git';
import fs from 'fs';

/**
 * Gets a submission for an assignment.
 * @returns {Promise<Response>} log of the git repository
 */
export async function GET (request: Request, { params }: {
  params: {
    /** title of the assignment */
    assignment: string

    /** id of the course */
    courseId: string

    /** git commit id of submission */
    submissionId: string
  }
}) {
    const { assignment, courseId, submissionId } = params;
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
        return Response.json(JSON.stringify({ error: 'Submission not found.' }), { status: 404 });
    }

    const commit = await git.readCommit({
        fs,
        dir: submission.git_url,
        oid: submissionId
    });

    if (commit === null) {
        return Response.json(JSON.stringify({ error: 'Commit not found.' }), { status: 404 });
    }

    const files = await git.listFiles({
        fs,
        dir: './repo',
        ref: commit.oid
    });

    const log = await git.log({ fs, dir: './repo' });
    return Response.json({ files, log: log.map(commitIterator => commitIterator.oid) });
}
