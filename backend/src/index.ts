import prisma from "./common/prisma";

prisma.$connect().then(async () => {
    console.log("Connected to database");
    console.log("Starting server");
    await import("./api");
})
