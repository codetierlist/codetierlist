import { Prisma, PrismaClient } from '@prisma/client';

const client = new PrismaClient();

export const fetchedUserArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {
        roles: {
            where: {
                course: {
                    hidden: false
                }
            },
            include: {
                course: true
            }
        }
    }
});

export const fetchedCourseArgs = Prisma.validator<Prisma.CourseDefaultArgs>()({
    include: {
        assignments: {
            where: {
                hidden: false
            }
        }
    }
});

export const fetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
    include: {}
});

// export const fullFetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
//     include: {
//         submissions: {
//             distinct: "author_id",
//             orderBy: {datetime: "desc"},
//             include: {
//                 author: true,
//                 scores: {
//                     orderBy: [{test_case: {datetime: "desc"}}, {datetime: "desc"}],
//                     distinct: "testcase_author_id",
//                     include: {test_case: true}
//                 }
//             }
//         },
//         course: true
//     }
// });

// export const scoreableGroupArgs = Prisma.validator<Prisma.GroupDefaultArgs>()({
//     include: {
//         solutions: {
//             distinct: "author_id",
//             orderBy: {datetime: "desc"},
//             select: {
//                 author_id: true,
//                 author: {
//                     select: {
//                         utorid: true,
//                         givenName: true,
//                         surname: true,
//                         email: true
//                     }
//                 },
//                 scores: {
//                     orderBy: [{test_case: {datetime: "desc"}}, {datetime: "desc"}],
//                     distinct: "testcase_author_id",
//                     where: {
//                         test_case: {
//                             valid: "VALID"
//                         }
//                     },
//                     select: {
//                         pass: true,
//                         test_case: {select: {
//                             id: true,
//                             valid: true,
//                         }}}
//                 },
//             }
//         }
//     }
// });

// export type ScoreableGroup = Prisma.GroupGetPayload<typeof scoreableGroupArgs>;

export default client;
