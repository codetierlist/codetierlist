import prisma from "@/lib/prisma";
import {getUser, isProf} from "@/lib/apiUtils";
import {Role, RoleType} from ".prisma/client";
import {User} from "@prisma/client";
import { Optional } from "@prisma/client/runtime/library";

// TODO middleware to check if user is enrolled in course
export async function GET(request: Request, {params}: {
    params: { courseId: string }
}) {
    const user = await getUser(request);
    const {courseId} = params;

    const course = await prisma.course.findUnique({
        where: {id: courseId, role: {some: {user: {utorid: user.utorid}}}},
        include: {
            // TODO should students be able to see all other students?
            role: {
                include: {
                    user: true
                }
            },
            assignments: true,
        }
    });
    if (course === null) {
        return Response.json(JSON.stringify({error: "Course not found."}), {status: 404});
    }
    const res: Optional<typeof course, "role"> = course;
    if (!isProf(course, user)) {
        delete res.role;
    }
    return Response.json(course);
}

export async function DELETE(request: Request, {params}: {
    params: { courseId: string }
}) {
    const user = await getUser(request);
    const {courseId} = params;
    try {
        await prisma.course.delete({
            where: {
                id: courseId,
                role: {
                    some: {
                        user: {utorid: user.utorid},
                        type: RoleType.INSTRUCTOR
                    }
                }
            }
        });
        return Response.json(JSON.stringify({success: true}));
    } catch (e) {
        return Response.json(JSON.stringify({error: 'You are not an instructor in this course.'}), {status: 403});
    }


}