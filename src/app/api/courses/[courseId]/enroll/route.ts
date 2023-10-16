import prisma from "@/lib/prisma";
import {getCourse, getUser} from "@/lib/apiUtils";
import {$Enums} from ".prisma/client";
import RoleType = $Enums.RoleType;

export async function POST(request: Request, {params}: {
    params: { courseId: string }
}) {
    const {courseId} = params;
    const {utorids}: { utorids: string[] } = await request.json();
    if (!utorids || !Array.isArray(utorids)) {
        return Response.json(JSON.stringify({error: 'utorids must be an array of strings.'}), {status: 400});
    }
    const user = await getUser(request);
    const course = await getCourse(courseId, user);

    await prisma.role.createMany({
        data: utorids.map(utorid => ({
            type: RoleType.STUDENT,
            course_id: courseId,
            user_id: utorid
        })),
        skipDuplicates: true
    });

    return Response.json(course);
}