import prisma from '../../../lib/prisma';
import {getUser} from "@/lib/apiUtils";

export async function POST(request: Request) {
    const user = await getUser(request);
    // TODO how do auth profs?
    const {name, code} = await request.json();
    const courseNumber = await prisma.course.count({where: {code}});
    if (courseNumber > 99) {
        return Response.json(JSON.stringify({error: 'Too many courses with this code.'}), {status: code});
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
            Role: {
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
            Role: {
                some: {
                    user: {utorid: user.utorid}
                }
            }
        }
    });
    return Response.json(courses);
}
