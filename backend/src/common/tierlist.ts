import prisma from "@/common/prisma";
import { Group, User } from "@prisma/client";
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
const getUserInitials = (user: { surname: string, givenName: string }) =>
    // the idea here is to catch weird names like "c" from erroring out
    `${user.givenName.substring(0, 1)}${user.surname.substring(0, 1)}`;


/** @return the mean of the data */
const getMean = (data: number[]) => data.length === 0 ? 0 : data.reduce((a, b) => (a + b)) / data.length;

function getStandardDeviation(array: number[]) {
    if (array.length === 0) {
        return 0;
    }
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

export type QueriedSubmission = {
    /** utorid of the user */
    utorid: string,
    /** given name of the user */
    givenName: string,
    /** surname of the user */
    surname: string,
    /** total number of test cases */
    total: bigint,
    /** number of test cases passed */
    passed: bigint
}


export const generateTierFromQueriedData = (submissions: QueriedSubmission[], user?: User | string, anonymize = false): [Tierlist, UserTier] => {
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

    const scores = submissions.map((submission) => {
        const you = user ? isSelf(user, submission.utorid) : false;
        return {
            you,
            name: anonymize && !you ? twoLetterHash(submission.givenName + " " + submission.surname) : getUserInitials(submission),
            utorid: anonymize ? '' : submission.utorid,
            score: Number(submission.total) === 0 ? 0 : Number(submission.passed) / Number(submission.total),
        };
    }
    );

    /** the mean of the scores */
    const mean = getMean(scores.map((x) => x.score));

    /** the standard deviation of the scores */
    const std = getStandardDeviation(scores.map((x) => x.score));

    /** tier of the user */
    let yourTier: UserTier | undefined = undefined;
    for (const score of scores) {
        let tier: Tier;
        const { score: _, ...scoreNew} = score;
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
    Object.values(res).forEach(x=>x.sort((a,b)=> {
        const h1 = twoLetterHash(a.name);
        const h2 = twoLetterHash(b.name);
        if(h1 > h2) return 1;
        if(h1 < h1) return -1;
        return 0;
    }));
    return [res, yourTier];
};

/**
 * Generate a tier list for a group
 */
export const generateList = async (group: Group, user?: string | User, anonymize = false): Promise<[Tierlist, UserTier]> => {
    const submissions = await prisma.$queryRaw<QueriedSubmission[]>`
        WITH data as (SELECT COUNT("_ScoreCache".testcase_author_id)        as total,
                             COUNT(CASE WHEN "_ScoreCache".pass THEN 1 END) as passed,
                             "_ScoreCache".solution_author_id               as author_id
                      FROM "_ScoreCache"
                               INNER JOIN "_Scores" S on S.id = "_ScoreCache".score_id
                               INNER JOIN "Testcases" T on S.testcase_id = T.id
                      WHERE "_ScoreCache".course_id = ${group.course_id}
                        AND "_ScoreCache".assignment_title = ${group.assignment_title}
                        AND T.valid = 'VALID'
                        AND T.group_number = ${group.number}
                      GROUP BY "_ScoreCache".solution_author_id)
        SELECT utorid, "givenName", surname, total, passed
        FROM data
                 INNER JOIN "Users" U on U.utorid = data.author_id
        WHERE total > 0
        ORDER BY total DESC, passed DESC, utorid;
    `;

    return generateTierFromQueriedData(submissions, user, anonymize);
};

/**
 * Generate a tier list for a group
 */
export const generateTierList = (group: Group, user?: string | User, anonymize = true): Promise<Tierlist> =>
    generateList(group, user, anonymize).then(x => x[0]);

/**
 * Generate a tier list for a group
 */
export const generateYourTier = (group: Group, user?: string | User): Promise<UserTier> =>
    generateList(group, user, true).then(x => x[1]);
