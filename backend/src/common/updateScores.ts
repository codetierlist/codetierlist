import {Submission, TestCase} from "codetierlist-types";
import prisma from "./prisma";
import {queueJob, JobStatus} from "./runner";

const updateScore = (submission: Submission, testCase: TestCase, pass: boolean) =>
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

export const onNewSubmission = async (submission: Submission) => {
    const testCases = await prisma.testCase.findMany({
        where: {
            course_id: submission.course_id,
            assignment_title: submission.assignment_title,
            valid: "VALID"
        }
    });

    testCases.forEach(testCase => queueJob({
        submission: submission,
        testCase
    }).then(x => {
        // TODO not sure what the type of x is
        const pass = x.status === JobStatus.PASS;
        updateScore(submission, testCase, pass); // a blank pass or fail, but we have more data than that
    }));
};

export const onNewTestCase = async (testCase: TestCase) => {

    // a valid test case should
    // 1. not error or timeout against a valid submission
    // 2. pass a valid submission
    // 3. fail starter code

    // checks condition 1
    // const profSubmission = await prisma.solution.findFirst({
    //     where: {
    //         course_id: testCase.course_id,
    //         assignment_title: testCase.assignment_title,
    //         author: {
    //             roles: {
    //                 some: {
    //                     course_id: testCase.course_id,
    //                     type: {in: [RoleType.INSTRUCTOR, RoleType.TA]}
    //                 }
    //             }
    //         }
    //     }, orderBy: {datetime: "desc"}
    // });
    // try {
    //     const result = await queueJob({
    //         submission: profSubmission,
    //         testCase
    //     });
    //     if (!result || result.status === JobStatus.ERROR) {
    //         return; // TODO: inform user that the test case is invalid
    //     }
    // } catch (e) {
    //     return; // TODO: inform user that the test case is invalid
    // }

    // test case has been validated

    await prisma.testCase.update({
        where: {
            id: testCase.id
        }, data: {valid: "VALID"}
    });

    // find all student submissions
    const submissions = await prisma.solution.findMany({
        where: {
            course_id: testCase.course_id,
            assignment_title: testCase.assignment_title,
            author: {
                roles: {
                    some: {
                        course_id: testCase.course_id,
                        type: {in: ["STUDENT"]}
                    }
                }
            }
        }
    });

    // for every student submission, run the test case, and update the score
    submissions.forEach(submission => queueJob({
        submission: submission,
        testCase
    }).then(x => {
        const pass = x.status === JobStatus.PASS;
        updateScore(submission, testCase, pass); // a blank pass or fail, but we have more data than that
    }));
};