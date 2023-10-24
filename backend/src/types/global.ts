// src/types/express/index.d.ts

// to make the file a module and avoid the TypeScript error
import {Prisma} from "@prisma/client";
import {
    fetchedAssignmentArgs,
    fetchedCourseArgs,
    fetchedUserArgs
} from "../common/prisma";

export type FetchedUser = Prisma.UserGetPayload<typeof fetchedUserArgs>;
export type FetchedCourse = Prisma.CourseGetPayload<typeof fetchedCourseArgs>;
export type FetchedAssignment = Prisma.AssignmentGetPayload<typeof fetchedAssignmentArgs>;
declare global {
    type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
}
type File = Express.Multer.File;
declare module "express-serve-static-core" {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        export interface Request {
            user:  FetchedUser;
            course?: FetchedCourse;
            assignment?: FetchedAssignment;
            files?: File[];
        }
    }
}