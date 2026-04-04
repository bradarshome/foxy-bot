import pino from 'pino';
import type { Logger } from 'pino';
import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export function createLogger(level: LogLevel = LogLevel.INFO): Logger {
  const pinoFn = (pino as any).default || pino;
  return pinoFn({
    level,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        messageFormat: '{msg}',
      },
    },
  });
}

export class ConsoleLogger {
  private logger: Logger;

  constructor() {
    this.logger = createLogger();
  }

  info(label: string, message: string): void {
    this.logger.info({ label }, message);
  }

  success(label: string, message: string): void {
    console.log(`${chalk.green.bold('║')} ${chalk.cyan.bold(label.padEnd(16))}${chalk.yellow.bold(':')} ${message}`);
  }

  warn(label: string, message: string): void {
    this.logger.warn({ label }, message);
  }

  error(label: string, message: string, error?: Error): void {
    this.logger.error({ label, error: error?.message }, message);
  }

  debug(label: string, message: string): void {
    this.logger.debug({ label }, message);
  }

  chatLog(message: string): void {
    console.log(chalk.greenBright(`[CHAT] ${message}`));
  }

  system(message: string): void {
    console.log(chalk.yellowBright(`[SYSTEM] ${message}`));
  }

  update(message: string): void {
    console.log(chalk.cyanBright(`[UPDATE] ${message}`));
  }

  bot(message: string): void {
    console.log(chalk.blueBright(`[BOT] ${message}`));
  }
}

export const logger = new ConsoleLogger();
