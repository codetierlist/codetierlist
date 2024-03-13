import { images } from "@/common/config";
import {
    RoleType
} from "@prisma/client";
import {
    RunnerImage
} from "codetierlist-types";
import express from "express";
const router = express.Router();

/**
 * Get the images for the runner
 *
 * @adminonly
 *
 * @returns {RunnerImage[]} all possible runner images
 */
router.get("/images", (req, res) => {
    if (!req.user.admin && !req.user.roles.some((role) =>
        ([RoleType.INSTRUCTOR, RoleType.TA] as RoleType[]).includes(role.type))) {
        return res.status(403).send({ message: "You must be a TA or Instructor of at least one course to access this route" });
    }

    res.send(images satisfies RunnerImage[]);
});

export default router;
