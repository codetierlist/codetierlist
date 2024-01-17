import {
    Submission,
    TestCase,
    Job,
    JobData,
    JobFiles,
    JobResult,
} from "codetierlist-types";
import {getCommit, getFile} from "./utils";
import {Queue} from "bullmq";

if (process.env.REDIS_HOST === undefined) {
    throw new Error("REDIS_HOST is undefined");
}

if (process.env.REDIS_PORT === undefined) {
    throw new Error("REDIS_PORT is undefined");
}

const job_queue: Queue<JobData, JobResult> =
    new Queue<JobData, JobResult>("job_queue",
        { connection: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT)}});


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
        const decoder = new TextDecoder('utf8');
        res[x] = btoa(decoder.decode(file.blob));
    }));
    return res;
};

// TODO: add empty submission and testcase reporting
// TODO: probably use name to determine what to do with result
/**
 * Pushes a job to the queue
 * Returns the job id as a string, or undefined if failed
 */
export const queueJob = async (job: Job, name: string) : Promise<string | undefined> => {
    // get the files
    let query: {solution_files: JobFiles, test_case_files: JobFiles};
    try {
        query = {
            'solution_files': await getFiles(job.submission),
            'test_case_files': await getFiles(job.testCase),
        };
    } catch (e) {
        console.error(e);
        return undefined;
    }

    if(Object.keys(query.test_case_files).length == 0){
        return undefined;
    }

    if(Object.keys(query.solution_files).length == 0){
        return undefined;
    }

    const img = job.assignment.runner_image;
    const img_ver = job.assignment.image_version;

    const jd = {
        query,
        img,
        img_ver,
    };

    // push to redis queue
    const redis_job = await job_queue.add(name, jd);
    return redis_job.id;
};
