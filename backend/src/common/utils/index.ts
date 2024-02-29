import {
    Course,
    Assignment as PrismaAssignment,
    RoleType
} from "@prisma/client";
import {FetchedUser} from "codetierlist-types";
import {PathLike, promises as fs} from "fs";
import path from "path";

export const securePath = (p: string) => {
    return `.${path.normalize(`/${p}`)}`.slice(2);
};

/**
 * Checks if a user is a prof in a course.
 * @param course course object
 * @param user user object
 */
export function isProf(course: Course | string, user: FetchedUser) {
    return user.admin || user.roles.some(role => (typeof course === "string" ? course : course.id) === role.course_id && ([RoleType.INSTRUCTOR, RoleType.TA] as RoleType[]).includes(role.type));
}

/**
 * Checks if a file exists.
 * @param p the path to check
 * @returns true if the file exists, false otherwise
 */
export const exists = async (p: PathLike): Promise<boolean> => {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
};

/**
 * turn a prisma assignment into a serializable object
 */
export const serializeAssignment = <T extends PrismaAssignment>(assignment: T): Omit<T, "due_date"> & {
    due_date?: string
} => ({...assignment, due_date: assignment.due_date?.toISOString()});