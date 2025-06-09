/**
 * @file logger.service.ts
 * @description Frontend Logger Service - Tüm loglar yerel dosyalara yazılır
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
  writeToLocalFile?: boolean;
  // Add other configuration options as needed
}

class LoggerService {
  private static instance: LoggerService;
  private logHistory: LogEntry[] = [];
  private config: LoggerConfig = {
    maxHistorySize: 1000,
    logToConsole: true,
    writeToLocalFile: true,
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

  /**
   * Log kaydını yerel dosyaya yazar
   */
  private async writeToLocalFile(entry: LogEntry): Promise<void> {
    if (!this.config.writeToLocalFile || typeof window === 'undefined') {
      return;
    }

    try {
      const timestamp = entry.timestamp.toISOString();
      const fileName = entry.file ? entry.file.split(/[\\/]/).pop() : '';
      const lineInfo = entry.line ? `:${entry.line}` : '';
      const fileContext = fileName ? ` (${fileName}${lineInfo})` : '';
      const metaString = entry.meta ? ` | Meta: ${JSON.stringify(entry.meta)}` : '';
      
      const logLine = `[${timestamp}] [${entry.level}]${entry.context ? ' [' + entry.context + ']' : ''}: ${entry.message}${fileContext}${metaString}\n`;

      // API endpoint'e log gönder (yerel dosyaya yazılması için)
      await fetch('/api/logs/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: entry.level.toLowerCase(),
          message: entry.message,
          context: entry.context || 'Unknown',
          timestamp: timestamp,
          details: {
            file: entry.file,
            line: entry.line,
            meta: entry.meta
          }
        }),
      });
    } catch (error) {
      // Dosya yazma hatası durumunda sadece konsola log yaz
      console.error('Log dosyasına yazma hatası:', error);
    }
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
    if (this.logHistory.length > (this.config.maxHistorySize || 1000)) {
      this.logHistory.shift();
    }

    // Konsola yazdır
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

    // Dosyaya yaz
    this.writeToLocalFile(entry);
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
    
    // Yerel log dosyasını da temizle
    if (typeof window !== 'undefined') {
      fetch('/api/logs/frontend', {
        method: 'DELETE',
      }).catch(error => {
        console.error('Log dosyası temizleme hatası:', error);
      });
    }
  }

  public getAllErrorLogs(): string {
    return this.logHistory
      .filter(entry => entry.level === LogLevel.ERROR)
      .map(entry => `${entry.timestamp.toISOString()} [${entry.level}]${entry.context ? ' [' + entry.context + ']' : ''}: ${entry.message}${entry.meta ? ' ' + JSON.stringify(entry.meta) : ''}`)
      .join('\n');
  }

  /**
   * Yerel log dosyasından tüm logları okur
   */
  public async getLocalLogFileContent(): Promise<string> {
    if (typeof window === 'undefined') {
      return '';
    }

    try {
      const response = await fetch('/api/logs/frontend', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.logs || '';
      }
      return '';
    } catch (error) {
      console.error('Log dosyası okuma hatası:', error);
      return '';
    }
  }

  /**
   * Log dosyasını indirir
   */
  public async downloadLogFile(): Promise<void> {
    try {
      const logs = await this.getLocalLogFileContent();
      if (!logs) {
        console.warn('İndirilebilecek log bulunamadı.');
        return;
      }
      
      const blob = new Blob([logs], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `frontend-logs-${new Date().toISOString().replace(/:/g, '-')}.log`;
      document.body.appendChild(a);
      a.click();
      
      // Kaynakları temizle
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Log dosyası indirme hatası:', error);
    }
  }
}

export default LoggerService;
