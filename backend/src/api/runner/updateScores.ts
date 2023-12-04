import {RoleType, Submission, TestCase} from "codetierlist-types";
import prisma from "../../common/prisma";
import {queueJob} from "./index";

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
        }, orderBy: {datetime: "desc"}
    });
    try {
        const result = await queueJob({
            submission: profSubmission,
            testCase
            //TODO actually convert x to boolean
        });
        if (!result) {
            return;
        }
    } catch (e) {
        return;
    }

    await prisma.testCase.update({
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