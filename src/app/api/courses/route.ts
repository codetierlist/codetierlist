import prisma from '../../../lib/prisma';
import {getUser} from "@/lib/apiUtils";

export async function POST(request: Request) {
    const user = await getUser(request);
    if(!user.admin){
        return Response.json(JSON.stringify({error: 'You are not an admin.'}), {status: 403});
    }
    const {name, code} = await request.json();
    if (typeof name !== "string" || typeof code !== "string") {
        return Response.json(JSON.stringify({error: 'Invalid body.'}), {status: 400});
    }
    const oldCourse = await prisma.course.findFirst({orderBy: {id: "desc"}});
    let courseNumber =  oldCourse ? parseInt(oldCourse.id.split("-")[1]) + 1: 0;
    if (courseNumber > 99) {
        return Response.json(JSON.stringify({error: 'Too many courses with this code.'}), {status: 409});
    }
    const id = code + "-" + courseNumber;

    const course = await prisma.course.create({
        data: {
            id,
            name,
            code
        }
    });

    await prisma.course.update({
        where: {id},
        data: {
            role: {
                create: {
                    user: {connect: {utorid: user.utorid}},
                    type: "INSTRUCTOR"
                }
            }
        }
    });
    return Response.json(course, {status: 201});
}

export async function GET(request: Request) {
    const user = await getUser(request);
    const courses = await prisma.course.findMany({
        where: {
            role: {
                some: {
                    user: {utorid: user.utorid}
                }
            }
        }
    });
    return Response.json(courses);
}
