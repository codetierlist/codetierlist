import {Server} from "socket.io";
import {Server as HttpServer} from "http";
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
    Submission,
    TestCase
} from "codetierlist-types";
import {getCommit} from "../../common/utils";
import fs from "fs";

interface Job {
    started: boolean,
    submission: Submission,
}

const runners: Record<string, Job[]> = {};
let io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
> | null = null;
export default (server: HttpServer) => {
    io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(server);

    io.on("connection", (socket) => {
        // TODO authentication
        runners[socket.id] = [];
        console.log("runner connected");
        socket.on("disconnect", () => {
            delete runners[socket.id];
            console.log("runner disconnected");
        });
    });
};
const disconnectRunner = (id: string) => {
    io!.sockets.sockets.get(id)?.disconnect();
    delete runners[id];
};
export const runJob = async (submission: Submission, testCase: TestCase) => {
    if (!io) {
        console.log("io not initialized, will restart job in 5 seconds");
        setTimeout(() => runJob(submission, testCase), 5000);
        return;
    }
    if(!runners) {
        console.log("no runners connected, will restart job in 30 seconds");
        setTimeout(() => runJob(submission, testCase), 30000);
        return;
    }
    const lowestRunner = Object.keys(runners).reduce((min, key) => runners[min].length < runners[key].length ? min : key);
    if (runners[lowestRunner]) {
        const job = {started: false, submission};
        runners[lowestRunner].push(job);
        const submissionCommit = await getCommit(submission, "solution");
        const testCaseCommit = await getCommit(submission, "testCase");
        if (!submissionCommit || !testCaseCommit) {
            throw new Error("Could not find submission or test case");
        }
        // TODO might need error handling here
        const submissionFiles = submissionCommit.files.map(f => new Promise<Buffer>((res) => fs.readFile(f, (err, data) => res(data))));
        const fetchedSubmissionFiles = await Promise.all(submissionFiles);
        const testCaseFiles = testCaseCommit.files.map(f => new Promise<Buffer>((res) => fs.readFile(f, (err, data) => res(data))));
        const fetchedTestCaseFiles = await Promise.all(testCaseFiles);


        io!.to(lowestRunner).emit("job", {
            submission,
            testCase,
            submissionFiles: fetchedSubmissionFiles,
            testCaseFiles: fetchedTestCaseFiles
        }, (e) => {
            if (e) {
                console.log("Runner responded with error: " + e);
                disconnectRunner(lowestRunner);
                runJob(submission, testCase);
                return; 
            }
            job.started = true;
        });
        setTimeout(() => {
            if (!job.started) {
                console.log("Runner did not respond, restarting job");
                disconnectRunner(lowestRunner);
                runJob(submission, testCase);
            }
        });
    }
};