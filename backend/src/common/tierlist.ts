import {Group, User} from "@prisma/client";
import {
    Tier,
    Tierlist,
    UserTier
} from "codetierlist-types";

/** @return a two letter hash of the string */
export const twoLetterHash = (str: string) => {
    // convert string to a number -- https://stackoverflow.com/a/7616484/11571888
    const hash = Math.abs(str.split("").reduce((acc, curr) => {
        acc = ((acc << 5) - acc) + curr.charCodeAt(0);
        return acc & acc;
    }, 100));

    // make sure this is hard to reverse later
    return String.fromCharCode(65 + hash % 26) + String.fromCharCode(65 + (hash >> 8) % 26);
};

/** @return utorid of user if string or user object */
const getUtorid = (user: User | string) => typeof user === "string" ? user : user.utorid;

/** @return true if the user is the same as the utorid or user object */
const isSelf = (user: User | string, utorid: string) => utorid === getUtorid(user);

/** @return user initials based on email */
const getUserInitials = (user: {surname: string, givenName: string}) =>
    // the idea here is to catch weird names like "c" from erroring out
    `${user.givenName.substring(0, 1)}${user.surname.substring(0, 1)}`;


/** @return the mean of the data */
const getMean = (data: number[]) => data.length === 0 ? 0 : data.reduce((a, b) => Number(a) + Number(b)) / data.length;

function getStandardDeviation(array: number[]) {
    if(array.length===0) {
        return 0;
    }
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

export function generateList(group : Group, user?: string | User, anonymize = false): [Tierlist, UserTier] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submissions : any = JSON.stringify("{}");
    const res: Tierlist = {
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        F: [],
    };
    if (submissions.length === 0) {
        return [res, "?" as UserTier];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scores = submissions.map((submission : any) =>
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validScores = submission.scores.filter((x : any)=>x.test_case.valid==="VALID");
        const you = user ? isSelf(user, submission.author.utorid) : false;
        return{
            you,
            name : anonymize && !you ? twoLetterHash(submission.author.givenName + " " + submission.author.surname) : getUserInitials(submission.author),
            utorid: anonymize ? '' : submission.author.utorid,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            score: validScores.length === 0 ? 0.0 : validScores.filter((x : any) => x.pass).length / validScores.length
        };}
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mean = getMean(scores.map((x: any) => x.score));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const std = getStandardDeviation(scores.map((x: any) => x.score));
    let yourTier: UserTier | undefined = undefined;
    for (const score of scores) {
        let tier: Tier;
        const {score:_, ...scoreNew}=score;
        if (score.score == 0) {
            tier = "F";
        } else if (score.score == 1 || score.score > mean + 2 * std) {
            tier = "S";
        } else if (score.score > mean + std) {
            tier = "A";
        } else if (score.score >= mean) {
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
        res[tier].push(scoreNew);
    }
    if (!yourTier) yourTier = "?";

    return [res, yourTier];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateTierList = (group:any, user?: string | User, anonymize=true): Tierlist => generateList(group, user, anonymize)[0];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateYourTier = (group: any, user?: string | User): UserTier => generateList(group, user, true)[1];
