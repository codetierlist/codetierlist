import {
    RunnerImage
} from "codetierlist-types";
import { images } from "../../../common/config";
import express from "express";

const router = express.Router();

/**
 * Get the images for the runner
 * @public
 */
router.get("/images", (_, res) =>{
    res.send(images satisfies RunnerImage[]);
});

export default router;
