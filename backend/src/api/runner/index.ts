import {Submission, TestCase} from "codetierlist-types";
import {spawn} from "child_process";
import path from "path";
import {getFiles} from "../../common/utils";

interface Job {
    submission: Submission,
    testCase: TestCase
}

const job_queue: { job: Job, execute: { (): void }, cancel: { (): void } }[] = [];

let running_jobs = 0;
export const getJobQueue = () => job_queue;
export const runJob = async (job: Job) => {
    console.log("Running job");
    // get the files here somehow

    const query = {
        'solution_files': await getFiles(job.submission),
        'test_case_files': await getFiles(job.testCase),
    };

    const img = 'python';
    const img_ver = '3.10.11';

    return await new Promise((resolve, reject) => {
        // NOTE: change ulimit time to increase/decrease time relating to actual running resource
        // NOTE: change timeout to increase/decrease time relating to actual running resource
        const runner = spawn("bash",
            ["-c", `exec docker run --network none --ulimit cpu=1000 --rm -i $(docker build --rm -q -f Dockerfile .)`],
            {
                cwd: path.join('/', 'backend', 'src', 'api', 'runner', 'images', img, img_ver),
                timeout: 60000,
                killSignal: 'SIGKILL'
            }
        );

        // send query to docker container
        runner.stdin.write(JSON.stringify(query) + "\n");

        let buffer = "";

        runner.stdout.on('data', (data) => {
            buffer += data;
            try {
                const resultJSON = JSON.parse(buffer);
                runner?.stdout?.removeAllListeners();
                runner?.stderr?.removeAllListeners();
                runner?.removeAllListeners();
                resolve(resultJSON);
            } catch (e) {
                // ignore because incomplete json, keep buffering
            }
        });

        runner.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        runner.on('exit', (code, signal) => {
            if (code != 0) {
                reject({code, signal});
            } else resolve({code, signal}); // fail case?
        });
    });
};

export const queueJob = (job: Job) => {
    return new Promise((resolve, reject) => {
        let rejected = false;
        job_queue.push({
            job,
            execute() {
                runJob(this.job).then(r => {
                    if (rejected) return;
                    resolve(r);
                    running_jobs--;
                });
            },
            cancel() {
                rejected = true;
                running_jobs--;
                job_queue.splice(job_queue.indexOf(this));
                reject(new Error("Job canceled"));
            }
        });
    });
};

setInterval(() => {
    if (job_queue.length === 0) {
        return;
    }
    if (process.env.MAX_RUNNING_TASKS === undefined) {
        throw new Error("MAX_RUNNING_TASKS is undefined");
    }

    while (running_jobs < parseInt(process.env.MAX_RUNNING_TASKS)) {
        running_jobs++;
        const job = job_queue.shift();
        if (job === undefined) {
            return;
        }
        job.execute();
    }
}, 1000);

// for (let i = 0; i < 15; i++) {
//     console.log(`queueing job ${i}`);
//     queueJob({
//         submission: undefined,
//         testCase: undefined
//     }).then(r => {
//         console.log(`result ${i}`);
//         console.log(r);
//     });
// }