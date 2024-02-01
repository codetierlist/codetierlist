import {
    Submission,
    JobData,
    JobFiles,
    JobResult, Assignment, TestCaseStatus, RunnerImage, ParentJobData,
} from "codetierlist-types";
import {getCommit, getFile} from "./utils";
import {
    Queue,
    QueueEvents,
    Job,
    FlowProducer,
    Worker
} from "bullmq";
import {runTestcase, updateScore} from "./updateScores";
import prisma from "./prisma";
import {QueueOptions} from "bullmq/dist/esm/interfaces";
import {publish} from "./achievements/eventHandler";
import {TestCase} from "@prisma/client";


export enum JobType {
    validateTestCase = "validateTestCase",
    testSubmission = "testSubmission",
    profSubmission = "profSubmission",
    parentJob = "parentJob"
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

const parent_job_queue = "parent_job";

const flowProducer = new FlowProducer(queue_conf);

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


export const bulkQueueTestCases = async <T extends Submission | TestCase>(image : RunnerImage, item: T, queue: (T extends TestCase ? Submission : TestCase)[]) => {
    console.info(`Bulk queueing ${queue.length} test cases for ${item.author_id} submission/test case`);
    await flowProducer.add({
        name: JobType.parentJob,
        queueName: parent_job_queue,
        opts:{
            removeOnFail: true,
            removeOnComplete: true,
        },
        data: {
            item: item,
            type: "valid" in item ? "testcase" : "submission"
        } satisfies ParentJobData,
        children: await Promise.all(queue.map(async cur =>{
            const submission = "valid" in item ? cur as Submission : item as Submission;
            const testCase = "valid" in item ? item as TestCase : cur as TestCase ;
            return ({
                data: {
                    submission,
                    testCase,
                    image,
                    query: {
                        solution_files: await getFiles(submission),
                        test_case_files: await getFiles(testCase),
                    }
                } satisfies JobData,
                name: JobType.testSubmission,
                queueName: job_queue.name
            });
        }))
    });
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
        image: job.image,
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
    console.info(`job ${job.id} completed with status ${result.status} with parent ${job.parentKey}`);
    const submission = data.submission;
    const testCase = data.testCase;
    const pass = result.status === "PASS";
    if(!job.parentKey) {
        await job.remove();
    }
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

export const removeSubmission = async (utorid: string): Promise<void> => {
    await Promise.all(await job_queue.getJobs(["waiting", "active"])
        .then(async (jobs) =>
            jobs.filter(job => job.data.submission.author_id === utorid)
                .map(async job => await job.remove())));
};

export const removeTestcases = async (utorid: string): Promise<void> => {
    await Promise.all(await job_queue.getJobs(["waiting", "active"])
        .then(async (jobs) =>
            jobs.filter(job => job.data.testCase.author_id === utorid)
                .map(async job => await job.remove())));
};

new Worker<ParentJobData, undefined, JobType>(parent_job_queue, async (job) => {
    const children = Object.values(await job.getChildrenValues<JobResult>());
    const item = job.data.item;
    const type = job.data.type;
    const passed = children.filter(x => x.status === "PASS");
    if(type === "submission") {
        const submission = item as Submission;
        publish("solution:processed", submission, {
            passed: passed.length,
            total: children.length
        });
    }
    if(type === "testcase") {
        const testCase = item as TestCase;
        const passedOrFailed = children.filter(x => x.status === "PASS" || x.status === "FAIL");
        console.log(`passedOrFailed: ${passedOrFailed}`);
        console.log(`reduced: ${passedOrFailed.map(x=>"amount" in x ? x.amount : 0).reduce((a,b)=>a+b, 0)}`);
        publish("testcase:processed", testCase, {
            passed: passed.length,
            total: children.length,
            number: passedOrFailed.map(x=>"amount" in x ? x.amount : 0).reduce((a,b)=>a+b, 0)/passedOrFailed.length
        });
    }
    return undefined;
}, queue_conf);
