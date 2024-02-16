import prisma from "@/common/prisma";
import "@/common/achievements/events";
import logger from "@/common/logger";

process.on("unhandledRejection", e=>{
    logger.error(e);
});

process.on("uncaughtException", e=>{
    logger.error(e);
});

prisma.$connect().then(async () => {
    logger.info("Connected to database");
    logger.info("Starting server");
    await import("./api");
});

// trap SIGINT and SIGTERM and gracefully shutdown
process.on("SIGINT", async () => {
    logger.info("Stopping server");
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    logger.info("Stopping server");
    await prisma.$disconnect();
    process.exit(0);
});
