import {publish} from "@/common/achievements/eventHandler";
import prisma from "@/common/prisma";
import {runTestcase, updateScore} from "@/common/updateScores";
import {getCommit, getFile} from "@/common/utils/git";
import {TestCase} from "@prisma/client";
import {
    FlowProducer,
    Queue,
    QueueEvents,
    UnrecoverableError,
    WaitingChildrenError,
    Worker
} from "bullmq";
import {QueueOptions} from "bullmq/dist/esm/interfaces";
import {
    Assignment,
    JobFiles,
    JobResult,
    ParentJobData,
    PendingJobData,
    ReadyJobData,
    RunnerImage, RunnerJobData,
    Submission,
    TestCaseStatus,
} from "codetierlist-types";

import {createLogger, format, transports, Logger} from 'winston';
import logger, {consoleFormat} from "@/common/logger";

const logLevels = {
    error: 0,
    info: 1
};

const runnerLogger: Logger = createLogger({
    levels: logLevels,
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.File({filename: './logs/runners.log'}),
        new transports.Console({
            level: 'info',
            format: format.combine(format.label({label: 'RUNNERS:'}), consoleFormat)
        }),
    ],
});

/**
 * The job types that can be queued
 */
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
    logger.warn("REDIS_PASSWORD is undefined, connection might fail");
}

let max_fetched = parseInt(process.env.MAX_FETCHED_JOBS ?? '1000');
if (isNaN(max_fetched)) {
    logger.warn("MAX_FETCHED_JOBS is not a number, defaulting to 1000");
    max_fetched = 1000;
}

const queue_conf: QueueOptions = {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD
    }
};
const job_queue: Queue<ReadyJobData, JobResult, JobType> =
    new Queue<ReadyJobData, JobResult, JobType>("job_queue", {
        ...queue_conf,
        defaultJobOptions: {backoff: {type: "fixed", delay: 1000}}
    });

const pending_queue: Queue<PendingJobData, undefined, JobType> =
    new Queue<PendingJobData, undefined, JobType>("pending_queue", {
        ...queue_conf,
        defaultJobOptions: {removeOnComplete: true}
    });

const completion_queue: Queue<Omit<RunnerJobData, "query"> | Record<never, never>, undefined, JobType> = new Queue<Omit<ReadyJobData, "query"> | Record<string, never>, undefined, JobType>("completion_queue", queue_conf);

const parent_job_queue = "parent_job";
const parent_job_events: QueueEvents = new QueueEvents(parent_job_queue, queue_conf);

const flowProducer = new FlowProducer(queue_conf);

// TODO: move file fetching to runner
export const getFiles = async (submission: Submission | TestCase): Promise<JobFiles> => {
    const res: JobFiles = {};
    const commit = await getCommit(submission);
    if (!commit) {
        throw new Error("Commit not found in runner");
    }

    await Promise.all(commit.files.map(async (x) => {
        try {
            const file = await getFile(x, submission.git_url, submission.git_id);
            if (!file) return;
            res[x] = Buffer.from(file.blob.buffer).toString("base64");
        } catch (e) {
            throw new Error("Error fetching file");
        }
    }));
    return res;
};

/**
 * Bulk queue test cases for a submission
 */
export const bulkQueueTestCases = async <T extends Submission | TestCase>(image: RunnerImage, item: T, queue: (T extends TestCase ? Submission : TestCase)[]) => {
    runnerLogger.info(`Bulk queueing ${queue.length} test cases for ${item.author_id} submission/test case`);
    runnerLogger.info(`Bulk queueing ${queue.length} test cases for ${item.author_id} submission/test case`);
    await flowProducer.add({
        name: JobType.parentJob,
        queueName: parent_job_queue,
        opts: {
            removeOnFail: false,
            removeOnComplete: false,
        },
        data: {
            item: item,
            type: "valid" in item ? "testcase" : "submission",
            status: "WAITING_FILES"
        } satisfies ParentJobData,
        children: queue.map(cur => {
            const submission = "valid" in item ? cur as Submission : item as Submission;
            const testCase = "valid" in item ? item as TestCase : cur as TestCase;
            return {
                data: {},
                name: JobType.testSubmission,
                queueName: completion_queue.name,
                children: [{
                    opts: {
                        priority: 10,
                        attempts:3,
                        backoff:{
                            type: "exponential",
                            delay: 1000
                        }
                    }
                    ,
                    children: [
                        {
                            data: {
                                submissionId: submission.id,
                                submissionAuthorId: submission.author_id,
                                submissionDatetime: submission.datetime,
                                testcaseId: testCase.id,
                                testcaseDatetime: testCase.datetime,
                                courseId: testCase.course_id,
                                assignmentTitle: testCase.assignment_title,
                                testcaseAuthorId: testCase.author_id,
                                image: {
                                    runner_image: image.runner_image,
                                    image_version: image.image_version
                                }
                            } satisfies PendingJobData,
                            opts: {
                                priority: 10,
                                attempts: 3,
                                backoff: {type: "fixed", delay: 1000}
                            },
                            name: JobType.testSubmission,
                            queueName: pending_queue.name
                        }
                    ],
                    data: {
                        status: "WAITING_FILES",
                    }
                    ,
                    name: JobType.testSubmission,
                    queueName:
                    job_queue.name
                }]
            };
        })
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
    // push to redis queue
    const redis_job = await flowProducer.add({
        opts: {priority},
        name,
        queueName: completion_queue.name,
        data: {},
        children: [{
            opts: {priority},
            data: {
                status: "WAITING_FILES"
            } as ReadyJobData,
            name,
            queueName: job_queue.name,
            children: [{
                opts: {priority},
                name,
                queueName: pending_queue.name,
                data: {
                    testcaseId: job.testCase.id,
                    testcaseAuthorId: job.testCase.author_id,
                    testcaseDatetime: job.testCase.datetime,
                    courseId: job.testCase.course_id,
                    assignmentTitle: job.testCase.assignment_title,
                    submissionId: job.submission.id,
                    submissionAuthorId: job.submission.author_id,
                    submissionDatetime: job.submission.datetime,
                    image: {
                        runner_image: job.image.runner_image,
                        image_version: job.image.image_version
                    },
                }}]
        }]
    });
    runnerLogger.info(`job ${redis_job.job.id} added to queue`);
    return redis_job.job.id;
};

const completionWorker = new Worker<Omit<RunnerJobData, "query"> | Record<never, never>, undefined, JobType>(completion_queue.name, async (job) => {
    if (!job) return;
    const result = (await job.getChildrenValues<JobResult>())[0];
    if (!job.data || Object.keys(job.data).length == 0 || !result) {
        runnerLogger.error(`job ${job.id} completed with no data or result`);
        return;
    }
    const data = job.data as Omit<RunnerJobData, "query">;
    runnerLogger.info(`job ${job.id} completed with status ${result.status} with data ${JSON.stringify(result)}. Job info: ${JSON.stringify({
        submission_utorid: data.submission.author_id,
        testCase: data.testCase.author_id,
        image: data.image
    })}`);
    const submission = data.submission;
    const testCase = data.testCase;
    const pass = result.status === "PASS";
    if (!job.parentKey) {
        await job.remove();
    }
    if ([JobType.validateTestCase, JobType.profSubmission].includes(job.name)) {
        let status: TestCaseStatus = "VALID";
        if (["ERROR", "FAIL"].includes(result.status)) {
            status = "INVALID";
        } else if (result.status === "TESTCASE_EMPTY" || (result.status === "PASS" && result.amount <= 0)) {
            status = "EMPTY";
        }
        await prisma.testCase.update({
            where: {
                id: testCase.id
            }, data: {valid: status, validation_result: result}
        });
        // if the test case is valid, run the test case on all student submissions
        if ((job.name === JobType.validateTestCase || data.testCase.valid !== "VALID") && status === "VALID") {
            await runTestcase(testCase, data.image);
        }
        return;
    }
    // not a validation job, update the score in db
    await updateScore(submission, testCase, pass, result);
}, queue_conf);

/** Remove all pending jobs for a user */
export const removeSubmission = async (newSubmission: Submission): Promise<void> => {
    await Promise.all(await pending_queue.getJobs(["waiting", "active"])
        .then(async (jobs) =>
            jobs.filter(job => job?.data?.submissionAuthorId === newSubmission.author_id
                && job?.data?.courseId === newSubmission.course_id
                && job?.data?.assignmentTitle === newSubmission.assignment_title
                && job?.data?.submissionDatetime < newSubmission.datetime)
                .map(async job => await job.remove())));
};

/** Remove all pending jobs for a user */
export const removeTestcases = async (newSubmission: TestCase): Promise<void> => {
    await Promise.all(await pending_queue.getJobs(["waiting", "active"])
        .then(async (jobs) =>
            jobs.filter(job => job?.data?.testcaseAuthorId === newSubmission.author_id
                && job?.data?.courseId === newSubmission.course_id
                && job?.data?.assignmentTitle === newSubmission.assignment_title
                && job?.data?.testcaseDatetime < newSubmission.datetime)
                .map(async job => await job.remove())));
};

const parentWorker = new Worker<ParentJobData, undefined, JobType>(parent_job_queue, async (job, token) => {
    if (!job || !job.data) return;
    while (job.data.status !== "COMPLETED") {
        if (job.data.status === "WAITING_FILES") {
            await job.updateData({...job.data, status: "READY"});
            job.data.status = "READY";
        }
        const shouldWait = await job.moveToWaitingChildren(token!);
        if (shouldWait) {
            throw new WaitingChildrenError();
        } else {
            await job.updateData({...job.data, status: "COMPLETED"});
            job.data.status = "COMPLETED";
        }
    }

    const children = Object.values(await job.getChildrenValues<JobResult>());
    const item = job.data.item;
    const type = job.data.type;
    const passed = children.filter(x => x.status === "PASS");
    if (type === "submission") {
        const submission = item as Submission;
        publish("solution:processed", submission, {
            passed: passed.length,
            total: children.length
        });
    }
    if (type === "testcase") {
        const testCase = item as TestCase;
        const passedOrFailed = children.filter(x => x.status === "PASS" || x.status === "FAIL");
        publish("testcase:processed", testCase, {
            passed: passed.length,
            total: children.length,
            number: passedOrFailed.map(x => "amount" in x ? x.amount : 0).reduce((a, b) => a + b, 0) / passedOrFailed.length
        });
    }
    runnerLogger.info(`Parent job ${job.id} completed with ${passed.length} passed out of ${children.length}`);
}, queue_conf);

/** Fetches jobs from the pending queue and adds them to the job queue */
const fetchWorker = new Worker<PendingJobData, undefined, JobType>(pending_queue.name, async (job) => {
    const isRateLimited = await job_queue.count();
    const waiting = await job_queue.getWaitingChildrenCount()
        + await job_queue.getWaitingCount()
        // + await job_queue.getFailedCount()
        // + await job_queue.getCompletedCount()
        + await job_queue.getDelayedCount();
    if (isRateLimited - waiting >= max_fetched) {
        await fetchWorker.rateLimit(1000);
        throw Worker.RateLimitError();
    }
    if (!job || !job.data || !job.name) return;
    const data = job.data;
    const submission = await prisma.solution.findUnique({
        where: {
            id: data.submissionId
        }
    });
    const testCase = await prisma.testCase.findUnique({
        where: {
            id: data.testcaseId
        }
    });
    if (!submission || !testCase) {
        runnerLogger.error(`Submission or test case not found for job ${job.id}`);
        throw new UnrecoverableError("Submission or test case not found");
    }

    let query;
    try {
        query = {
            'solution_files': await getFiles(submission),
            'test_case_files': await getFiles(testCase),
        };
    } catch (e) {
        runnerLogger.error(`Error fetching files for job ${job.id}: ${e}`);
        throw new UnrecoverableError("Error fetching files");
    }

    const newData: ReadyJobData = {
        query,
        submission,
        testCase,
        image: data.image
    };
    if (!job.parent) {
        await job_queue.add(job.name, newData, {priority: 5});
        return;
    }
    const parent = await job_queue.getJob(job.parent.id);
    if (!parent) {
        return;
    }
    const grandparent = parent.parent?.id ? await completion_queue.getJob(parent.parent.id) : undefined;
    if(grandparent) {
        await grandparent.updateData({
            submission,
            testCase,
            image: data.image
        });
    }
    if (Object.keys(query.solution_files).length === 0) {
        // https://docs.bullmq.io/patterns/manually-fetching-jobs
        await parent.moveToCompleted({status: "SUBMISSION_EMPTY"}, parent.id ?? '', false);
        return;
    }
    if (Object.keys(query.test_case_files).length === 0) {
        // https://docs.bullmq.io/patterns/manually-fetching-jobs
        await parent.moveToCompleted({status: "TESTCASE_EMPTY"}, parent.id ?? '', false);
        return;
    }
    await parent.updateData(newData);
}, {
    ...queue_conf,
    limiter: {
        max: 50,
        duration: 10,
    },
    concurrency: 1
});

/** Fetches jobs from the parent job queue and adds them to the job queue */
const parent_queue = new Queue<ParentJobData, undefined, JobType>(parent_job_queue, queue_conf);
parent_job_events.on("completed", async ({jobId}) => {
    const job = await parent_queue.getJob(jobId);
    if (!job) return;
    await job.remove({removeChildren: true});
});

/**
 * Shuts down all workers and queues for the runner
 */
export const shutDown = async () => {
    await fetchWorker.close();
    await parentWorker.close();
    await completionWorker.close();
    await parent_queue.close();
    await job_queue.close();
    await pending_queue.close();
    await completion_queue.close();
    await parent_job_events.close();
};
