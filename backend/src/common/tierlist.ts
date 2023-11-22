import {User} from "@prisma/client";
import {
    FullFetchedAssignment,
    Tier,
    Tierlist,
    UserTier
} from "codetierlist-types";

const getMean = (data: number[]) => data.reduce((a, b) => Number(a) + Number(b)) / data.length;

const getStandardDeviation = (data: number[]) => Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - getMean(data), 2), 0) / (data.length - 1));

function generateList(assignment: Omit<FullFetchedAssignment, "due_date">, user?: string | User): [Tierlist, UserTier] {
    const res: Tierlist = {
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        F: [],
    };
    if (assignment.submissions.length === 0) {
        return [res, "?" as UserTier];
    }
    const scores = assignment.submissions.map(submission =>
        ({
            you: submission.author.utorid === (user ? (typeof user === "string" ? user : user.utorid) : false),
            name: submission.author.email[0] + submission.author.email[submission.author.email.indexOf(".") + 1],
            score: submission.scores.filter(x => x.pass).length / submission.scores.length,
        })
    );
    const mean = getMean(scores.map(x => x.score));
    const std = getStandardDeviation(scores.map(x => x.score));
    let yourTier: UserTier | undefined = undefined;
    for (const score of scores) {
        let tier: Tier;
        if (score.score == 0) {
            tier = "F";
        } else if (score.score == 1 || score.score > mean + 2 * std) {
            tier = "S";
        } else if (score.score > mean + std) {
            tier = "A";
        } else if (score.score > mean) {
            tier = "B";
        } else if (score.score > mean - std) {
            tier = "C";
        } else if (score.score > mean - 2 * std) {
            tier = "D";
        } else {
            tier = "F";
        }
        if (score.you) {
            yourTier = tier;
        }
        res[tier].push(score);
    }
    if (!yourTier) yourTier = "?";

    return [res, yourTier];
}

export const generateTierList = (assignment: Omit<FullFetchedAssignment, "due_date">, user?: string | User): Tierlist => generateList(assignment, user)[0];
export const generateYourTier = (assignment: Omit<FullFetchedAssignment, "due_date">, user?: string | User): UserTier => generateList(assignment, user)[1];
