import express from "express";
import {Theme, FetchedUser} from "codetierlist-types";
import prisma from "../../../common/prisma";

const router = express.Router();

router.get("/", (req, res) => {
    res.send(req.user satisfies FetchedUser);
});

/**
 * Sets the user's theme to the specified theme.
 * @param theme the theme to set. Must be "light" or "dark".
 * @returns 200 if success, 400 if fail
 */
router.post("/set-theme", async (req, res) => {
    if (!req.body.theme) {
        res.status(400).send("No theme specified.");
        return;
    }
    if (req.body.theme !== "light" && req.body.theme !== "dark") {
        res.status(400).send(`Invalid theme ${req.body.theme}.`);
        return;
    }

    await prisma.user.update({
        where: {utorid: req.user.utorid},
        data: {theme: req.body.theme as Theme}
    });

    res.status(200).send(`Set theme to ${req.body.theme}.`);
});

export default router;
