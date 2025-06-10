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
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
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
   * Context ve mesaja göre log kategorisini belirler
   */
  private determineLogCategory(context?: string, message?: string): string {
    if (!context && !message) return "general";

    // Context bazlı kategori belirleme
    if (context) {
      const contextLower = context.toLowerCase();

      // Öğrenme hedefleri
      if (
        contextLower.includes("learning") ||
        contextLower.includes("target") ||
        contextLower.includes("hedef")
      ) {
        return "learning-targets";
      }

      // Sınav oluşturma
      if (
        contextLower.includes("exam") ||
        contextLower.includes("quiz") ||
        contextLower.includes("sinav")
      ) {
        return "exam-creation";
      }

      // Auth işlemleri
      if (
        contextLower.includes("auth") ||
        contextLower.includes("login") ||
        contextLower.includes("logout")
      ) {
        return "auth";
      }

      // API/Data transfer
      if (
        contextLower.includes("api") ||
        contextLower.includes("data") ||
        contextLower.includes("upload")
      ) {
        return "data-transfer";
      }

      // Navigation
      if (
        contextLower.includes("navigation") ||
        contextLower.includes("router") ||
        contextLower.includes("history")
      ) {
        return "navigation";
      }
    }

    // Mesaj bazlı kategori belirleme
    if (message) {
      const messageLower = message.toLowerCase();

      if (
        messageLower.includes("öğrenme") ||
        messageLower.includes("hedef") ||
        messageLower.includes("learning")
      ) {
        return "learning-targets";
      }
      if (
        messageLower.includes("sınav") ||
        messageLower.includes("quiz") ||
        messageLower.includes("exam")
      ) {
        return "exam-creation";
      }
      if (
        messageLower.includes("giriş") ||
        messageLower.includes("login") ||
        messageLower.includes("auth")
      ) {
        return "auth";
      }
      if (
        messageLower.includes("api") ||
        messageLower.includes("upload") ||
        messageLower.includes("data")
      ) {
        return "data-transfer";
      }
      if (
        messageLower.includes("navigation") ||
        messageLower.includes("gezinti") ||
        messageLower.includes("route")
      ) {
        return "navigation";
      }
    }

    return "general";
  }

  /**
   * Log kaydını yerel localStorage'a yazar
   */
  private writeToLocalFile(entry: LogEntry): void {
    if (!this.config.writeToLocalFile || typeof window === "undefined") {
      return;
    }

    try {
      // Kategori belirleme
      const category = this.determineLogCategory(entry.context, entry.message);
      const storageKey = `frontend-logs-${category}`;

      const timestamp = entry.timestamp.toISOString();
      const fileName = entry.file ? entry.file.split(/[\\/]/).pop() : "";
      const lineInfo = entry.line ? `:${entry.line}` : "";
      const fileContext = fileName ? ` (${fileName}${lineInfo})` : "";
      const metaString = entry.meta
        ? ` | Meta: ${JSON.stringify(entry.meta)}`
        : "";

      const logLine = `[${timestamp}] [${entry.level}]${entry.context ? " [" + entry.context + "]" : ""}: ${entry.message}${fileContext}${metaString}\n`;

      // Mevcut logları al
      let existingLogs = "";
      try {
        existingLogs = localStorage.getItem(storageKey) || "";
      } catch (error) {
        console.warn("LocalStorage okuma hatası:", error);
        existingLogs = "";
      }

      // Yeni log satırını ekle
      const updatedLogs = existingLogs + logLine;

      // Boyut kontrolü (max 1MB per kategori)
      const MAX_SIZE = 1024 * 1024; // 1MB
      let finalLogs = updatedLogs;

      if (finalLogs.length > MAX_SIZE) {
        // Son 500KB'ı koru
        const PRESERVE_SIZE = 500 * 1024;
        finalLogs = finalLogs.substring(finalLogs.length - PRESERVE_SIZE);

        // İlk tam satırın başlangıcını bul
        const firstLineIndex = finalLogs.indexOf("\n") + 1;
        if (firstLineIndex > 0) {
          finalLogs = finalLogs.substring(firstLineIndex);
        }

        // Kesme bilgisini ekle
        finalLogs =
          `[${timestamp}] [SYSTEM] Log dosyası boyut sınırına ulaştı, eski loglar temizlendi.\n` +
          finalLogs;
      }

      // localStorage'a kaydet
      try {
        localStorage.setItem(storageKey, finalLogs);
      } catch (error) {
        console.warn(
          "LocalStorage yazma hatası, eski loglar temizleniyor:",
          error,
        );
        try {
          localStorage.removeItem(storageKey);
          localStorage.setItem(
            storageKey,
            `[${timestamp}] [SYSTEM] Log alanı temizlendi.\n${logLine}`,
          );
        } catch (finalError) {
          console.error("LocalStorage yazma başarısız:", finalError);
        }
      }
    } catch (error) {
      console.error("Log yazma hatası:", error);
    }
  }

  private addLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    file?: string,
    line?: string | number,
    meta?: any,
  ): void {
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
      const logMethod =
        console[level.toLowerCase() as "info" | "warn" | "error" | "debug"] ||
        console.log;
      const fileName = file ? file.split(/[\\/]/).pop() : undefined;
      const lineInfo = line ? `:${line}` : "";
      const fileContext = fileName ? ` (${fileName}${lineInfo})` : "";

      logMethod(
        `[${level}]${context ? " [" + context + "]" : ""}: ${message}${fileContext}`,
        meta || "",
      );
    }

    // Dosyaya yaz
    this.writeToLocalFile(entry);
  }

  public info(
    message: string,
    context?: string,
    file?: string,
    line?: string | number,
    meta?: any,
  ): void {
    this.addLogEntry(LogLevel.INFO, message, context, file, line, meta);
  }

  public warn(
    message: string,
    context?: string,
    file?: string,
    line?: string | number,
    meta?: any,
  ): void {
    this.addLogEntry(LogLevel.WARN, message, context, file, line, meta);
  }

  public error(
    message: string,
    context?: string,
    file?: string,
    line?: string | number,
    meta?: any,
  ): void {
    this.addLogEntry(LogLevel.ERROR, message, context, file, line, meta);
  }

  public debug(
    message: string,
    context?: string,
    file?: string,
    line?: string | number,
    meta?: any,
  ): void {
    this.addLogEntry(LogLevel.DEBUG, message, context, file, line, meta);
  }

  public logLearningTarget(message: string, ...args: any[]): void {
    this.info(message, "LEARNING_TARGET", undefined, undefined, args);
  }

  public getLogHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  public clearHistory(): void {
    this.logHistory = [];
  }

  public clearAllLogs(): void {
    this.clearHistory();

    // Tüm localStorage log kategorilerini temizle
    if (typeof window !== "undefined") {
      const categories = [
        "learning-targets",
        "exam-creation",
        "auth",
        "data-transfer",
        "navigation",
        "general",
      ];
      categories.forEach((category) => {
        try {
          localStorage.removeItem(`frontend-logs-${category}`);
        } catch (error) {
          console.error(
            `Log kategorisi temizleme hatası (${category}):`,
            error,
          );
        }
      });
    }
  }

  public getAllErrorLogs(): string {
    return this.logHistory
      .filter((entry) => entry.level === LogLevel.ERROR)
      .map(
        (entry) =>
          `${entry.timestamp.toISOString()} [${entry.level}]${entry.context ? " [" + entry.context + "]" : ""}: ${entry.message}${entry.meta ? " " + JSON.stringify(entry.meta) : ""}`,
      )
      .join("\n");
  }

  /**
   * Yerel localStorage'dan logları okur (kategori bazlı)
   */
  public getLocalLogFileContent(category?: string): string {
    if (typeof window === "undefined") {
      return "";
    }

    try {
      if (category) {
        // Belirli bir kategori için
        const storageKey = `frontend-logs-${category}`;
        return localStorage.getItem(storageKey) || "";
      } else {
        // Tüm kategoriler için
        const categories = [
          "learning-targets",
          "exam-creation",
          "auth",
          "data-transfer",
          "navigation",
          "general",
        ];
        const allLogs: Record<string, string> = {};

        categories.forEach((cat) => {
          const storageKey = `frontend-logs-${cat}`;
          const logs = localStorage.getItem(storageKey) || "";
          if (logs) {
            allLogs[cat] = logs;
          }
        });

        // Tüm kategorileri birleştirilmiş string olarak döndür
        return Object.entries(allLogs)
          .map(([cat, logs]) => `=== ${cat.toUpperCase()} LOGS ===\n${logs}\n`)
          .join("\n");
      }
    } catch (error) {
      console.error("Log okuma hatası:", error);
      return "";
    }
  }

  /**
   * Log dosyasını indirir (kategori bazlı)
   */
  public downloadLogFile(category?: string): void {
    try {
      const logs = this.getLocalLogFileContent(category);
      if (!logs) {
        console.warn("İndirilebilecek log bulunamadı.");
        return;
      }

      const filename = category
        ? `frontend-${category}-logs-${new Date().toISOString().replace(/:/g, "-")}.log`
        : `frontend-all-logs-${new Date().toISOString().replace(/:/g, "-")}.log`;

      const blob = new Blob([logs], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Kaynakları temizle
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Log dosyası indirme hatası:", error);
    }
  }
}

export default LoggerService;
