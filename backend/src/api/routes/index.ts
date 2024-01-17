import express from "express";
import courseRoute from "./course";
import userRoute from "./users";
import {FetchedUser, RunnerImage, images} from "codetierlist-types";

const router = express.Router();

router.get("/", (req, res) => {
    res.send(req.user satisfies FetchedUser);
});

router.get("/runner/images", (req,res) =>{
    res.send(images satisfies RunnerImage[]);
});

router.use("/courses", courseRoute);

router.use("/users", userRoute);

export default router;
