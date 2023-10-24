import express from "express";
import courseRoute from "./course";
import prisma from "../../common/prisma";

const router = express.Router();

router.get("/", (req, res) => {
    res.send(req.user);
});

router.use("/courses", courseRoute);

export default router;