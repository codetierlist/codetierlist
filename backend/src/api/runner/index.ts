import {
    Submission,
    TestCase
} from "codetierlist-types";
import {spawn} from "child_process";
import path from "path";

interface Job {
    submission?: Submission,
    testCase?: TestCase
}

const job_queue: {(): void}[] = [];

let running_jobs = 0;

export const runJob = async (job: Job) => {
    console.log("Running job");
    // get the files here somehow

    // hardcode for now
    const solution_files = {
        'test_code.py':
            'Y2xhc3MgUGVyc29uOg0KICAgIGRlZiBfX2luaXRfXyhzZWxmKToNCiAgICAgICAgc2VsZi5uYW1l' +
            'ID0gW10NCg0KICAgIGRlZiBzZXRfbmFtZShzZWxmLCB1c2VyX25hbWUpOg0KICAgICAgICBzZWxm' +
            'Lm5hbWUuYXBwZW5kKHVzZXJfbmFtZSkNCiAgICAgICAgcmV0dXJuIGxlbihzZWxmLm5hbWUpIC0g' +
            'MQ0KDQogICAgZGVmIGdldF9uYW1lKHNlbGYsIHVzZXJfaWQpOg0KICAgICAgICBpZiB1c2VyX2lk' +
            'ID49IGxlbihzZWxmLm5hbWUpOg0KICAgICAgICAgICAgcmV0dXJuICdUaGVyZSBpcyBubyBzdWNo' +
            'IHVzZXInDQogICAgICAgIGVsc2U6DQogICAgICAgICAgICByZXR1cm4gc2VsZi5uYW1lW3VzZXJf' +
            'aWRdDQoNCg0KaWYgX19uYW1lX18gPT0gJ19fbWFpbl9fJzoNCiAgICBwZXJzb24gPSBQZXJzb24o' +
            'KQ0KICAgIHByaW50KCdVc2VyIEFiYmFzIGhhcyBiZWVuIGFkZGVkIHdpdGggaWQgJywgcGVyc29u' +
            'LnNldF9uYW1lKCdBYmJhcycpKQ0KICAgIHByaW50KCdVc2VyIGFzc29jaWF0ZWQgd2l0aCBpZCAw' +
            'IGlzICcsIHBlcnNvbi5nZXRfbmFtZSgwKSk='
    };
    const testCase_files = {
        'test_test.py':
            'aW1wb3J0IHVuaXR0ZXN0DQoNCiMgVGhpcyBpcyB0aGUgY2xhc3Mgd2Ugd2FudCB0byB0ZXN0LiBT' +
            'bywgd2UgbmVlZCB0byBpbXBvcnQgaXQNCmZyb20gdGVzdF9jb2RlIGltcG9ydCBQZXJzb24NCg0K' +
            'DQpjbGFzcyBUZXN0KHVuaXR0ZXN0LlRlc3RDYXNlKToNCiAgICAiIiINCiAgICBUaGUgYmFzaWMg' +
            'Y2xhc3MgdGhhdCBpbmhlcml0cyB1bml0dGVzdC5UZXN0Q2FzZQ0KICAgICIiIg0KDQogICAgcGVy' +
            'c29uID0gUGVyc29uKCkgICMgaW5zdGFudGlhdGUgdGhlIFBlcnNvbiBDbGFzcw0KICAgIHVzZXJf' +
            'aWQgPSBbXSAgIyB2YXJpYWJsZSB0aGF0IHN0b3JlcyBvYnRhaW5lZCB1c2VyX2lkDQogICAgdXNl' +
            'cl9uYW1lID0gW10gICMgdmFyaWFibGUgdGhhdCBzdG9yZXMgcGVyc29uIG5hbWUNCg0KICAgICMg' +
            'dGVzdCBjYXNlIGZ1bmN0aW9uIHRvIGNoZWNrIHRoZSBQZXJzb24uc2V0X25hbWUgZnVuY3Rpb24N' +
            'CiAgICBkZWYgdGVzdF8wX3NldF9uYW1lKHNlbGYpOg0KICAgICAgICBwcmludCgiU3RhcnQgc2V0' +
            'X25hbWUgdGVzdFxuIikNCiAgICAgICAgIiIiDQogICAgICAgIEFueSBtZXRob2Qgd2hpY2ggc3Rh' +
            'cnRzIHdpdGggYGB0ZXN0X2BgIHdpbGwgY29uc2lkZXJlZCBhcyBhIHRlc3QgY2FzZS4NCiAgICAg' +
            'ICAgIiIiDQogICAgICAgIGZvciBpIGluIHJhbmdlKDQpOg0KICAgICAgICAgICAgIyBpbml0aWFs' +
            'aXplIGEgbmFtZQ0KICAgICAgICAgICAgbmFtZSA9ICduYW1lJyArIHN0cihpKQ0KICAgICAgICAg' +
            'ICAgIyBzdG9yZSB0aGUgbmFtZSBpbnRvIHRoZSBsaXN0IHZhcmlhYmxlDQogICAgICAgICAgICBz' +
            'ZWxmLnVzZXJfbmFtZS5hcHBlbmQobmFtZSkNCiAgICAgICAgICAgICMgZ2V0IHRoZSB1c2VyIGlk' +
            'IG9idGFpbmVkIGZyb20gdGhlIGZ1bmN0aW9uDQogICAgICAgICAgICB1c2VyX2lkID0gc2VsZi5w' +
            'ZXJzb24uc2V0X25hbWUobmFtZSkNCiAgICAgICAgICAgICMgY2hlY2sgaWYgdGhlIG9idGFpbmVk' +
            'IHVzZXIgaWQgaXMgbnVsbCBvciBub3QNCiAgICAgICAgICAgIHNlbGYuYXNzZXJ0SXNOb3ROb25l' +
            'KHVzZXJfaWQpICAjIG51bGwgdXNlciBpZCB3aWxsIGZhaWwgdGhlIHRlc3QNCiAgICAgICAgICAg' +
            'ICMgc3RvcmUgdGhlIHVzZXIgaWQgdG8gdGhlIGxpc3QNCiAgICAgICAgICAgIHNlbGYudXNlcl9p' +
            'ZC5hcHBlbmQodXNlcl9pZCkNCiAgICAgICAgcHJpbnQoInVzZXJfaWQgbGVuZ3RoID0gIiwgbGVu' +
            'KHNlbGYudXNlcl9pZCkpDQogICAgICAgIHByaW50KHNlbGYudXNlcl9pZCkNCiAgICAgICAgcHJp' +
            'bnQoInVzZXJfbmFtZSBsZW5ndGggPSAiLCBsZW4oc2VsZi51c2VyX25hbWUpKQ0KICAgICAgICBw' +
            'cmludChzZWxmLnVzZXJfbmFtZSkNCiAgICAgICAgcHJpbnQoIlxuRmluaXNoIHNldF9uYW1lIHRl' +
            'c3RcbiIpDQoNCiAgICAjIHRlc3QgY2FzZSBmdW5jdGlvbiB0byBjaGVjayB0aGUgUGVyc29uLmdl' +
            'dF9uYW1lIGZ1bmN0aW9uDQogICAgZGVmIHRlc3RfMV9nZXRfbmFtZShzZWxmKToNCiAgICAgICAg' +
            'cHJpbnQoIlxuU3RhcnQgZ2V0X25hbWUgdGVzdFxuIikNCiAgICAgICAgIiIiDQogICAgICAgIEFu' +
            'eSBtZXRob2QgdGhhdCBzdGFydHMgd2l0aCBgYHRlc3RfYGAgd2lsbCBiZSBjb25zaWRlcmVkIGFz' +
            'IGEgdGVzdCBjYXNlLg0KICAgICAgICAiIiINCiAgICAgICAgbGVuZ3RoID0gbGVuKHNlbGYudXNl' +
            'cl9pZCkgICMgdG90YWwgbnVtYmVyIG9mIHN0b3JlZCB1c2VyIGluZm9ybWF0aW9uDQogICAgICAg' +
            'IHByaW50KCJ1c2VyX2lkIGxlbmd0aCA9ICIsIGxlbmd0aCkNCiAgICAgICAgcHJpbnQoInVzZXJf' +
            'bmFtZSBsZW5ndGggPSAiLCBsZW4oc2VsZi51c2VyX25hbWUpKQ0KICAgICAgICBmb3IgaSBpbiBy' +
            'YW5nZSg2KToNCiAgICAgICAgICAgICMgaWYgaSBub3QgZXhjZWVkIHRvdGFsIGxlbmd0aCB0aGVu' +
            'IHZlcmlmeSB0aGUgcmV0dXJuZWQgbmFtZQ0KICAgICAgICAgICAgaWYgaSA8IGxlbmd0aDoNCiAg' +
            'ICAgICAgICAgICAgICAjIGlmIHRoZSB0d28gbmFtZSBub3QgbWF0Y2hlcyBpdCB3aWxsIGZhaWwg' +
            'dGhlIHRlc3QgY2FzZQ0KICAgICAgICAgICAgICAgIHNlbGYuYXNzZXJ0RXF1YWwoc2VsZi51c2Vy' +
            'X25hbWVbaV0sIHNlbGYucGVyc29uLmdldF9uYW1lKHNlbGYudXNlcl9pZFtpXSkpDQogICAgICAg' +
            'ICAgICBlbHNlOg0KICAgICAgICAgICAgICAgIHByaW50KCJUZXN0aW5nIGZvciBnZXRfbmFtZSBu' +
            'byB1c2VyIHRlc3QiKQ0KICAgICAgICAgICAgICAgICMgaWYgbGVuZ3RoIGV4Y2VlZHMgdGhlbiBj' +
            'aGVjayB0aGUgJ25vIHN1Y2ggdXNlcicgdHlwZSBtZXNzYWdlDQogICAgICAgICAgICAgICAgc2Vs' +
            'Zi5hc3NlcnRFcXVhbCgnVGhlcmUgaXMgbm8gc3VjaCB1c2VyJywgc2VsZi5wZXJzb24uZ2V0X25h' +
            'bWUoaSkpDQogICAgICAgIHByaW50KCJcbkZpbmlzaCBnZXRfbmFtZSB0ZXN0XG4iKQ0KDQoNCmlm' +
            'IF9fbmFtZV9fID09ICdfX21haW5fXyc6DQogICAgIyBiZWdpbiB0aGUgdW5pdHRlc3QubWFpbigp' +
            'DQogICAgdW5pdHRlc3QubWFpbigp',
        'test_test_2.py':
            'aW1wb3J0IHVuaXR0ZXN0DQoNCiMgVGhpcyBpcyB0aGUgY2xhc3Mgd2Ugd2FudCB0byB0ZXN0LiBT' +
            'bywgd2UgbmVlZCB0byBpbXBvcnQgaXQNCmZyb20gdGVzdF9jb2RlIGltcG9ydCBQZXJzb24NCg0K' +
            'DQpjbGFzcyBUZXN0KHVuaXR0ZXN0LlRlc3RDYXNlKToNCiAgICAiIiINCiAgICBUaGUgYmFzaWMg' +
            'Y2xhc3MgdGhhdCBpbmhlcml0cyB1bml0dGVzdC5UZXN0Q2FzZQ0KICAgICIiIg0KDQogICAgcGVy' +
            'c29uMSA9IFBlcnNvbigpICAjIGluc3RhbnRpYXRlIHRoZSBQZXJzb24gQ2xhc3MNCiAgICBwZXJz' +
            'b24yID0gUGVyc29uKCkNCg0KICAgIGRlZiB0ZXN0XzBfc2V0X25hbWUoc2VsZik6DQogICAgICAg' +
            'IGlkID0gc2VsZi5wZXJzb24xLnNldF9uYW1lKCJEYWtzaCIpDQogICAgICAgIG5hbWUgPSBzZWxm' +
            'LnBlcnNvbjEuZ2V0X25hbWUoaWQpDQogICAgICAgIHNlbGYuYXNzZXJ0RXF1YWwobmFtZSwgIkRh' +
            'a3NoIikNCg0KICAgIGRlZiB0ZXN0XzFfZ2V0X25hbWUoc2VsZik6DQogICAgICAgIHNlbGYucGVy' +
            'c29uMi5zZXRfbmFtZSgiRGFrc2giKSAgIyBpZCA9IDANCiAgICAgICAgbmFtZSA9IHNlbGYucGVy' +
            'c29uMi5nZXRfbmFtZSgyKQ0KICAgICAgICBzZWxmLmFzc2VydEVxdWFsKG5hbWUsICdUaGVyZSBp' +
            'cyBubyBzdWNoIHVzZXInKQ0KDQoNCmlmIF9fbmFtZV9fID09ICdfX21haW5fXyc6DQogICAgdW5p' +
            'dHRlc3QubWFpbigpDQo='
    };

    const query = {
        'solution_files': solution_files,
        'test_case_files': testCase_files,
    };

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

for (let i = 0; i < 15; i++) {
    console.log(`queueing job ${i}`);
    queueJob({
        submission: undefined,
        testCase: undefined
    }).then(r => {
        console.log(`result ${i}`);
        console.log(r);
    });
}