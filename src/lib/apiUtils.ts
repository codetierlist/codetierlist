import prisma from "@/lib/prisma";
import {$Enums, Course, User} from "@prisma/client";
import RoleType = $Enums.RoleType;

export async function getUser(request: Request) {
    const utorid = request.headers.get("utorid");
    const email = request.headers.get("http_mail");
    if (utorid === null || email === null) {
        throw new Error("No shibboleth headers found.");
    }
    return prisma.user.upsert({
        where: {utorid},
        create: {utorid, email},
        update: {utorid, email}
    });
}

export async function getCourse(courseId: string, user: {
    utorid: string
}) {
    return prisma.course.findUniqueOrThrow({
        where: {id: courseId, Role: {some: {user: {utorid: user.utorid}}}},
        include: {
            Role: {
                include: {
                    user: true
                }
            },
            assignments: true,
        }
    });
}

export function isEnrolled(course: {
    courseId: string,
    Role: {
        user: User,
        type: RoleType
    }[]
}, user: {
    utorid: string
}) {
    return course.Role.some(role => role.user.utorid === user.utorid);
}

export function isProf(course: Course & {
    Role: {
        user: User,
        type: RoleType
    }[]
}, user: {
    utorid: string
}) {
    return course.Role.some(role => role.user.utorid === user.utorid && ["INSTRUCTOR", "TA"].includes(role.type));
}

export function getAssignment(courseId: string, assignmentName: string) {
    return prisma.assignment.findUniqueOrThrow({
        where: {id: {course_id: courseId, title: assignmentName}},
        include: {
            submissions: {
                include: {scores: true, author: true},
            },
            course: true,
            test_cases: true
        }
    });
}