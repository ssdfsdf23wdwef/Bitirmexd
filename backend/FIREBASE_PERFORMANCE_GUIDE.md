# Firebase Performans Optimizasyon Rehberi

Bu rehber, Firebase işlemlerini hızlandırmak için uygulanan optimizasyonları ve kullanım önerilerini içerir.

## 🚀 Uygulanan Optimizasyonlar

### 1. Cache Desteği
- **In-Memory Cache**: Sık kullanılan verileri bellekte tutar
- **TTL (Time To Live)**: 5 dakika varsayılan cache süresi
- **Smart Cache Keys**: Koleksiyon, işlem ve parametrelere göre akıllı cache anahtarları

#### Kullanım:
```typescript
// Cache destekli veri getirme
const user = await firebaseService.findByIdCached('users', userId, 600); // 10 dakika cache

// Cache destekli sorgu
const courses = await firebaseService.findManyCached(
  'courses',
  [{ field: 'userId', operator: '==', value: userId }],
  { field: 'createdAt', direction: 'desc' },
  10,
  300 // 5 dakika cache
);
```

### 2. Performance Tracking
- **Operasyon Süresi İzleme**: Her işlemin süresini kaydeder
- **Cache Hit Rate**: Cache kullanım oranını takip eder
- **Yavaş İşlem Tespit**: Belirlenen eşik değerin üzerindeki işlemleri tespit eder

#### Performans Raporları:
```bash
# Genel performans raporu
GET /performance/report

# Yavaş işlemler (1 saniyeden fazla)
GET /performance/slow-operations?threshold=1000

# Cache istatistikleri
GET /performance/cache-stats?operation=findById&collection=users
```

### 3. Optimized Firestore Settings
- **ignoreUndefinedProperties**: undefined değerleri otomatik filtreler
- **Connection Pool**: Optimal bağlantı yönetimi
- **Batch Operations**: Toplu işlemler için optimize edilmiş metotlar

### 4. İndeks Optimizasyonu
Firestore sorguları için gerekli indeksler eklendi:
- **refreshTokens**: tokenHash + expiresAt
- **learningTargets**: courseId + normalizedTopic, userId + courseId
- **users**: email + isActive
- **quizzes**: userId + createdAt, courseId + isCompleted + createdAt
- **documents**: userId + uploadedAt
- **courses**: userId + isActive + createdAt

## 🔧 Yeni Performans Metotları

### Cache Destekli Okuma
```typescript
// Tekil belge - cache destekli
findByIdCached<T>(collection: string, id: string, ttl?: number)

// Çoklu belge - cache destekli  
findManyCached<T>(collection: string, wheres: [], orderBy?, limit?, ttl?)
```

### Seçici Alan Getirme
```typescript
// Sadece gerekli alanları getir (bandwidth tasarrufu)
findByIdSelect<T>(collection: string, id: string, fields: string[])
```

### Batch İşlemler
```typescript
// Optimize edilmiş batch operasyonları
optimizedBatch(operations: Array<{type, collection, id?, data?}>)
```

### Pagination
```typescript
// Sayfalama destekli sorgu
findWithPagination<T>(collection, pageSize, lastDoc?, wheres?, orderBy?)
```

### Cache ve Güncelleme
```typescript
// Güncelleme sonrası cache temizleme
updateAndClearCache<T>(collection: string, id: string, data: Partial<T>)
```

## 📊 Performance Monitoring

### Real-time Metrikler
- **Operation Time**: Operasyon süresi ortalaması
- **Cache Hit Rate**: Cache kullanım oranı
- **Throughput**: Saniye başına işlem sayısı
- **Error Rate**: Hata oranı

### Dashboard Endpoints
```bash
# Tüm performans metrikleri
GET /performance/report

# Yavaş işlemler (varsayılan: >1000ms)
GET /performance/slow-operations?threshold=500

# Cache istatistikleri
GET /performance/cache-stats?operation=findById&collection=users&lastN=100

# Metrikleri temizle
GET /performance/clear-metrics
```

## 🎯 Kullanım Önerileri

### 1. Cache Stratejisi
- **Sık okunan, az değişen veriler** için cache kullanın
- **User profiles, course data, settings** gibi veriler ideal
- **Real-time data** (chat, notifications) için cache kullanmayın

### 2. Batch Operations
- **Çoklu insert/update** işlemleri için batch kullanın
- **Maximum 500 operation** per batch
- **Error handling** için transaction kullanın

### 3. Query Optimization
- **Minimum field selection** kullanın
- **Composite indexes** oluşturun
- **Pagination** kullanarak büyük sonuç setlerini bölün

### 4. Monitoring
- **Yavaş işlemleri** düzenli kontrol edin
- **Cache hit rate** %80'in üzerinde olmalı
- **Average response time** 100ms altında olmalı

## 🚨 Best Practices

### ✅ Yapın:
- Cache destekli metotları sık okunan veriler için kullanın
- Batch işlemleri çoklu operasyonlar için tercih edin
- Performance metriklerini düzenli takip edin
- İndeksleri sorgu pattern'lerinize göre optimize edin

### ❌ Yapmayın:
- Real-time verileri cache'lemeyin
- Çok büyük objeler cache'lemeyin (>1MB)
- Cache TTL'yi çok uzun tutmayın
- İndeksiz sorgu yapmaya çalışmayın

## 🔍 Troubleshooting

### Yavaş Sorgular
1. İndeks eksikliği kontrol edin
2. Sorgu complexity'sini azaltın  
3. Pagination kullanın
4. Cache'lemeyi değerlendirin

### Düşük Cache Hit Rate
1. Cache TTL'yi artırın
2. Cache key strategy'sini gözden geçirin
3. Data access pattern'lerini analiz edin

### Yüksek Memory Usage
1. Cache size'ı azaltın
2. TTL'yi kısaltın
3. Gereksiz cache'leri temizleyin

## 📈 Performans Hedefleri

| Metrik | Hedef | Kritik |
|--------|--------|--------|
| Average Response Time | <100ms | <500ms |
| Cache Hit Rate | >80% | >50% |
| 95th Percentile | <500ms | <2000ms |
| Error Rate | <1% | <5% |

## 🔄 Sürekli İyileştirme

1. **Haftalık Performance Review**
2. **Slow Query Analysis** 
3. **Cache Strategy Optimization**
4. **Index Usage Monitoring**
5. **Resource Usage Tracking**

Bu optimizasyonlar ile Firebase işlemleriniz önemli ölçüde hızlanacak ve daha verimli hale gelecektir.
