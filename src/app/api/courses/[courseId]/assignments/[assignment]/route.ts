import prisma from "@/lib/prisma";
import {getCourse, getUser, isProf} from "@/lib/apiUtils";

export async function GET(request: Request, {params}: {
    params: {
        courseId: string,
        assignment: string
    }
}) {
    const course = await getCourse(params.courseId, await getUser(request));
    if (course === null){
        throw new Error("Course not found");
    }
    const user = await getUser(request);
    const {courseId, assignment: assignmentName} = params;
    const assignment = await prisma.assignment.findUnique({
        where: {id:{course_id: courseId, title: assignmentName}},
        include: {
            submissions: {
                include: {scores: true},
                where: isProf(course, user) ? {} : {
                    author: {utorid: user.utorid}
                }
            }
        }
    });
    if (assignment === null) {
        return Response.json(JSON.stringify({error: "Assignment not found."}), {status: 404});
    }
    return Response.json(assignment);
}
