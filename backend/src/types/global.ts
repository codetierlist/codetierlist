import {
    FetchedAssignment,
    FetchedCourse,
    FetchedUser
} from "codetierlist-types";

type File = Express.Multer.File;
declare module "express-serve-static-core" {
    export interface Request {
        user: FetchedUser;
        course?: FetchedCourse;
        assignment?: FetchedAssignment;
        files?: File[];
    }
}