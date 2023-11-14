import express from "express";
import courseRoute from "./course";
import {FetchedUser} from "codetierlist-types";

const router = express.Router();

router.get("/", (req, res) => {
    res.send(req.user satisfies FetchedUser);
});

router.use("/courses", courseRoute);

export default router;
