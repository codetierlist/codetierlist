import {
    AchievementConfig,
    Submission,
    TestCase
} from "codetierlist-types";
import { achievementsConfig } from "../config";
import prisma from "../prisma";

type EventType = "testcase:submit" |
    "testcase:processed" |
    "solution:submit" |
    "solution:processed";
type HandlerType =
    "time:any"
    | "time:solution"
    | "time:testcase"
    | "count:solution"
    | "count:testcase"
    | "count:individual_testcases"
    | "first:solution"
    | "first:testcase"
    | "passall:solution"
    | "passall:testcase"
    | "passall:any"
    | "percent_failed:solution"
    | "percent_failed:testcase";
type CallbackType = (submission: Submission | TestCase, achievements: AchievementConfig[], data: unknown) => Promise<AchievementConfig[]>
const subscribers: Map<EventType, {
    handler: HandlerType,
    callback: CallbackType
}[]> = new Map();

/** Subscribe to an event */
export const subscribe = (handler: HandlerType, event: EventType, callback: CallbackType) => {
    if (!subscribers.has(event)) {
        subscribers.set(event, []);
    }
    subscribers.get(event)!.push({handler, callback});
};

/** Publish an event */
export const publish = (event: EventType, submission: Submission | TestCase, data?: unknown) => {
    prisma.achievement.findMany({
        where: {
            utorid: submission.author_id
        }
    }).then((userAchievements) => {
        if (subscribers.has(event)) {
            subscribers.get(event)!.map(async (subscriber) => {
                let completed = await subscriber.callback(submission,
                    achievementsConfig.filter((achievement) =>
                        userAchievements.every(x => x.id !== achievement.id) && achievement.type === subscriber.handler), data);
                // this may look unnecessary but it's to prevent duplicate achievements via race conditions
                completed = completed.filter((achievement) => userAchievements.every(x => x.id !== achievement.id));
                if (completed.length === 0) {
                    return;
                }
                userAchievements.push(...completed.map((achievement) => ({
                    id: achievement.id,
                    utorid: submission.author_id,
                    completed_at: new Date()
                })));
                await prisma.user.update({
                    where: {
                        utorid: submission.author_id
                    },
                    data: {
                        new_achievements: true,
                        achievements: {
                            upsert: userAchievements.map((achievement) => ({
                                where: {
                                    _id:{
                                        id: achievement.id,
                                        utorid: achievement.utorid
                                    }
                                },
                                update: {},
                                create: {
                                    id: achievement.id,
                                }
                            }))
                        }
                    }
                });
            });
        }
    });
};
