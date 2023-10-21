import {getAssignment, getCourse, getUser} from "@/lib/apiUtils";
import path from "path";
import prisma from "@/lib/prisma";
import {fs} from 'memfs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

export async function POST(request: Request, {params}: {
    params: {
        courseId: string,
        assignment: string
    }
}) {
    const {courseId, assignment} = params;
    const user = await getUser(request);
    const assignmentObj = await getAssignment(courseId, assignment);
    const course = assignmentObj.course;

    // upload files
    // const repoPath = path.resolve(`./repos/${course.id}/${assignment}/${user.utorid}`);
    const repoPath = path.resolve(`./repo`);
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
        // TODO create git repo on remote
        return;
    }

    await git.clone({
        fs,
        http,
        dir: repoPath,
        url: submission.git_url
    });

    // get files from form data
    const formData = await request.formData();
    const formDataEntryValues = Array.from(formData.values());
    for (const formDataEntryValue of formDataEntryValues) {
        if (formDataEntryValue === null) continue;
        if (typeof formDataEntryValue === "object" && "arrayBuffer" in formDataEntryValue) {
            const file = formDataEntryValue as unknown as Blob;
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(`${repoPath}/${file.name}`, buffer);
        }
    }

    const commit = await git.commit({
        fs,
        dir: repoPath,
        message: "Update files via file upload",
    })

    await prisma.solution.update({
        where: {
            id: {
                author_id: user.utorid,
                assignment_title: assignmentObj.title,
                course_id: course.id
            }
        },
        data: {
            git_id: commit,
        }
    });

    return Response.json({success: true});
}