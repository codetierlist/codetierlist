import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import prisma, {fetchedUserArgs} from "../common/prisma";
import {isUofTEmail, isUTORid} from "is-utorid";
import routes from "./routes";

const port = process.env.PORT || 3000;
const app = express();
if (process.env.NODE_ENV === 'development') {
    app.use(
        cors({
            origin: ['http://localhost:3000', 'http://localhost:3555'],
            credentials: true,
        }),
    );
}
app.use((req, res, next) => {
    try {
        next();
    } catch (e) {
        console.log(e);
        let message = 'Internal server error.';
        if (process.env.NODE_ENV === 'development') {
            message += `\n${e}`;
        }
        res.statusCode = 500;
        res.send({
            status: 500,
            message,
        });
    }
});
app.use(bodyParser.json());
app.use(async (req, res, next) => {
    if (!req.headers.utorid || !req.headers.http_mail) {
        res.statusCode = 401;
        res.send({
            status: 401,
            message: 'Missing Shibboleth headers.',
        });
        return;
    }
    const h = req.headers;
    const utorid = h.utorid as string;
    const email = h.http_mail as string;
    // header validation
    if (!utorid || !email || !isUTORid(utorid) || !isUofTEmail(email)) {
        res.statusCode = 401;
        res.send({
            status: 401,
            message: 'Invalid Shibboleth headers.',
        });
        return;
    }

    const user = await prisma.user.upsert({
        where: {utorid},
        create: {utorid, email},
        update: {utorid, email},
        ...fetchedUserArgs
    });
    if (user === null) {
        res.statusCode = 400;
        res.send({
            status: 400,
            message: 'Invalid user.',
        });
        return;
    }
    req.user = user;
    next();
});

app.use(routes);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}.`);
});