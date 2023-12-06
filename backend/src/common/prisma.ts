import {Prisma, PrismaClient} from '@prisma/client';

const client = new PrismaClient();

export const fetchedUserArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {roles: {include: {course: true}}}
});


export const fetchedCourseArgs = Prisma.validator<Prisma.CourseDefaultArgs>()({
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
        submissions: true,
        test_cases: true
    }
});

export const fullFetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
    include: {
        submissions: {
            distinct:"author_id",
            orderBy: {datetime:"desc"},
            include: {
                author: true,
                scores: {orderBy:{datetime:"desc"}, take:1}
            }
        },
        test_cases: {
            distinct:"author_id",
            orderBy: {datetime:"desc"},
            include: {
                author: true,
                scores: {orderBy:{datetime:"desc"}, take:1}
            }
        }
    }
});


export default client;
