import {getAssignment, getCourse, getUser} from "@/lib/apiUtils";
import * as fs from "fs";
import nodegit from "nodegit";
import path from "path";
import prisma from "@/lib/prisma";

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
    const repoPath = path.resolve(`./repos/${course.id}/${assignment}/${user.utorid}`);

    // create folder if it doesnt exist
    await new Promise<undefined>((res, rej) => fs.mkdir(repoPath, {recursive: true}, (err) => {
        if (err) rej(err);
        res(undefined);
    }));

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
    let repo: nodegit.Repository;
    if (submission !== null) {
        // update submission
        repo = await nodegit.Repository.open(submission.git_url);
    } else {
        repo = await nodegit.Repository.init(repoPath, 0);
    }


    const index = await repo.refreshIndex();
    await index.addAll();
    await index.write();
    const author = nodegit.Signature.now(user.utorid, user.email);
    const committer = nodegit.Signature.now(user.utorid, user.email);
    const oid = await index.writeTree();
    const parent = await repo.getHeadCommit();
    const commit = await repo.createCommit("HEAD", author, committer, "Initial commit", oid, [parent]);

    // create submission
    if (submission === null) {
        await prisma.solution.create({
            data: {
                git_url: repo.path(),
                git_id: commit.tostrS(),
                assignment_title: assignmentObj.title,
                course_id: course.id,
                author_id: user.utorid
            }
        });
    } else {
        await prisma.solution.update({
            where: {
                id: {
                    author_id: user.utorid,
                    assignment_title: assignmentObj.title,
                    course_id: course.id
                }
            },
            data: {
                git_url: repo.path(),
                git_id: commit.tostrS(),
            }
        });
    }
    return Response.json({success: true});
}