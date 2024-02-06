import {
    Assignment, RunnerImage,
    Submission, TestCase
} from "codetierlist-types";
import prisma from "./prisma";
import {
    bulkQueueTestCases,
    JobType,
    queueJob,
    removeSubmission,
    removeTestcases
} from "./runner";
import {RoleType} from "@prisma/client";
import {publish} from "./achievements/eventHandler";

/**
 * Log the score of a submission vs a testcase
 * @param submission
 * @param testCase
 * @param pass
 */
export const updateScore = (submission: Submission, testCase: TestCase, pass: boolean) =>
    prisma.score.create({
        data: {
            pass,
            course_id: submission.course_id,
            assignment_title: submission.assignment_title,
            solution_author_id: submission.author_id,
            testcase_author_id: testCase.author_id,
            solution_commit_id: submission.git_id,
            testcase_commit_id: testCase.git_id
        }
    });

export const onNewSubmission = async (submission: Submission, image: Assignment) => {
    publish("solution:submit", submission);
    await removeSubmission(submission.author_id);

    const testCases = await prisma.testCase.findMany({
        where: {
            course_id: submission.course_id,
            assignment_title: submission.assignment_title,
            valid: "VALID",
            group_number: submission.group_number
        },
        orderBy: {datetime: "desc"},
        distinct: "author_id",
    });

    // await Promise.all(testCases.map(testCase => queueJob({
    //     submission: submission,
    //     testCase,
    //     image
    // }, JobType.testSubmission)));
    await bulkQueueTestCases(image, submission, testCases);
};
/**
 * When the prof submits a new submission, run it against all test cases
 * @param submission
 * @param image
 */
export const onNewProfSubmission = async (submission: Submission, image: Assignment | RunnerImage) => {
    await removeSubmission(submission.author_id);

    const testCases = await prisma.testCase.findMany({
        where: {
            course_id: submission.course_id,
            assignment_title: submission.assignment_title,
        },
        orderBy: {datetime: "desc"},
        distinct: "author_id",
    });

    await Promise.all(testCases.map(testCase => queueJob({
        submission: submission,
        testCase,
        image
    }, JobType.validateTestCase, 5)));
};

/**
 * Run a test case against all student submissions
 * @param testCase the test case to run
 * @param image the runner config to run the test case against
 */
export const runTestcase = async (testCase: TestCase, image: Assignment | RunnerImage) => {
    // find all student submissions
    const submissions = await prisma.solution.findMany({
        where: {
            course_id: testCase.course_id,
            assignment_title: testCase.assignment_title,
            group_number: testCase.group_number,
            author: {
                roles: {
                    some: {
                        course_id: testCase.course_id,
                        type: RoleType.STUDENT
                    }
                }
            }
        },
        orderBy: {datetime: "desc"},
        distinct: "author_id",
    });
    // for every student submission, run the test case, and update the score
    // await Promise.all(submissions.map(s => queueJob({
    //     submission: s,
    //     testCase,
    //     image: image
    // }, JobType.testSubmission, 5)));
    await bulkQueueTestCases(image, testCase, submissions);
};

/**
 * When a new test case is added, test it and run it against all student submissions
 * @param testCase the test case to test
 * @param image the runner config to run the test case against
 */
export const onNewTestCase = async (testCase: TestCase, image: Assignment | RunnerImage) => {
    // a valid test case should
    // 1. not error or timeout against a valid submission
    // 2. pass a valid submission
    // 3. fail starter code
    publish("testcase:submit", testCase);
    await removeTestcases(testCase.author_id);

    // checks condition 1
    const profSubmission = await prisma.solution.findFirst({
        where: {
            course_id: testCase.course_id,
            assignment_title: testCase.assignment_title,
            author: {
                roles: {
                    some: {
                        course_id: testCase.course_id,
                        type: {in: [RoleType.INSTRUCTOR, RoleType.TA]}
                    }
                }
            }
        }, orderBy: {datetime: "desc"}, take: 1
    });
    if (profSubmission) {
        await queueJob({
            submission: profSubmission,
            testCase,
            image
        }, JobType.validateTestCase, 5);
    } else {
        await prisma.testCase.update({
            where: {
                id: testCase.id
            }, data: {valid: "VALID"}
        });
        await runTestcase(testCase, image);
    }
};
