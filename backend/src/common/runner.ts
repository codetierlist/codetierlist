import {
    Submission,
    TestCase,
    JobData,
    JobFiles,
    JobResult, Assignment, TestCaseStatus, RunnerImage,
} from "codetierlist-types";
import {getCommit, getFile} from "./utils";
import {Queue, QueueEvents, Job} from "bullmq";
import {runTestcase, updateScore} from "./updateScores";
import prisma from "./prisma";
import {readFileSync} from "fs";
import {QueueOptions} from "bullmq/dist/esm/interfaces";

export const images: RunnerImage[] = JSON.parse(readFileSync('runner_config.json', 'utf-8'));

export enum JobType {
    validateTestCase = "validateTestCase",
    testSubmission = "testSubmission",
    profSubmission = "profSubmission"
}

if (process.env.REDIS_HOST === undefined) {
    throw new Error("REDIS_HOST is undefined");
}

if (process.env.REDIS_PORT === undefined) {
    throw new Error("REDIS_PORT is undefined");
}

if (process.env.REDIS_PASSWORD === undefined) {
    console.warn("REDIS_PASSWORD is undefined, connection might fail");
}

const queue_conf: QueueOptions = {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD
    }
};
const job_queue: Queue<JobData, JobResult, JobType> =
    new Queue<JobData, JobResult, JobType>("job_queue", queue_conf);

const job_events: QueueEvents = new QueueEvents("job_queue", queue_conf);

// TODO: move file fetching to runner
export const getFiles = async (submission: Submission | TestCase): Promise<JobFiles> => {
    const res: JobFiles = {};
    const commit = await getCommit(submission);
    if (!commit) {
        throw new Error("Commit not found in runner");
    }

    await Promise.all(commit.files.map(async (x) => {
        const file = await getFile(x, submission.git_url, submission.git_id);
        if (!file) return;
        res[x] = Buffer.from(file.blob.buffer).toString("base64");
    }));
    return res;
};

// TODO: add empty submission and testcase reporting
// TODO: probably use name to determine what to do with result
/**
 * Pushes a job to the queue
 * Returns the job id as a string, or undefined if failed
 */
export const queueJob = async (job: {
    submission: Submission,
    testCase: TestCase,
    image: Assignment | RunnerImage,
}, name: JobType, priority: number = 10): Promise<string | undefined> => {
    // TODO get the files in runner
    let query: { solution_files: JobFiles, test_case_files: JobFiles };
    try {
        query = {
            'solution_files': await getFiles(job.submission),
            'test_case_files': await getFiles(job.testCase),
        };
    } catch (e) {
        console.error(e);
        return undefined;
    }

    if (Object.keys(query.test_case_files).length == 0) {
        return undefined;
    }

    if (Object.keys(query.solution_files).length == 0) {
        return undefined;
    }

    const jd: JobData = {
        testCase: job.testCase,
        submission: job.submission,
        image: {
            image_version: job.image.image_version,
            runner_image: job.image.runner_image
        },
        query
    };

    // push to redis queue
    const redis_job = await job_queue.add(name, jd, {priority});
    console.info(`job ${redis_job.id} added to queue`);
    return redis_job.id;
};

job_events.on("completed", async ({jobId}) => {
    const job = await Job.fromId<JobData, JobResult, JobType>(job_queue, jobId);
    if (!job) return;
    const data = job.data;
    const result = job.returnvalue;
    console.info(`job ${job.id} completed with status ${result.status}`);
    const submission = data.submission;
    const testCase = data.testCase;
    const pass = result.status === "PASS";
    if ([JobType.validateTestCase, JobType.profSubmission].includes(job.name)) {
        let status: TestCaseStatus = "VALID";
        if (["ERROR", "FAIL"].includes(result.status)) {
            status = "INVALID";
        } else if (result.status === "TESTCASE_EMPTY") {
            status = "EMPTY";
        }
        await prisma.testCase.update({
            where: {
                id: testCase.id
            }, data: {valid: status}
        });
        // if the test case is valid, run the test case on all student submissions
        if ((job.name === JobType.validateTestCase || job.data.testCase.valid !== "VALID") && status === "VALID") {
            await runTestcase(testCase, data.image);
        }
        return;
    }
    // not a validation job, update the score in db
    await updateScore(submission, testCase, pass);
});
