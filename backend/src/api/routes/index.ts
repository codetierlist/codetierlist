import express from "express";
import courseRoute from "./course";
import userRoute from "./users";
import {
    FetchedUser,
    RunnerImage,
    // images
} from "codetierlist-types";

export const images : RunnerImage[] = [
    {image: 'python', image_version: 'unittest-3.10.11'},
    {image: 'python', image_version: 'unittest-3.12.1'},
    {image: 'python', image_version: 'pytest-3.10.11'},
];

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
