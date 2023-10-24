import { getAssignment, getUser } from '@/lib/apiUtils';
import prisma from '@/lib/prisma';
import fs from 'fs';
import git from 'isomorphic-git';
import path from 'path';

/**
 * Submits a solution to an assignment.
 * @returns {Promise<Response>} success or error
 */
export async function POST (request: Request, { params }: {
  params: {
    /** title of the assignment */
    courseId: string

    /** id of the course */
    assignment: string
  }
}) {
    const { courseId, assignment } = params;
    const user = await getUser(request);
    const assignmentObj = await getAssignment(courseId, assignment);
    const course = assignmentObj.course;

    // upload files
    const repoPath = path.resolve(`./repos/${course.id}/${assignment}/${user.utorid}`);

    // create folder if it doesnt exist
    await new Promise<undefined>((res, rej) => {
        fs.mkdir(repoPath, { recursive: true }, (err) => {
            if (err) rej(err);
            res(undefined);
        });
    });

    // check if git repo exists
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
        await git.init({ fs, dir: repoPath });
    }

    // get files from form data
    const formData = await request.formData();
    const formDataEntryValues = Array.from(formData.values());
    for (const formDataEntryValue of formDataEntryValues) {
        if (formDataEntryValue === null) continue;
        if (typeof formDataEntryValue === 'object' && 'arrayBuffer' in formDataEntryValue) {
            const file = formDataEntryValue as unknown as Blob;
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(`${repoPath}/${file.name}`, buffer);
        }
    }

    await git.add({ fs, dir: repoPath, filepath: '.' });

    const commit = await git.commit({
        fs,
        dir: repoPath,
        message: 'Update files via file upload'
    });

    await prisma.solution.upsert({
        where: {
            id: {
                author_id: user.utorid,
                assignment_title: assignmentObj.title,
                course_id: course.id
            }
        },
        create: {
            git_id: commit,
            git_url: repoPath,
            course_id: course.id,
            assignment_title: assignmentObj.title,
            author_id: user.utorid
        },
        update: {
            git_id: commit
        }
    });

    return Response.json({ success: true });
}
