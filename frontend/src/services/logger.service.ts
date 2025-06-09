// filepath: c:\Users\Ahmet haman\OneDrive\Desktop\Bitirme\frontend\src\services\logger.service.ts
/**
 * @file logger.service.ts
 * @description Frontend Logger Service
 */

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  file?: string;
  line?: string | number;
  meta?: any;
}

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface LoggerConfig {
  maxHistorySize?: number;
  logToConsole?: boolean;
  // Add other configuration options as needed
}

class LoggerService {
  private static instance: LoggerService;
  private logHistory: LogEntry[] = [];
  private config: LoggerConfig = {
    maxHistorySize: 100,
    logToConsole: true,
  };

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public setConfig(options: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...options };
  }

  public getConfig(): LoggerConfig {
    return this.config;
  }

  private addLogEntry(level: LogLevel, message: string, context?: string, file?: string, line?: string | number, meta?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      file,
      line,
      meta,
    };

    this.logHistory.push(entry);
    if (this.logHistory.length > (this.config.maxHistorySize || 100)) {
      this.logHistory.shift();
    }

    if (this.config.logToConsole) {
      const logMethod = console[level.toLowerCase() as 'info' | 'warn' | 'error' | 'debug'] || console.log;
      const fileName = file ? file.split(/[\\/]/).pop() : undefined;
      const lineInfo = line ? `:${line}` : '';
      const fileContext = fileName ? ` (${fileName}${lineInfo})` : '';
      
      logMethod(
        `[${level}]${context ? ' [' + context + ']' : ''}: ${message}${fileContext}`,
        meta || ''
      );
    }
  }

  public info(message: string, context?: string, file?: string, line?: string | number, meta?: any): void {
    this.addLogEntry(LogLevel.INFO, message, context, file, line, meta);
  }

  public warn(message: string, context?: string, file?: string, line?: string | number, meta?: any): void {
    this.addLogEntry(LogLevel.WARN, message, context, file, line, meta);
  }

  public error(message: string, context?: string, file?: string, line?: string | number, meta?: any): void {
    this.addLogEntry(LogLevel.ERROR, message, context, file, line, meta);
  }

  public debug(message: string, context?: string, file?: string, line?: string | number, meta?: any): void {
    this.addLogEntry(LogLevel.DEBUG, message, context, file, line, meta);
  }
  
  public logLearningTarget(message: string, ...args: any[]): void {
    this.info(message, 'LEARNING_TARGET', undefined, undefined, args);
  }

  public getLogHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  public clearHistory(): void {
    this.logHistory = [];
  }

  public clearAllLogs(): void {
    this.clearHistory();
    // Potentially clear logs from storage if implemented
  }

  public getAllErrorLogs(): string {
    return this.logHistory
      .filter(entry => entry.level === LogLevel.ERROR)
      .map(entry => `${entry.timestamp.toISOString()} [${entry.level}]${entry.context ? ' [' + entry.context + ']' : ''}: ${entry.message}${entry.meta ? ' ' + JSON.stringify(entry.meta) : ''}`)
      .join('\n');
  }
}

export default LoggerService;
