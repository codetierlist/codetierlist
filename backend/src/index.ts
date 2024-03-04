import prisma from "@/common/prisma";
import "@/common/achievements/events";
import logger from "@/common/logger";
import {shutDown} from "@/common/runner";

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

/**
 * Gracefully shutdown the server
 */
const exitHandler = async () => {
    logger.info("Stopping server");
    await prisma.$disconnect();
    await shutDown();
    process.exit(0);
};

// trap SIGINT and SIGTERM and gracefully shutdown
process.on("SIGINT", exitHandler);

process.on("SIGTERM", exitHandler);
