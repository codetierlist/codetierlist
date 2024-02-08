import { Prisma, TestCase } from "@prisma/client";
import { AchievementConfig, Submission } from "codetierlist-types";
import prisma from "../../prisma";
import { subscribe } from "../eventHandler";

/**
 * Return the number modulo m (positive)
 */
const mod = (n: number, m: number) => {
    return ((n % m) + m) % m;
};

const timeHandler = async (submission: Submission | TestCase, achievements: AchievementConfig[]) => {
    return achievements.filter((achievement) => {
        if (!achievement.config) return false;
        const config: { time?: unknown } = achievement.config;
        if (!config.time || typeof config.time !== "object" || !("start" in config.time) ||
            !("end" in config.time) || typeof config.time?.start !== "number"
            || typeof config.time?.end !== "number") return false;
        const {start, end} = config.time;
        // convert to eastern time
        const time = mod(submission.datetime.getUTCHours() - 5, 24);
        return time >= start && time <= end;
    });
};
subscribe("time:solution", "solution:submit", timeHandler);
subscribe("time:testcase", "testcase:submit", timeHandler);
subscribe("time:any", "solution:submit", timeHandler);
subscribe("time:any", "testcase:submit", timeHandler);

/** Return the number of submissions or test cases */
const countHandler = (table: "solution" | "testcase") => async (submission: Submission | TestCase, achievements: AchievementConfig[]) => {
    const query: Prisma.SolutionCountArgs & Prisma.TestCaseCountArgs = {
        where: {
            author_id: submission.author_id,
            assignment_title: submission.assignment_title,
            course_id: submission.course_id
        }
    };
    let count = 0;
    if (table === "solution") {
        count = await prisma.solution.count(query);
    } else {
        count = await prisma.testCase.count(query);
    }
    return achievements.filter((achievement) => {
        if (!achievement.config) return false;
        const config: { count?: unknown } = achievement.config;
        if (!config.count || typeof config.count !== "number") return false;
        return count >= config.count;
    });
};
subscribe("count:solution", "solution:submit", countHandler("solution"));
subscribe("count:testcase", "testcase:submit", countHandler("testcase"));

const firstHandler = (table: "solution" | "testcase") => async (submission: Submission | TestCase, achievements: AchievementConfig[]) => {
    const query: Prisma.SolutionFindFirstArgs & Prisma.TestCaseFindFirstArgs = {
        where: {
            assignment_title: submission.assignment_title,
            course_id: submission.course_id,
            author: {
                roles: {
                    some: {
                        type: "STUDENT",
                        course_id: submission.course_id
                    }
                }
            }
        }, orderBy: {datetime: "asc"}
    };
    const first = table === "solution" ? await prisma.solution.findFirst(query) : await prisma.testCase.findFirst(query);
    if (first?.author_id === submission.author_id) {
        return achievements;
    }
    return [];
};

subscribe("first:solution", "solution:submit", firstHandler("solution"));
subscribe("first:testcase", "testcase:submit", firstHandler("testcase"));

const processedDataValidator = (data: unknown): { passed: number, total: number, number?: number } | undefined => {
    if (!data || typeof data !== "object") {
        console.warn("No data provided for event");
        return undefined;
    }
    const {passed, total, number} = data as { passed: unknown, total: unknown, number?: unknown };
    if (typeof passed !== "number" || typeof total !== "number" || (number !== undefined && typeof number !== "number")) {
        console.warn("Invalid data provided for event");
        return undefined;
    }
    return {passed, total, number};
};
subscribe("count:individual_testcases", "testcase:processed", async (_: Submission | TestCase, achievements: AchievementConfig[], data: unknown) => {
    const processed = processedDataValidator(data);
    if (!processed || !processed.number) return [];
    return achievements.filter((achievement) => {
        if (!achievement.config) return false;
        const config: { count?: unknown } = achievement.config;
        if (!config.count || typeof config.count !== "number") return false;
        return processed.number! >= config.count;
    });
});

const passallHandler = async (_: Submission | TestCase, achievements: AchievementConfig[], data: unknown) => {
    const processed = processedDataValidator(data);
    if (!processed) return [];
    return achievements.filter((_achievement) => {
        return processed.total > 1 && processed.passed == processed.total;
    });
};

subscribe("passall:solution", "solution:processed", passallHandler);
subscribe("passall:testcase", "testcase:processed", passallHandler);
subscribe("passall:any", "solution:processed", passallHandler);
subscribe("passall:any", "testcase:processed", passallHandler);

const percentFailedHandler = async (_: Submission | TestCase, achievements: AchievementConfig[], data: unknown) => {
    const processed = processedDataValidator(data);
    if (!processed) return [];
    return achievements.filter((achievement) => {
        if (!achievement.config) return false;
        const config: { percent?: unknown } = achievement.config;
        if (!config.percent || typeof config.percent !== "number") return false;
        return processed.passed / processed.total <= config.percent;
    });
};

subscribe("percent_failed:solution", "solution:processed", percentFailedHandler);
subscribe("percent_failed:testcase", "testcase:processed", percentFailedHandler);
