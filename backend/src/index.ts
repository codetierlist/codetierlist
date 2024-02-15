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

// trap SIGINT and SIGTERM and gracefully shutdown
process.on("SIGINT", async () => {
    console.info("Stopping server");
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.info("Stopping server");
    await prisma.$disconnect();
    process.exit(0);
});
