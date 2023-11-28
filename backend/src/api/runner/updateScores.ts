import {RoleType, Submission, TestCase} from "codetierlist-types";
import prisma from "../../common/prisma";
import {getJobQueue, queueJob} from "./index";

const cancelTestCase = (testCase: TestCase) => {
    getJobQueue().filter(x => x.job.testCase.id !== testCase.id).forEach(x => x.cancel());
};
const cancelSubmission = (submission:Submission) => {
    getJobQueue().filter(x => x.job.testCase.id !== submission.id).forEach(x => x.cancel());
};
const updateScore = (submission: Submission, testCase: TestCase, pass: boolean) =>
    prisma.score.upsert({
        where: {
            id: {
                course_id: submission.course_id,
                assignment_title: submission.assignment_title,
                solution_author_id: submission.author_id,
                testcase_author_id: testCase.author_id,
                solution_commit: submission.git_id,
                test_case_commit: testCase.git_id
            }
        },
        create: {
            pass,
            course_id: submission.course_id,
            assignment_title: submission.assignment_title,
            solution_author_id: submission.author_id,
            testcase_author_id: testCase.author_id,
            solution_commit: submission.git_id,
            test_case_commit: testCase.git_id
        },
        update: {
            pass
        }
    });

export const onNewSubmission = async (submission: Submission) => {
    cancelSubmission(submission);
    const testCases = await prisma.testCase.findMany({
        where: {
            course_id: submission.course_id,
            assignment_title: submission.assignment_title,
            valid: true
        }
    });

    testCases.forEach(testCase => queueJob({
        submission: submission,
        testCase
    }).then(x => {
        // TODO not sure what the type of x is
        const pass: boolean = x as boolean;
        updateScore(submission, testCase, pass);
    }));
};

export const onNewTestCase = async (testCase: TestCase) => {
    cancelTestCase(testCase);
    const profSubmissions = await prisma.solution.findMany({
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
        }
    });
    try {
        const map = await Promise.all(profSubmissions.map(submission => queueJob({
            submission: submission,
            testCase
            //TODO actually convert x to boolean
        }).then(x =>{console.log(x); return x as boolean;})));
        if (!map.every(x => x)) {
            return;
        }
    } catch (e) {
        return;
    }

    prisma.testCase.update({
        where: {
            _id: {
                ...testCase
            }
        }, data: {valid: true}
    });

    const submissions = await prisma.solution.findMany({
        where: {
            course_id: testCase.course_id,
            assignment_title: testCase.assignment_title,
            author: {
                roles: {
                    some: {
                        course_id: testCase.course_id,
                        type: {in: [RoleType.STUDENT]}
                    }
                }
            }
        }
    });

    submissions.forEach(submission => queueJob({
        submission: submission,
        testCase
    }).then(x => {
        // TODO not sure what the type of x is
        const pass: boolean = x as boolean;
        updateScore(submission, testCase, pass);
    }));
};