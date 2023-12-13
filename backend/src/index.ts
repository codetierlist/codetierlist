import prisma from "./common/prisma";
process.on("unhandledRejection", e=>{
    console.error(e);
});
process.on("uncaughtException", e=>{
    console.error(e);
});
prisma.$connect().then(async () => {
    console.info("Connected to database");
    console.info("Starting server");
    await import("./api");
});
