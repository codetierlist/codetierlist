import {Job, WaitingChildrenError, Worker} from "bullmq";
import { spawn, spawnSync } from "child_process";
import {
    BackendConfig,
    JobResult,
    LimitsConfig,
    ReadyJobData,
    RunnerImage
} from "codetierlist-types";
import { readFileSync } from "fs";
import path from "path";

export const images: RunnerImage[] = (JSON.parse(readFileSync('config_backend.json', 'utf-8')) as BackendConfig).runners;
export const limits: LimitsConfig = JSON.parse(readFileSync('config_limits.json', 'utf-8')) as LimitsConfig;

if (process.env.MAX_RUNNING_TASKS === undefined) {
    throw new Error("MAX_RUNNING_TASKS is undefined");
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

// todo:
// what if we have just 5 containers running and have a job queue
// instead of running one container per job
//
// this could potentially remove the performance hit of starting a container for each job
// however we would need to jail the container (like we do in a ctf)
//
// we would also need to reset the container state after each job
//
// ~ shubh

export const runJob = async (job: ReadyJobData, coverage: boolean): Promise<JobResult> => {
    if("status" in job) {
        throw new Error("Job not ready");
    }
    const query = job.query;
    const img = job.image.runner_image;
    const img_ver = job.image.image_version;
    const promise =  new Promise<JobResult>((resolve) => {
        // {timeout: (max_seconds+5) * 1000} is the timeout for the spawn process, if docker doesn't kill

        const runner = spawn("docker",
            ["run", "--rm", "-i", `--cpus=${limits.max_cpu}`, `--memory="${limits.max_memory}"`, `--memory-swap="${limits.max_memory_swap}"`, "--ulimit", `cpu=${limits.max_seconds}`, "--network=none", `codetl-runner-${img}-${img_ver}`],
            {timeout: (limits.max_seconds + 5) * 1000});

        let buffer = "";

        runner.stdin.write(JSON.stringify({...query, coverage}));
        runner.stdin.end();

        runner.stdout.on('data', (data) => {
            buffer += data;
            try {
                const resultJSON: JobResult = JSON.parse(buffer) as JobResult;
                runner?.stdout?.removeAllListeners();
                runner?.stderr?.removeAllListeners();
                runner?.removeAllListeners();
                resolve(resultJSON);
            } catch (e) {
                // ignore because incomplete json, keep buffering
            }
        });

        runner.stderr.on('data', (data) => {
            resolve({status: "ERROR", error: "stderr:\n" + data});
        });

        runner.on('exit', (code) => {
            if (code === 0) {
                // runner.stdout.on('end', () => {
                resolve({status: "ERROR", error: "stdout ended"}); // read all output and still no result
                // });
            } else {
                resolve({status: "ERROR", error: `stdout exited (${code})`}); // fail case
            }
        });
    });
    const timeout = new Promise<JobResult>((_, reject) => {
        setTimeout(() => {
            reject(new Error("timeout"));
        }, 1000 * (limits.max_seconds + 10));
    });
    return await Promise.race([promise, timeout]);
};


const createImage = (img: string, img_ver: string) => {
    const ret = spawnSync("sh",
        ["-c",
            `docker build . -t codetl-runner-${img}-${img_ver}; ` +
            `docker push codetl-runner-${img}-${img_ver}`
        ],
        {
            cwd: path.join('/', 'runner', 'src', 'images', img, img_ver)
        }
    );
    if (ret?.stdout)
        console.info(ret.stdout.toString());
    console.info(`Image codetl-runner-${img}-${img_ver} created`);
};


const createImages = () => {
    console.info("creating images");
    images.forEach(x => createImage(x.runner_image, x.image_version));
    console.info("done creating images");
};

createImages();

// create workers
const worker = new Worker<ReadyJobData, JobResult>("job_queue",
    async (job: Job<ReadyJobData, JobResult>, token): Promise<JobResult> => {
        if("status" in job.data) {
            console.error(`job ${job.id} is not ready`);
            if(token)
                await job.moveToWaitingChildren(token);
            throw new WaitingChildrenError();
        }
        console.info(`running job ${job.id} with image ${job.data.image.runner_image}:${job.data.image.image_version}`);
        try{
            const res = await runJob(job.data, job.name === "validateTestCase");
            console.info(`job ${job.id} done`);
            return res;
        } catch (e) {
            console.error(`job ${job.id} failed with error:`);
            console.error(e);
            throw e;
        }
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD
        },
        concurrency: parseInt(process.env.MAX_RUNNING_TASKS)
    });

// when the worker is connected to redis, log it
worker.on("ready", () => {
    console.info("worker is active and ready to process jobs");
});

// trap SIGINT and SIGTERM and gracefully shutdown
process.on("SIGINT", async () => {
    await worker.close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await worker.close();
    process.exit(0);
});
