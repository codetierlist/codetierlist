import {Submission, TestCase} from "codetierlist-types";
import {spawn} from "child_process";
import path from "path";
import {getCommit, getFile} from "../../common/utils";

interface Job {
    submission: Submission,
    testCase: TestCase
}

type JobFiles = {
    [key: string]: string
}

const job_queue: {
    (): void
}[] = [];

let running_jobs = 0;

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


export const runJob = async (job: Job) => {
    console.log("Running job");
    // get the files here somehow
    let query = {};

    try {
        query = {
            'solution_files': await getFiles(job.submission),
            'test_case_files': await getFiles(job.testCase),
        };
    } catch (e) {
        console.log(e);
        return await new Promise((resolve) => {
            resolve({error: e}); // slightly more graceful error handling?
        });
    }


    const img = 'python';
    const img_ver = '3.10.11';

    // TODO: figure out how to use reject
    return await new Promise((resolve) => {
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
            resolve({code, signal}); // fail case?
        });
    });
};

export const queueJob = (job: Job) => {
    return new Promise((resolve) => {
        job_queue.push(() => {
            runJob(job).then(r => {
                resolve(r);
                running_jobs--;
            });
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
        job();
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