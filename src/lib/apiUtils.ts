import prisma from '@/lib/prisma';
import { $Enums, type Course, type User } from '@prisma/client';
import { isUTORid, isUofTEmail } from 'is-utorid';
import RoleType = $Enums.RoleType

export async function getUser (request: Request) {
    const utorid = request.headers.get('utorid');
    const email = request.headers.get('http_mail');

    // header validation
    if (utorid === null || email === null) {
        throw new Error('No shibboleth headers found.');
    }
    if (!isUTORid(utorid)) {
        throw new Error('Invalid utorid.');
    }
    if (!isUofTEmail(email)) {
        throw new Error('Invalid email.');
    }

    return await prisma.user.upsert({
        where: { utorid },
        create: { utorid, email },
        update: { utorid, email }
    });
}

export async function getCourse (courseId: string, user: {
  utorid: string
}) {
    return await prisma.course.findUniqueOrThrow({
        where: { id: courseId, role: { some: { user: { utorid: user.utorid } } } },
        include: {
            role: {
                include: {
                    user: true
                }
            },
            assignments: true
        }
    });
}

export function isEnrolled (course: {
  courseId: string
  Role: Array<{
    user: User
    type: RoleType
  }>
}, user: {
  utorid: string
}) {
    return course.Role.some(role => role.user.utorid === user.utorid);
}

export function isProf (course: Course & {
  role: Array<{
    user: User
    type: RoleType
  }>
}, user: {
  utorid: string
}) {
    return course.role.some(role => role.user.utorid === user.utorid && ['INSTRUCTOR', 'TA'].includes(role.type));
}

export async function getAssignment (courseId: string, assignmentName: string) {
    return await prisma.assignment.findUniqueOrThrow({
        where: { id: { course_id: courseId, title: assignmentName } },
        include: {
            submissions: {
                include: { scores: true, author: true }
            },
            course: true,
            test_cases: true
        }
    });
}
