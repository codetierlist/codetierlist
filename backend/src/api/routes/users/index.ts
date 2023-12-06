import express from "express";
import {Theme, FetchedUser} from "codetierlist-types";
import prisma from "../../../common/prisma";

const router = express.Router();

router.get("/", (req, res) => {
    res.send(req.user satisfies FetchedUser);
});

/**
 * Sets the user's theme to the specified theme.
 * @param theme the theme to set. Must be "LIGHT" or "DARK".
 * @returns 200 if success, 400 if fail
 */
router.post("/theme", async (req, res) => {
    if (!req.body.theme) {
        res.status(400).send({message:"No theme specified."});

        return;
    }
    if (req.body.theme !== "LIGHT" && req.body.theme !== "DARK") {
        res.status(400).send({message:`Invalid theme ${req.body.theme}.`});
        return;
    }

    await prisma.user.update({
        where: {utorid: req.user.utorid},
        data: {theme: req.body.theme satisfies Theme}
    });

    res.status(200).send({message:`Set theme to ${req.body.theme}.`});

});

export default router;
