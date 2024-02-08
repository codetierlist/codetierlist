import {
    FetchedUser,
    RunnerImage,
} from "codetierlist-types";
import express from "express";
import { images } from "../../common/config";
import courseRoute from "./course";
import userRoute from "./users";

const router = express.Router();

router.get("/", (_, res) => {
    res.send({message: "( ͡° ͜ʖ ͡°)"});
});

/**
 * Get the images for the runner
 * @public
 */
router.get("/runner/images", (_, res) =>{
    res.send(images satisfies RunnerImage[]);
});

router.use("/courses", courseRoute);

router.use("/users", userRoute);

export default router;
