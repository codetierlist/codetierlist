import {Prisma} from "@prisma/client";

export const images : RunnerImage[] = [
    {image: 'python', image_version: 'unittest-3.10.11'},
    {image: 'python', image_version: 'unittest-3.12.1'},
    {image: 'python', image_version: 'pytest-3.10.11'},
];

export const fetchedUserArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {
        roles: {
            where: {
                course:{
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
        roles: {
            include: {
                user: true
            }
        },
        assignments: {
            where: {
                hidden: false
            }
        }
    }
});

const fetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
    include: {
        submissions: true,
        test_cases: true
    }
});

const fullFetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
    include: {
        submissions: {
            distinct: "author_id",
            orderBy: {datetime: "desc"},
            include: {
                author: true,
                scores: {
                    orderBy: [{test_case: {datetime: "desc"}}, {datetime: "desc"}],
                    distinct: "testcase_author_id",
                    include: {test_case: true}
                }
            }
        },
        course: {
            include: {
                roles: {
                    include: {
                        user: true
                    }
                }
            }
        }
    }
});

export type Assignment = Omit<Prisma.AssignmentGetPayload<{}>, "due_date"> & {
    due_date?: string
};
export type Course = Prisma.CourseGetPayload<{}>;
export type User = Prisma.UserGetPayload<{}>;
export type Submission = Prisma.SolutionGetPayload<{}>;
export type Score = Prisma.ScoreGetPayload<{}>;
export type Role = Prisma.RoleGetPayload<{}>;
export type TestCase = Prisma.TestCaseGetPayload<{}>;
const test: TestCase;
export type TestCaseStatus = typeof test.valid

export type FetchedUser = Prisma.UserGetPayload<typeof fetchedUserArgs>;
export type FetchedCourse = Prisma.CourseGetPayload<typeof fetchedCourseArgs>;
export type FetchedAssignment =
    Omit<Prisma.AssignmentGetPayload<typeof fetchedAssignmentArgs>, "due_date">
    & { due_date?: string };
export type FullFetchedAssignment = Prisma.AssignmentGetPayload<typeof fullFetchedAssignmentArgs>;
export type AssignmentWithTier = Assignment & { tier: UserTier };
export type FetchedAssignmentWithTier = FetchedAssignment & { tier: UserTier };
export type FetchedCourseWithTiers = Omit<FetchedCourse, "assignments"> & {
    assignments: AssignmentWithTier[]
};

export type Commit = {
    files: string[],
    valid?: TestCaseStatus,
    log: string[],
}

export type Tier = "S" | "A" | "B" | "C" | "D" | "F";
export type UserTier = Tier | "?"
export type TierlistEntry = { name: string, you: boolean, utorid: string }
export type Tierlist = Record<Tier, TierlistEntry[]>;

export type Session = "Fall" | "Winter" | "Summer"

const role: Role;
export type RoleType = typeof role.type

const user: User;
export type Theme = typeof user.theme;

export type RunnerImage = { image: string, image_version: string }

interface Job {
    submission: Submission,
    testCase: TestCase,
    assignment: Assignment
}

type JobFiles = {
    [key: string]: string
}

export type JobData = {
    query: {
        solution_files: JobFiles,
        test_case_files: JobFiles
    },
    img: string,
    img_ver: string
}

export enum JobStatus {
    PASS = "PASS", // passes all test cases
    FAIL = "FAIL", // fails at least one test case
    ERROR = "ERROR", // code error, server error, or timeout
    SUBMISSION_EMPTY="SUBMISSION_EMPTY",
    TESTCASE_EMPTY="TESTCASE_EMPTY",
}

export type JobResult =
    {
        status: JobStatus.PASS,
        amount: number // amount of testcases & amount passed
    } |
    {
        status: JobStatus.FAIL,
        amount: number // amount of testcases
        score: number // amount passed
        failed: string[] // list of failed testcase info
    } |
    {
        status: JobStatus.ERROR | JobStatus.SUBMISSION_EMPTY | JobStatus.TESTCASE_EMPTY
    };



export type AssignmentStudentStats = (Omit<User, "admin" | "theme"> & {
    tier: Tier,
    testsPassed: number,
    totalTests: number,
})[]
