import {
    RunnerImage
} from "codetierlist-types";
import { images } from "../../../common/config";
import express from "express";
import {
    RoleType
} from "@prisma/client";
const router = express.Router();

/**
 * Get the images for the runner
 * @adminonly
 */
router.get("/images", (req, res) =>{
    if (!req.user.admin && !req.user.roles.some((role: RoleType) =>
        role === RoleType.INSTRUCTOR || role === RoleType.TA)) {
        return res.status(403).send("You must be a TA or Instructor of at least one course to access this route");
    }

    res.send(images satisfies RunnerImage[]);
});

export default router;
