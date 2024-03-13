import {createLogger, format, transports, Logger} from 'winston';

const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};

const logger: Logger = createLogger({
    levels: logLevels,
    format: format.combine(format.errors({ stack: true }), format.json()),
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new transports.File({filename: '/logs/error.log', level: 'error'}),
        new transports.File({filename: '/logs/combined.log'}),
    ],
});
export const consoleFormat = format.combine(format.errors({ stack: true }), format.timestamp(),
    format.printf(({
        level,
        message,
        label,
        timestamp
    }) => {
        return label ? `[${label}] ${timestamp} [${level}]: ${message}`
            : `${timestamp} [${level}]: ${message}`;
    }));
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            format: consoleFormat,
            level: 'debug',
        }),
    );
} else {
    logger.add(
        new transports.Console({
            format: consoleFormat,
            level: 'info',
        }),
    );
}

export default logger;
