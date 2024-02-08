import {Prisma} from "@prisma/client";

const fetchedUserArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
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


const fetchedCourseArgs = Prisma.validator<Prisma.CourseDefaultArgs>()({
    include: {
        assignments: {
            where: {
                hidden: false
            }
        }
    }
});

const fetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
    include: {}
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
        course: true
    }
});

export type Assignment = Omit<Prisma.AssignmentGetPayload<{}>, "due_date"> & {
    due_date?: string
};
export type Course = Prisma.CourseGetPayload<{}>;
export type User = Prisma.UserGetPayload<{}>;
export type _Submission = Prisma.SolutionGetPayload<{}>;
export type Score = Prisma.ScoreGetPayload<{}>;
export type Role = Prisma.RoleGetPayload<{}>;
export type _TestCase = Prisma.TestCaseGetPayload<{}>;
const test: TestCase;
export type TestCaseStatus = typeof test.valid;

export type FetchedUser = Prisma.UserGetPayload<typeof fetchedUserArgs>;
export type FetchedCourse = Prisma.CourseGetPayload<typeof fetchedCourseArgs>;
export type FetchedAssignment =
    Omit<Prisma.AssignmentGetPayload<typeof fetchedAssignmentArgs>, "due_date">
    & { due_date?: string };
export type FullFetchedAssignment = Prisma.AssignmentGetPayload<typeof fullFetchedAssignmentArgs>;
export type Submission = _Submission;
export type TestCase = _TestCase;
export type FrontendSubmission = Omit<_Submission, "group_number"> & { group_number?: number | null};
export type FrontendTestCase = Omit<_TestCase, "group_number"> & { group_number?: number | null};
export type UserFetchedAssignment = Prisma.AssignmentGetPayload<> & { tier: UserTier, view_tierlist: boolean } & {
    due_date?: string,
    submissions: Submission[],
    test_cases: TestCase[],
};
export type AssignmentWithTier = Assignment & { tier: UserTier };
export type FetchedAssignmentWithTier = FetchedAssignment & { tier: UserTier };
export type FetchedCourseWithTiers = Omit<FetchedCourse, "assignments"> & {
    assignments: Omit<AssignmentWithTier, "group_size">[]
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

export type RunnerImage = { runner_image: string, image_version: string };

type JobFiles = {
    [key: string]: string
}

export type ReadyJobData = {
    image: RunnerImage,
    testCase: TestCase,
    submission: Submission,
    query: { solution_files: JobFiles, test_case_files: JobFiles }
} | {status: "WAITING_FILES" | "COMPLETED"}

export type PendingJobData = {
    image: RunnerImage,
    testcaseId: string,
    testcaseAuthorId: string,
    submissionId: string,
    submissionAuthorId: string,
}
export type ParentJobData = {
    item: Submission | TestCase,
    type: "submission" | "testcase",
    status: ParentJobStatus
}

export type ParentJobStatus = "WAITING_FILES" | "READY" | "COMPLETED"

enum _JobStatus {
    /** passed all test cases */
    PASS = "PASS",
    /** fails at least one test case */
    FAIL = "FAIL",
    /** code error, server error, or timeout */
    ERROR = "ERROR",
    /** submission is empty */
    SUBMISSION_EMPTY = "SUBMISSION_EMPTY",
    /** test case is empty */
    TESTCASE_EMPTY = "TESTCASE_EMPTY",
}

/**
 * Status of a job
 */
export type JobStatus = `${_JobStatus}`;

export type JobResult =
    ({
        status: "PASS",
        /** amount of test cases & amount passed */
        amount: number
    } |
        {
            status: "FAIL",
            /** total test cases amount */
            amount: number,
            /** amount of test cases passed */
            score: number,
            /** list of failed test case info */
            failed: string[]
        } |
        {
            status: "ERROR" | "SUBMISSION_EMPTY" | "TESTCASE_EMPTY"
        } | {
        status: "ERROR",
        error: string
    }) & {
    status: JobStatus
}


export type AssignmentStudentStats = (Omit<User, "admin" | "theme" | "new_achievements"> & {
    tier: Tier,
    testsPassed: number,
    totalTests: number,
})[]


export type AchievementConfig = {
    id: number,
    name: string,
    description: string,
    icon: string,
    config: object,
    type: string,
    depends_on: number
}
export type Achievement = Prisma.AchievementGetPayload<{}>;

export type BackendConfig = {
    achievements: AchievementConfig[],
    runners: RunnerImage[],
}
