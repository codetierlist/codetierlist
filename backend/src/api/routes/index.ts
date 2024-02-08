import {
    FetchedUser,
    RunnerImage,
} from "codetierlist-types";
import express from "express";
import { images } from "../../common/config";
import courseRoute from "./course";
import userRoute from "./users";

const router = express.Router();

/**
 * Get the user's information
 */
router.get("/", (req, res) => {
    res.send(req.user satisfies FetchedUser);
});

/**
 * Get the images for the runner
 * @adminonly
 */
router.get("/runner/images", (req,res) =>{
    res.send(images satisfies RunnerImage[]);
});

router.use("/courses", courseRoute);

router.use("/users", userRoute);

export default router;
