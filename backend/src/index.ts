import prisma from "./common/prisma";
process.on("unhandledRejection", e=>{
    console.error(e);
});
process.on("uncaughtException", e=>{
    console.error(e);
});
prisma.$connect().then(async () => {
    console.log("Connected to database");
    console.log("Starting server");
    await import("./api");
});
