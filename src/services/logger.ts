import { createLogger, transports, format } from 'winston';
import environmentValues from '../config/config';

const transportsTypes = {
  console: new transports.Console({ level: environmentValues.LOG_LEVEL }),
  file: new transports.File({ filename: 'log.error', level: 'error' }),
};

export const logger = createLogger({
  transports: [transportsTypes.console, transportsTypes.file],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
});
