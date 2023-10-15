import prisma from "@/lib/prisma";
import {getUser} from "@/lib/apiUtils";

// TODO middleware to check if user is enrolled in course
export async function GET(request: Request, {params}: {
    params: { courseId: string }
}) {
    const user = await getUser(request);
    const {courseId} = params;

    const course = await prisma.course.findUnique({
        where: {id: courseId, Role: {some: {user: {utorid: user.utorid}}}},
        include: {
            // TODO should students be able to see all other students?
            Role: {
                include: {
                    user: true
                }
            },
            assignments: true,
        }
    });
    return Response.json(course);
}