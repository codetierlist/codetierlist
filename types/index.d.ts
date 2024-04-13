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

export type Assignment = Omit<Omit<Prisma.AssignmentGetPayload<{}>, "due_date"> & {
    due_date?: string
}, "group_size">;
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
export type FrontendSubmission = Omit<_Submission, "group_number"> & {
    group_number?: number | null
};
export type FrontendTestCase = Omit<_TestCase, "group_number"> & {
    group_number?: number | null
};
export type UserFetchedAssignment = Assignment & {
    tier: UserTier,
    view_tierlist: boolean
} & {
    due_date?: string,
    submissions: Omit<Submission, "group_number">[],
    test_cases: Omit<TestCase, "group_number" | "validation_result" | "coverage">[],
};

export type AssignmentWithTier = Assignment & { tier: UserTier };
export type FetchedAssignmentWithTier = FetchedAssignment & { tier: UserTier };
export type FetchedCourseWithTiers = Omit<FetchedCourse, "assignments"> & {
    assignments: Omit<AssignmentWithTier, "group_size">[]
};

/**
 * a git commit for a submission
 */
export type Commit = {
    files: string[],
    valid?: TestCaseStatus,
    validation_result?: JobResult,
    log: { id: string, date: number }[],
}

/**
 * the tier of a user for an assignment
 */
export type Tier = "S" | "A" | "B" | "C" | "D" | "F";

/**
 * the tier of a user for an assignment, includes "?" if
 * the user has not been assigned a tier
 */
export type UserTier = Tier | "?"

/**
 * an entry for a user in a tierlist
 */
export type TierlistEntry = {
    /** the name of the user (typically just the initials) */
    name: string,
    /** whether the user is the current user */
    you: boolean,
    /** the utorid of the user (typically empty for privacy) */
    utorid: string
}

/**
 * a tierlist for an assignment
 */
export type Tierlist = Record<Tier, TierlistEntry[]>;

/**
 * a session of the course
 */
export type Session = Course["session"]

const role: Role;
export type RoleType = typeof role.type

const user: User;

/**
 * the theme selection of the user
 */
export type Theme = typeof user.theme;

/**
 * A runner image, relative to the images folder in the runner project
 */
export type RunnerImage = { runner_image: string, image_version: string };

type JobFiles = {
    [key: string]: string
}

export type ReadyJobData = {
    image: RunnerImage,
    testCase: TestCase,
    submission: Submission,
    query: { solution_files: JobFiles, test_case_files: JobFiles }
} | { status: "WAITING_FILES" | "COMPLETED" }

export type PendingJobData = {
    image: RunnerImage,
    testcaseId: string,
    testcaseAuthorId: string,
    testcaseDatetime: Date,
    courseId: string,
    assignmentTitle: string,
    submissionId: string,
    submissionAuthorId: string,
    submissionDatetime: Date,
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
type CoverageSummary = {
    covered_lines:           number;
    num_statements:          number;
    percent_covered:         number;
    percent_covered_display: string;
    missing_lines:           number;
    excluded_lines:          number;
}

type CoverageReport = {
    meta: {
        version: string;
        timestamp: string;
        branch_coverage: boolean;
        show_contexts: boolean;
    }
    files: {
        [file: string]: {
            executed_lines: number[];
            summary: CoverageSummary;
            missing_lines: number[];
            excluded_lines: any[];
        }
    };
    totals: CoverageSummary;
}

/**
 * A job result from the runner
 */
export type JobResult =
    ({
        status: "PASS",
        /** amount of test cases & amount passed */
        amount: number,
        /** the coverage report */
        coverage: CoverageReport | null,
    } |
        {
            status: "FAIL",
            /** total test cases amount */
            amount: number,
            /** amount of test cases passed */
            score: number,
            /** list of failed test case info */
            failed: string[],
            /** the coverage report */
            coverage: CoverageReport | null,
        } |
        {
            status: "ERROR" | "SUBMISSION_EMPTY" | "TESTCASE_EMPTY"
        } | {
        status: "ERROR",
        error: string
    }) & {
    status: JobStatus
}


export type AssignmentStudentStat = (Omit<User, "admin" | "theme" | "new_achievements" | "accent_color"> & {
    tier: Tier,
    testsPassed: number,
    totalTests: number,
    groupNumber: number | null,
});

export type AssignmentStudentStats = AssignmentStudentStat[];


export type AchievementConfig = {
    /** the unique id of the achievement, -1 if hidden */
    id: number,
    /** the name of the achievement */
    name: string,
    /** the description of the achievement */
    description: string,
    /** the icon of the achievement, relative to the public folder in frontend*/
    icon: string,
    /** the config of the achievement */
    config: object,
    /** the type of the achievement */
    type: string,
    /** id of the achievement that this achievement depends on */
    depends_on: number
}

export type Achievement = Prisma.AchievementGetPayload<{}>;

/** the config of the backend */
export type BackendConfig = {
    /** the list of achievements */
    achievements: AchievementConfig[],
    /** the list of runner images */
    runners: RunnerImage[],
}

/** the config of the limits */
export type LimitsConfig = {
    /** The maximum file size in bytes */
    max_file_size: number,
    /** The maximum file count */
    max_file_count: number,
    /** The maximum number of CPU seconds that each container can use */
    max_seconds: number,
    /** The maximum memory with unit */
    max_memory: string,
    /** The memory swap with unit. If the value is the same as max_memory, swap is disabled */
    max_memory_swap: string,
    /** The maximum percentage of CPU that each container can use (e.g., 0.5 for 50%) */
    max_cpu: number,
}
