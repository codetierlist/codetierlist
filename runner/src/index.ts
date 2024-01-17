import {spawn, spawnSync} from "child_process";
import path from "path";
import {
    JobData,
    JobResult,
    JobStatus,
    images
} from "codetierlist-types";
import {Job, Worker} from "bullmq";

if (process.env.MAX_RUNNING_TASKS === undefined) {
    throw new Error("MAX_RUNNING_TASKS is undefined");
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
            ["-c", `serviceid=$(docker service create -d --replicas 1 --restart-condition=none --ulimit cpu=${max_seconds} -e RUN_FILES 127.0.0.1:5000/runner-image-${img}-${img_ver}); ` +
            `timeout ${max_seconds*10} bash -c "while [[ \\$(docker service ps -q --filter "desired-state=Running" $serviceid) ]]; do sleep 1; done; docker service logs --raw $serviceid"; ` +
            "docker service rm $serviceid > /dev/null"
            ],
            {
                cwd: path.join('/', 'runner', 'images', img, img_ver),
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
    workers.push(new Worker<JobData, JobResult>(`${i}`,
        async (job: Job<JobData,JobResult>) => {
            return runJob(job.data);
        }));
}
