import {getCourse, getUser} from "@/lib/apiUtils";
import prisma from "@/lib/prisma";
import {Prisma} from ".prisma/client";
import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

export async function POST(request: Request, {params}: {
    params: { courseId: string }
}) {
    const user = await getUser(request);
    const {courseId} = params;
    const course = await getCourse(courseId, user);
    if (course === null) {
        return Response.json(JSON.stringify({error: "You are not enrolled in this course."}), {status: 403});
    }
    const {name, dueDate, description} = await request.json();
    const due = new Date(dueDate);
    if (typeof name !== "string" || isNaN(dueDate) || typeof description !== "string" || name.length === 0 || description.length === 0) {
        return Response.json(JSON.stringify({error: "Invalid request."}), {status: 400});
    }
    try {
        const assignment = await prisma.assignment.create({
            data: {
                title: name,
                due_date: dueDate,
                description,
                course: {connect: {id: course.id}},
            }
        })
        return Response.json(assignment, {status: 201});
    } catch (e) {
        if ((e as PrismaClientKnownRequestError).code === "P2002") {
            return Response.json(JSON.stringify({error: "An assignment with this name already exists."}), {status: 400});
        } else {
            throw e;
        }
    }
}
