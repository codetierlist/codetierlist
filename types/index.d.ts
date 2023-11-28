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

const fetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
    include: {
        submissions: true,
        test_cases: true
    }
});

const fullFetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
    include: {
        submissions: {
            include: {
                author: true,
                scores: true
            }
        },
        test_cases: {
            include: {
                author: true,
                scores: true
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
    log: string[],
}

export type Tier = "S" | "A" | "B" | "C" | "D" | "F";
export type UserTier = Tier | "?"
export type TierlistEntry = { name: string, you: boolean }
export type Tierlist = Record<Tier, TierlistEntry[]>;

export {RoleType};


// socket types
export interface ServerToClientEvents {
    job: (data: {
        submission: Submission,
        testCase: TestCase,
        submissionFiles: Buffer[],
        testCaseFiles: Buffer[],
    }, callback: (e: number) => void) => void,
}

export interface ClientToServerEvents {
}

export interface InterServerEvents {
}

export interface SocketData {
}