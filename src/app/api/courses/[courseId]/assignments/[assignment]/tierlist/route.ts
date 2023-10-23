import {getAssignment, getUser} from "@/lib/apiUtils";
import {Tier} from "@/lib/types";

const getMean = (data: number[]) => data.reduce((a, b) => Number(a) + Number(b)) / data.length;

const getStandardDeviation = (data: number[]) => Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - getMean(data), 2), 0) / (data.length - 1));

export async function GET (request: Request, { params }: {
  params: {
    assignment: string
    courseId: string
  }
}) {
    const {courseId, assignment} = params;
    const user = await getUser(request);
    const assignmentObj = await getAssignment(courseId, assignment);
    const res: Record<Tier, { name: string, you: boolean }[]> = {
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        F: [],
    };
    if (assignmentObj.submissions.length === 0) {
        return Response.json(res);
    }
    const scores = assignmentObj.submissions.map(submission =>
        ({
            you: submission.author.utorid === user.utorid,
            name: submission.author.email[0] + submission.author.email[submission.author.email.indexOf(".") + 1],
            score: submission.scores.filter(x => x.pass).length / submission.scores.length,
        })
    );
    const mean = getMean(scores.map(x => x.score));
    const std = getStandardDeviation(scores.map(x => x.score));

    for (const score of scores) {
        if (score.score == 0) {
            res["F"].push(score);
        } else if (score.score == 1 || score.score > mean + 2 * std) {
            res["S"].push(score);
        } else if (score.score > mean + std) {
            res["A"].push(score);
        } else if (score.score > mean) {
            res["B"].push(score);
        } else if (score.score > mean - std) {
            res["C"].push(score);
        } else if (score.score > mean - 2 * std) {
            res["D"].push(score);
        } else {
            res["F"].push(score);
        }
    }


    return Response.json(res);
}
