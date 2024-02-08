import express from "express";
import courseRoute from "./course";
import runnerRoute from "./runner";
import userRoute from "./users";

const router = express.Router();

router.get("/", (_, res) => {
    res.send({message: "( ͡° ͜ʖ ͡°)"});
});

router.use("/router", runnerRoute);

router.use("/courses", courseRoute);

router.use("/users", userRoute);

export default router;
