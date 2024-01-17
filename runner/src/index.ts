import {spawn, spawnSync} from "child_process";
import path from "path";
import {
    JobData,
    JobResult,
    JobStatus, RunnerImage,
    // images
} from "codetierlist-types";
import {Job, Worker} from "bullmq";

export const images : RunnerImage[] = [
    {image: 'python', image_version: 'unittest-3.10.11'},
    {image: 'python', image_version: 'unittest-3.12.1'},
    {image: 'python', image_version: 'pytest-3.10.11'},
];

if (process.env.MAX_RUNNING_TASKS === undefined) {
    throw new Error("MAX_RUNNING_TASKS is undefined");
}

if (process.env.REDIS_HOST === undefined) {
    throw new Error("REDIS_HOST is undefined");
}

if (process.env.REDIS_PORT === undefined) {
    throw new Error("REDIS_PORT is undefined");
}

const mtask = parseInt(process.env.MAX_RUNNING_TASKS);

const workers: Worker<JobData, JobResult>[] = [];
export const runJob = async (job: JobData): Promise<JobResult> => {
    const query = job.query;
    const img = job.img;

    const img_ver = job.img_ver;
    return await new Promise((resolve) => {

        const max_seconds = 10;
        const runner = spawn("bash",
            ["-c", `docker run --rm --ulimit cpu=${max_seconds} -e RUN_FILES runner-image-${img}-${img_ver}`],
            {
                env: {"RUN_FILES": JSON.stringify(query)}
            }
        );

        let buffer = "";

        runner.stdout.on('data', (data) => {
            buffer += data;
            console.info(`stdout: ${data}`);
            try {
                const resultJSON: JobResult = JSON.parse(buffer) as JobResult;
                runner?.stdout?.removeAllListeners();
                runner?.stderr?.removeAllListeners();
                runner?.removeAllListeners();
                console.info(resultJSON);
                resolve(resultJSON);
            } catch (e) {
                // ignore because incomplete json, keep buffering
            }
        });

        runner.stderr.on('data', (data) => {
            console.info(`stderr: ${data}`);
            resolve({status: JobStatus.ERROR});
        });

        runner.on('exit', (code) => {
            if (code === 0) {
                runner.stdout.on('end', () => {
                    resolve({status: JobStatus.ERROR}); // read all output and still no result
                });
            } else {
                resolve({status: JobStatus.ERROR}); // fail case
            }
        });
    });
};


const createImage = (img : string, img_ver: string) => {
    const ret = spawnSync("bash",
        ["-c",
            `docker build . -t runner-image-${img}-${img_ver}; ` +
            `docker push runner-image-${img}-${img_ver}`
        ],
        {
            cwd: path.join('/', 'runner', 'src', 'images', img, img_ver)
        }
    );
    if(ret?.stdout)
        console.info(ret.stdout.toString());
    console.info(`Image ${img}/${img_ver} created`);
};


const createImages = () => {
    console.info("creating images");
    images.forEach(x=>createImage(x.image,x.image_version));
    console.info("done creating images");
};

createImages();

// create workers
for (let i = 0; i < mtask; i++) {
    workers.push(new Worker<JobData, JobResult>("job_queue",
        async (job: Job<JobData,JobResult>) => {
            return runJob(job.data);
        },
        { connection: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT) }}
    ));
}
