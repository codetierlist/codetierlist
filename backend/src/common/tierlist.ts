import {User} from "@prisma/client";
import {
    FullFetchedAssignment,
    Tier,
    Tierlist,
    UserTier
} from "codetierlist-types";

/** @return a two letter hash of the string */
export const twoLetterHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36).substr(0, 2);
};

/** @return utorid of user if string or user object */
const getUtorid = (user: User | string) => typeof user === "string" ? user : user.utorid;

/** @return true if the user is the same as the utorid or user object */
const isSelf = (user: User | string, utorid: string) => utorid === getUtorid(user);

/** @return user initials based on email */
const getUserInitials = (email: string) => email[0] + email[email.indexOf(".") + 1];

/** @return the mean of the data */
const getMean = (data: number[]) => data.reduce((a, b) => Number(a) + Number(b)) / data.length;

/** @return the standard deviation of the data */
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
            you: user ? isSelf(user, submission.author.utorid) : false,
            name: (user ? isSelf(user, submission.author.utorid) : false) ? getUserInitials(submission.author.email) : twoLetterHash(submission.author.utorid + (user ? getUtorid(user) : "")),
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

/** @return the tierlist and your tier */
export const generateTierList = (assignment: Omit<FullFetchedAssignment, "due_date">, user?: string | User): Tierlist => generateList(assignment, user)[0];

/** @return your tier */
export const generateYourTier = (assignment: Omit<FullFetchedAssignment, "due_date">, user?: string | User): UserTier => generateList(assignment, user)[1];
