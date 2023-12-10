import {Submission, TestCase} from "codetierlist-types";
import {spawn, spawnSync} from "child_process";
import path from "path";
import {getCommit, getFile} from "../utils";

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

export enum JobStatus {
    PASS = "PASS", // passes all test cases
    FAIL = "FAIL", // fails at least one test case
    ERROR = "ERROR", // code error, server error, or timeout
    SUBMISSION_EMPTY="SUBMISSION_EMPTY",
    TESTCASE_EMPTY="TESTCASE_EMPTY"
}

export type JobResult =
    {
        status: JobStatus.PASS,
        amount: number // amount of testcases & amount passed
    } |
    {
        status: JobStatus.FAIL,
        amount: number // amount of testcases
        score: number // amount passed
        failed: string[] // list of failed testcase info
    } |
    {
        status: JobStatus.ERROR | JobStatus.SUBMISSION_EMPTY | JobStatus.TESTCASE_EMPTY
    };


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


export const runJob = async (job: Job): Promise<JobResult> => {
    console.log("Running job" + job.submission.git_url + "             " + job.testCase.git_url);
    let query:{solution_files: JobFiles, test_case_files: JobFiles};

    try {
        query = {
            'solution_files': await getFiles(job.submission),
            'test_case_files': await getFiles(job.testCase),
        };
    } catch (e) {
        console.error(e);
        return {status: JobStatus.ERROR};
    }

    if(Object.keys(query.solution_files).length == 0){
        return {status: JobStatus.SUBMISSION_EMPTY};
    }
    if(Object.keys(query.test_case_files).length == 0){
        return {status: JobStatus.TESTCASE_EMPTY};
    }

    const img = 'python';
    const img_ver = '3.10.11';

    // TODO: figure out how to use reject
    return await new Promise((resolve) => {
        // NOTE: change max_seconds to change cpu seconds & absolute timeout

        const max_seconds = 10;
        const runner = spawn("bash",
            ["-c", `serviceid=$(docker service create -d --replicas 1 --restart-condition=none --ulimit cpu=${max_seconds} -e RUN_FILES 127.0.0.1:5000/runner-image-${img}-${img_ver}); ` +
                `timeout ${max_seconds*10} bash -c "while [[ \\$(docker service ps -q --filter "desired-state=Running" $serviceid) ]]; do sleep 1; done; docker service logs --raw $serviceid"; ` +
                "docker service rm $serviceid > /dev/null"
            ],
            {
                cwd: path.join('/', 'backend', 'src', 'common', 'runner', 'images', img, img_ver),
                env: {"RUN_FILES": JSON.stringify(query)}
            }
        );

        let buffer = "";

        runner.stdout.on('data', (data) => {
            buffer += data;
            console.log(`stdout: ${data}`);
            try {
                const resultJSON: JobResult = JSON.parse(buffer) as JobResult;
                runner?.stdout?.removeAllListeners();
                runner?.stderr?.removeAllListeners();
                runner?.removeAllListeners();
                console.log(resultJSON);

                resolve(resultJSON);
            } catch (e) {
                // ignore because incomplete json, keep buffering
            }
        });

        runner.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
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

export const queueJob = (job: Job) : Promise<JobResult> => {
    return new Promise((resolve) => {
        job_queue.push(() => {
            runJob(job).then(r => {
                resolve(r);
                running_jobs--;
            });
        });
    });
};

const create_images = () => {
    console.log("creating images");
    const img = 'python';
    const img_ver = '3.10.11';
    const ret = spawnSync("bash",
        ["-c",
            `docker build . -t 127.0.0.1:5000/runner-image-${img}-${img_ver}; ` +
            `docker push 127.0.0.1:5000/runner-image-${img}-${img_ver}`
        ],
        {
            cwd: path.join('/', 'backend', 'src', 'common', 'runner', 'images', img, img_ver)
        }
    );
    if(ret?.stdout)
        console.log(ret.stdout.toString());
    console.log("done creating images");
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

create_images();

// for (let i = 0; i < 3; i++) {
//     console.log(`queueing job ${i}`);
//     queueJob({
//         submission: {
//             id: "c143e734-ed83-428a-aa68-50e182c58eae",
//             git_url: "/repos/KITTY101-0/become gamer/malho258_solution",
//             git_id: "e727a176e41e3ea9e62b136f5ab5fe81782a33c9",
//             datetime: new Date(),
//             author_id: "malho258",
//             course_id: "KITTY101-0",
//             assignment_title: "become gamer"
//         },
//         testCase: {
//             id: "9f6b74f3-ca76-4119-94f1-82ba4d63740c",
//             git_url: "/repos/KITTY101-0/become gamer/malho258_testCase",
//             git_id: "89974c5b8066182629396f375c8af868dbe85cf3",
//             datetime: new Date(),
//             author_id: "malho258",
//             course_id: "KITTY101-0",
//             assignment_title: "become gamer",
//             valid: "VALID"
//         }
//     }).then(r => {
//         console.log(`result ${i}`);
//         console.log(r);
//     });
// }
