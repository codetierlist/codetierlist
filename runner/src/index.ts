import {spawn, spawnSync} from "child_process";
import path from "path";
import {
    BackendConfig,
    ReadyJobData,
    JobResult, RunnerImage
} from "codetierlist-types";
import {Job, WaitingChildrenError, Worker} from "bullmq";
import {readFileSync} from "fs";

export const images: RunnerImage[] = (JSON.parse(readFileSync('backend_config.json', 'utf-8')) as BackendConfig).runners;

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

const mtask = parseInt(process.env.MAX_RUNNING_TASKS);

const workers: Worker<ReadyJobData, JobResult>[] = [];
export const runJob = async (job: ReadyJobData): Promise<JobResult> => {
    if("status" in job) {
        throw new Error("Job not ready");
    }
    const query = job.query;
    const img = job.image.runner_image;
    const img_ver = job.image.image_version;
    const max_seconds = 10;
    const promise =  new Promise<JobResult>((resolve) => {
        // TODO: change to using volumes or stdin for data passing
        const runner = spawn("bash",
            ["-c", `docker run --rm -i --ulimit cpu=${max_seconds} --network=none codetl-runner-${img}-${img_ver}`],
        );

        let buffer = "";

        runner.stdin.write(JSON.stringify(query));
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

        runner.stderr.on('data', () => {
            resolve({status: "ERROR", error: "stderr"});
        });

        runner.on('exit', (code) => {
            if (code === 0) {
                runner.stdout.on('end', () => {
                    resolve({status: "ERROR", error: "stdout ended"}); // read all output and still no result
                });
            } else {
                resolve({status: "ERROR", error: "stdout exited"}); // fail case
            }
        });
    });
    const timeout = new Promise<JobResult>((_, reject) => {
        console.error("timeout");
        setTimeout(() => {
            reject(new Error("timeout"));
        }, 1000 * (max_seconds + 5));
    });
    return await Promise.race([promise, timeout]);
};


const createImage = (img: string, img_ver: string) => {
    const ret = spawnSync("bash",
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
workers.push(new Worker<ReadyJobData, JobResult>("job_queue",
    async (job: Job<ReadyJobData, JobResult>, token): Promise<JobResult> => {
        if("status" in job.data) {
            console.error(`job ${job.id} is not ready`);
            if(token)
                await job.moveToWaitingChildren(token);
            throw new WaitingChildrenError();
        }
        console.info(`running job ${job.id} with image ${job.data.image.runner_image}:${job.data.image.image_version}`);
        const res = await runJob(job.data);
        console.info(`job ${job.id} done`);
        return res;
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD
        },
        concurrency: mtask
    }));

