import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Log dosyasının yolu
const LOG_DIR = path.join(process.cwd(), 'logs');
const FRONTEND_LOG_PATH = path.join(LOG_DIR, 'frontend-error.log');

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
      return NextResponse.json({ error: 'Log verisi bulunamadı' }, { status: 400 });
    }
    
    // Birden fazla log girişi mi yoksa tek bir giriş mi kontrol et
    const logs = Array.isArray(logData) ? logData : [logData];
    
    let allLogEntries = '';
    
    for (const log of logs) {
      if (!log || typeof log !== 'object') {
        console.warn('Geçersiz log formatı atlandı:', log);
        continue;
      }
      
      // Log mesajını formatlayarak dosyaya yaz
      const { level, message, context, timestamp, details, metadata } = log;
      
      // Zaman damgası yoksa şu anki zamanı kullan
      const logTime = timestamp || new Date().toISOString();
      
      // Log mesajını oluştur
      let logEntry = `[${logTime}] [${(level || 'info').toUpperCase()}] [${context || 'Frontend'}] `;
      
      // Mesaj bir obje ise JSON string'e çevir
      if (typeof message === 'object') {
        logEntry += JSON.stringify(message);
      } else {
        logEntry += message || 'Boş mesaj';
      }
      
      // Detaylar varsa ekle
      if (details) {
        logEntry += `\n  Details: ${typeof details === 'object' ? JSON.stringify(details, null, 2) : details}`;
      }
      
      // Metadata varsa ekle
      if (metadata && typeof metadata === 'object' && Object.keys(metadata).length > 0) {
        logEntry += `\n  Metadata: ${JSON.stringify(metadata, null, 2)}`;
      }
      
      logEntry += '\n';
      allLogEntries += logEntry;
    }
    
    if (allLogEntries) {
      // Tüm log girişlerini dosyaya yaz
      fs.appendFileSync(FRONTEND_LOG_PATH, allLogEntries);
    }
    
    return NextResponse.json({ success: true, processedLogs: logs.length });
  } catch (error) {
    console.error('Frontend log yazma hatası:', error);
    return NextResponse.json({ error: 'Log yazılamadı' }, { status: 500 });
  }
}

// Log dosyasını temizlemek için endpoint
export async function DELETE() {
  try {
    fs.writeFileSync(FRONTEND_LOG_PATH, '');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Frontend log dosyası temizleme hatası:', error);
    return NextResponse.json({ error: 'Log dosyası temizlenemedi' }, { status: 500 });
  }
}

// Log dosyasını okumak için endpoint
export async function GET() {
  try {
    if (!fs.existsSync(FRONTEND_LOG_PATH)) {
      return NextResponse.json({ logs: '' });
    }
    
    const logs = fs.readFileSync(FRONTEND_LOG_PATH, 'utf-8');
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Frontend log dosyası okuma hatası:', error);
    return NextResponse.json({ error: 'Log dosyası okunamadı' }, { status: 500 });
  }
} 