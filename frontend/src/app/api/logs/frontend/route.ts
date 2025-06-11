import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  determineLogFileCategory,
  getLogFileName,
  LogFileCategory,
  FlowCategory,
} from "@/constants/logging.constants";

// Log entry interface
interface LogEntry {
  level?: string;
  message?: string;
  context?: string;
  timestamp?: string;
  details?: any;
  metadata?: {
    flowCategory?: string;
    [key: string]: any;
  };
}

// Log dosyasının yolu
const LOG_DIR = path.join(process.cwd(), "logs");

// Log dizininin varlığını kontrol et, yoksa oluştur
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Frontend loglarını almak ve dosyaya kaydetmek için API endpoint'i
export async function POST(req: NextRequest) {
  try {
    const logData = await req.json();

    // Log verisini doğrula
    if (!logData) {
      return NextResponse.json(
        { error: "Log verisi bulunamadı" },
        { status: 400 },
      );
    }

    // Birden fazla log girişi mi yoksa tek bir giriş mi kontrol et
    const logs = Array.isArray(logData) ? logData : [logData];

    // Kategorilere göre logları grupla
    const categorizedLogs: Record<LogFileCategory, LogEntry[]> = {
      [LogFileCategory.LEARNING_TARGETS]: [],
      [LogFileCategory.EXAM_CREATION]: [],
      [LogFileCategory.AUTH]: [],
      [LogFileCategory.DATA_TRANSFER]: [],
      [LogFileCategory.NAVIGATION]: [],
      [LogFileCategory.GENERAL]: [],
    };

    for (const log of logs) {
      if (!log || typeof log !== "object") {
        console.warn("Geçersiz log formatı atlandı:", log);
        continue;
      }

      // Type assertion for log as LogEntry
      const logEntry = log as LogEntry;

      // Flow kategorisini string'den enum'a dönüştür
      let flowCategory: FlowCategory | undefined;
      if (
        logEntry.metadata?.flowCategory &&
        typeof logEntry.metadata.flowCategory === "string"
      ) {
        flowCategory = logEntry.metadata.flowCategory as FlowCategory;
      }

      // Hangi kategoriye ait olduğunu belirle
      const fileCategory = determineLogFileCategory(
        logEntry.context,
        flowCategory,
        logEntry.message,
      );

      categorizedLogs[fileCategory].push(logEntry);
    }

    let totalProcessed = 0;

    // Her kategori için ayrı dosyaya yaz
    for (const [category, categoryLogs] of Object.entries(categorizedLogs)) {
      if (categoryLogs.length === 0) continue;

      const fileName = getLogFileName(category as LogFileCategory);
      const filePath = path.join(LOG_DIR, fileName);

      let allLogEntries = "";

      for (const log of categoryLogs) {
        const { level, message, context, timestamp, details, metadata } = log;

        // Zaman damgası yoksa şu anki zamanı kullan
        const logTime = timestamp || new Date().toISOString();

        // Log mesajını oluştur
        let logEntry = `[${logTime}] [${(level || "info").toUpperCase()}] [${context || "Frontend"}] `;

        // Mesaj bir obje ise JSON string'e çevir
        if (typeof message === "object") {
          logEntry += JSON.stringify(message);
        } else {
          logEntry += message || "Boş mesaj";
        }

        // Detaylar varsa ekle
        if (details) {
          logEntry += `\n  Details: ${typeof details === "object" ? JSON.stringify(details, null, 2) : details}`;
        }

        // Metadata varsa ekle
        if (
          metadata &&
          typeof metadata === "object" &&
          Object.keys(metadata).length > 0
        ) {
          logEntry += `\n  Metadata: ${JSON.stringify(metadata, null, 2)}`;
        }

        logEntry += "\n";
        allLogEntries += logEntry;
      }

      if (allLogEntries) {
        // Bu kategorideki tüm log girişlerini dosyaya yaz
        fs.appendFileSync(filePath, allLogEntries);
        totalProcessed += categoryLogs.length;
      }
    }

    return NextResponse.json({
      success: true,
      processedLogs: totalProcessed,
      categorizedCounts: Object.fromEntries(
        Object.entries(categorizedLogs).map(([cat, logs]) => [
          cat,
          logs.length,
        ]),
      ),
    });
  } catch (error) {
    console.error("Frontend log yazma hatası:", error);
    return NextResponse.json({ error: "Log yazılamadı" }, { status: 500 });
  }
}

// Log dosyasını temizlemek için endpoint
export async function DELETE(req: NextRequest) {
  try {
    // Query parametresinden kategori alınabilir
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    if (
      category &&
      Object.values(LogFileCategory).includes(category as LogFileCategory)
    ) {
      // Belirli bir kategoriyi temizle
      const fileName = getLogFileName(category as LogFileCategory);
      const filePath = path.join(LOG_DIR, fileName);
      fs.writeFileSync(filePath, "");
      return NextResponse.json({ success: true, clearedCategory: category });
    } else {
      // Tüm kategorileri temizle
      for (const cat of Object.values(LogFileCategory)) {
        const fileName = getLogFileName(cat);
        const filePath = path.join(LOG_DIR, fileName);
        if (fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, "");
        }
      }
      return NextResponse.json({ success: true, clearedCategories: "all" });
    }
  } catch (error) {
    console.error("Frontend log dosyası temizleme hatası:", error);
    return NextResponse.json(
      { error: "Log dosyası temizlenemedi" },
      { status: 500 },
    );
  }
}

// Log dosyasını okumak için endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    if (
      category &&
      Object.values(LogFileCategory).includes(category as LogFileCategory)
    ) {
      // Belirli bir kategoriyi oku
      const fileName = getLogFileName(category as LogFileCategory);
      const filePath = path.join(LOG_DIR, fileName);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ logs: "", category });
      }

      const logs = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json({ logs, category });
    } else {
      // Tüm kategorilerdeki logları oku
      const allLogs: Record<string, string> = {};

      for (const cat of Object.values(LogFileCategory)) {
        const fileName = getLogFileName(cat);
        const filePath = path.join(LOG_DIR, fileName);

        if (fs.existsSync(filePath)) {
          allLogs[cat] = fs.readFileSync(filePath, "utf-8");
        } else {
          allLogs[cat] = "";
        }
      }

      return NextResponse.json({ logs: allLogs });
    }
  } catch (error) {
    console.error("Frontend log dosyası okuma hatası:", error);
    return NextResponse.json(
      { error: "Log dosyası okunamadı" },
      { status: 500 },
    );
  }
}
