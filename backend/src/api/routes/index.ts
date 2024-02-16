import courseRoute from "@/api/routes/course";
import runnerRoute from "@/api/routes/runner";
import userRoute from "@/api/routes/users";
import express from "express";

const router = express.Router();

router.get("/", (_, res) => {
    res.send({message: "( ͡° ͜ʖ ͡°)"});
});

router.use("/runner", runnerRoute);

router.use("/courses", courseRoute);

router.use("/users", userRoute);

export default router;
