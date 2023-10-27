import {Prisma} from "@prisma/client";

const fetchedUserArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {roles: {include: {course: true}}}
});

const fetchedCourseArgs = Prisma.validator<Prisma.CourseDefaultArgs>()({
    include: {
        roles: {
            include: {
                user: true
            }
        },
        assignments: true
    }
});

export const fetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
    include: {
        submissions: {
            include: {
                author: true,
                scores: true
            }
        }
    }
});

export type FetchedUser = Prisma.UserGetPayload<typeof fetchedUserArgs>;
export type FetchedCourse = Prisma.CourseGetPayload<typeof fetchedCourseArgs>;
export type FetchedAssignment = Prisma.AssignmentGetPayload<typeof fetchedAssignmentArgs>;