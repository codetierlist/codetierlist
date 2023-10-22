import prisma from "@/lib/prisma";
import {getCourse, getUser} from "@/lib/apiUtils";
import {$Enums} from ".prisma/client";
import RoleType = $Enums.RoleType;

export async function POST(request: Request, {params}: {
    params: { courseId: string }
}) {
    const {courseId} = params;
    const {utorids, role}: { utorids: string[], role?: string } = await request.json();
    if(role !== undefined && !(Object.values(RoleType) as string[]).includes(role)){
        return Response.json(JSON.stringify({error: 'Invalid role.'}), {status: 400});
    }
    const newRole = role as RoleType | undefined ?? RoleType.STUDENT;
    if (!utorids || !Array.isArray(utorids)) {
        return Response.json(JSON.stringify({error: 'utorids must be an array of strings.'}), {status: 400});
    }
    const user = await getUser(request);
    const course = await getCourse(courseId, user);

    await prisma.role.createMany({
        data: utorids.map(utorid => ({
            type: newRole,
            course_id: courseId,
            user_id: utorid
        })),
        skipDuplicates: true
    });

    return Response.json(course);
}