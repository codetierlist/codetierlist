import bodyParser from 'body-parser';
import cors from 'cors';
import express, { ErrorRequestHandler } from 'express';
import * as http from "http";
import { isUofTEmail, isUTORid } from "is-utorid";
import prisma, { fetchedUserArgs } from "@/common/prisma";
import { errorHandler } from "@/common/utils/api";
import routes from "@/api/routes";

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

/**
 * Middleware for dev
 */
if (process.env.NODE_ENV === 'development') {
    app.use(
        cors({
            origin: ['http://localhost:3000', 'http://localhost:3555'],
            credentials: true,
        }),
    );
}
app.use(bodyParser.json());

/**
 * Middleware for prod
 */
app.use(errorHandler(async (req, res, next) => {
    let utorid, email, surname, givenName;

    // HACK
    // DO NOT COMMIT THIS !!!!!!!!!!!!!!!!!!!
    if (req.headers['user-agent']?.includes('Safari/605.1.15')) {
        utorid = 'hmiku' as string;
        email = 'fsdfds@utoronto.ca' as string;
        surname = 'Safari User' as string;
        givenName = 'mikaaaau' as string;
    } else {
        if (!req.headers.utorid || !req.headers.http_mail || !req.headers.sn || !req.headers.givenname) {
            res.statusCode = 401;
            res.send({
                status: 401,
                message: 'Missing Shibboleth headers.',
            });
            return;
        }

        utorid = req.headers.utorid as string;
        email = req.headers.http_mail as string;
        surname = req.headers.sn as string;
        givenName = req.headers.givenname as string;
    }

    // header validation
    if (!utorid || !email || !isUTORid(utorid) || !isUofTEmail(email)) {
        res.statusCode = 401;
        res.send({
            status: 401,
            message: 'Invalid Shibboleth headers.',
        });
        return;
    }

    const admin = (process.env.ADMIN_UTORIDS ?? '').split(',').includes(utorid);

    const user = await prisma.user.upsert({
        where: {utorid},
        create: {utorid, email, surname, givenName, admin},
        update: {utorid, email, surname, givenName},
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
}));

app.use(routes);

/**
 * Error handling
 */
app.use(((err, req, res, _) => {
    console.error(err);
    let message = 'Internal server error.';
    if (process.env.NODE_ENV === 'development') {
        message += `\n${err}`;
    }
    res.statusCode = 500;
    res.send({
        status: 500,
        message,
    });
}) as ErrorRequestHandler);

server.listen(port, () => {
    //eslint-disable-next-line no-console
    console.info(`Server is listening on port ${port}.`);
});
