import {spawn, spawnSync} from "child_process";
import path from "path";
import {getCommit, getFile} from "../utils";

type JobFiles = {
    [key: string]: string
}


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
    let a = Date.now();
    console.info("Running job" + job.submission.git_url + "             " + job.testCase.git_url);
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

    if(Object.keys(query.test_case_files).length == 0){
        return {status: JobStatus.TESTCASE_EMPTY};
    }

    if(Object.keys(query.solution_files).length == 0){
        return {status: JobStatus.SUBMISSION_EMPTY};
    }

    const img = job.assignment.runner_image;
    const img_ver = job.assignment.image_version;

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
            console.info(`stdout: ${data}`);
            try {
                const resultJSON: JobResult = JSON.parse(buffer) as JobResult;
                runner?.stdout?.removeAllListeners();
                runner?.stderr?.removeAllListeners();
                runner?.removeAllListeners();
                console.info(resultJSON);
                console.log((Date.now() - a) / 1000);
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

export const queueJob = (job: Job) : void => {

};
