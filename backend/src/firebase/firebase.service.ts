import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as admin from 'firebase-admin';
import { LoggerService } from '../common/services/logger.service';
import { FlowTrackerService } from '../common/services/flow-tracker.service';
import { LogMethod } from '../common/decorators';
import * as path from 'path';
import { toPlainObject } from '../common/utils/firestore.utils';
import { PerformanceTracker, TrackPerformance } from '../common/utils/performance.utils';
import { ConfigService } from '@nestjs/config';@Injectable()
export class FirebaseService implements OnModuleInit {
  public auth: admin.auth.Auth;
  public firestore: admin.firestore.Firestore;
  public db: admin.firestore.Firestore;
  public storage: admin.storage.Storage | null = null;
  private readonly logger: LoggerService;
  private readonly flowTracker: FlowTrackerService;
  private readonly performanceTracker: PerformanceTracker;
  
  // Cache ayarları
  private readonly DEFAULT_CACHE_TTL = 300; // 5 dakika
  private readonly CACHE_PREFIX = 'firebase:';

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.logger = LoggerService.getInstance();
    this.flowTracker = FlowTrackerService.getInstance();
    this.performanceTracker = PerformanceTracker.getInstance();

    this.flowTracker.trackStep(
      'Firebase servisini başlatma',
      'FirebaseService',
    );

    const serviceAccountFileName = 'firebase-service-account.json';
    const absolutePath = path.join(
      __dirname,
      '../../secrets',
      serviceAccountFileName,
    );

    try {
    
      admin.initializeApp({
        credential: admin.credential.cert(absolutePath),
        // Firestore performans optimizasyonları
        databaseURL: undefined, // Realtime Database kullanmıyoruz
      });

      this.logger.info(
        'Firebase Admin başarıyla başlatıldı. Storage devre dışı bırakıldı.',
        'FirebaseService.constructor',
        __filename,
      );

      // Başlatma başarılıysa servisleri ata
      this.auth = admin.auth();
      this.firestore = admin.firestore();
      
      // Firestore performans ayarları
      this.firestore.settings({
        ignoreUndefinedProperties: true, // Undefined değerleri otomatik filtrele
        // preferRest: false, // gRPC kullan (daha hızlı)
      });
      
      this.db = this.firestore;
      // Storage kullanımı devre dışı bırakıldı - kullanıcı isteği
      this.storage = null;
    } catch (error) {
    }
  }

  @LogMethod()
  async onModuleInit() {
    const startTime = Date.now();
    this.logger.info(
      'FirebaseService onModuleInit başlıyor',
      'FirebaseService.onModuleInit',
      __filename,
      93, // Satır numarası yaklaşık
    );

    // Bu kısım constructor'a taşındığı için kaldırıldı.
    // Gerekirse başka onModuleInit işlemleri buraya eklenebilir.

    // Servislerin constructor'da atanıp atanmadığını kontrol et (opsiyonel loglama)
    if (this.auth && this.firestore) {
      this.logger.info(
        'Firebase servisleri (Auth, Firestore) onModuleInit sırasında mevcut.',
        'FirebaseService.onModuleInit',
      );
    } else {
      this.logger.error(
        'Firebase servisleri onModuleInit sırasında EKSİK! Constructor başlatması başarısız olmuş olabilir.',
        'FirebaseService.onModuleInit',
      );
    }

    this.logger.info(
      `FirebaseService onModuleInit tamamlandı (${Date.now() - startTime}ms)`,
      'FirebaseService.onModuleInit',
    );
  }

  // Kullanıcı doğrulama yardımcı metodu
  @LogMethod({ trackParams: false })
  async verifyUser(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      this.flowTracker.trackStep(
        'Kullanıcı token doğrulanıyor',
        'FirebaseService',
      );
      return await this.auth.verifyIdToken(token);
    } catch (error) {
      this.logger.logError(error, 'FirebaseService.verifyUser', {
        additionalInfo: 'Token doğrulama hatası',
      });
      throw error;
    }
  }

  // Kullanıcı bilgilerini getirme metodu
  @LogMethod()
  async getUserById(uid: string): Promise<admin.auth.UserRecord> {
    try {
      this.flowTracker.trackStep(
        `Kullanıcı bilgisi (${uid}) alınıyor`,
        'FirebaseService',
      );
      return await this.auth.getUser(uid);
    } catch (error) {
      this.logger.logError(error, 'FirebaseService.getUserById', {
        userId: uid,
        additionalInfo: 'Kullanıcı bilgisi alınamadı',
      });
      throw error;
    }
  }

  // ID token doğrulama fonksiyonu
  @LogMethod({ trackParams: false })
  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      this.flowTracker.trackStep('ID token doğrulanıyor', 'FirebaseService');
      return await this.auth.verifyIdToken(token);
    } catch (error) {
      this.logger.logError(error, 'FirebaseService.verifyIdToken', {
        additionalInfo: 'ID token doğrulama hatası',
      });
      throw error;
    }
  }

  // Dosya yükleme fonksiyonu
  @LogMethod({ trackParams: true })
  async uploadFile(
    buffer: Buffer,
    destination: string,
    contentType: string,
  ): Promise<string> {
    this.logger.info(
      `Storage devre dışı: Dosya yükleme atlandi - ${destination}`,
      'FirebaseService.uploadFile',
    );

    // Storage devre dışı olduğu için dosya yükleme simülasyonu
    // Geçici bir URL döndür ya da alternatif bir yöntem uygula
    return `https://example.com/simulated-storage/${destination}`;
  }

  // Dosya silme fonksiyonu
  @LogMethod({ trackParams: true })
  async deleteFile(storagePath: string): Promise<void> {
    this.logger.info(
      `Storage devre dışı: Dosya silme atlandi - ${storagePath}`,
      'FirebaseService.deleteFile',
    );
    // Storage devre dışı olduğu için işlem atlama
    return Promise.resolve();
  }

  // Firestore Koleksiyon İşlemleri

  /**
   * Belge oluşturma
   * @param collection Koleksiyon adı
   * @param data Oluşturulacak veri
   * @param id (İsteğe bağlı) Belge ID'si
   * @returns Oluşturulan belge
   */
  @LogMethod({ trackParams: true })
  @TrackPerformance('create')
  async create<T>(
    collection: string,
    data: T,
    id?: string,
  ): Promise<T & { id: string }> {
    try {
      this.flowTracker.trackStep(
        `${collection} koleksiyonuna yeni döküman ekleniyor`,
        'FirebaseService',
      );
      const startTime = Date.now();

      const dataWithTimestamp = {
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      let docRef;
      let docId;

      if (id) {
        docRef = this.firestore.collection(collection).doc(id);
        await docRef.set(dataWithTimestamp);
        docId = id;
      } else {
        docRef = await this.firestore
          .collection(collection)
          .add(dataWithTimestamp);
        docId = docRef.id;
      }

      // Oluşturulan belgeyi getir (timestamp'ler JS Date objesine dönüştürülerek)
      const snapshot = await docRef.get();

      const endTime = Date.now();
      this.flowTracker.trackDbOperation(
        'CREATE',
        collection,
        endTime - startTime,
        'FirebaseService',
      );

      return {
        ...(snapshot.data() as T),
        id: docId,
      };
    } catch (error) {
      this.logger.error(
        `Firestore belge oluşturma hatası: ${error.message}`,
        'FirebaseService.create',
        __filename,
        393,
      );
      throw error;
    }
  }

  /**
   * Belge güncelleme
   * @param collection Koleksiyon adı
   * @param id Belge ID'si
   * @param data Güncellenecek veri
   * @returns Güncellenen belge
   */
  @LogMethod({ trackParams: true })
  @TrackPerformance('update')
  async update<T>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<T & { id: string }> {
    try {
      this.flowTracker.trackStep(
        `${collection} koleksiyonundaki ${id} ID'li döküman güncelleniyor`,
        'FirebaseService',
      );
      const startTime = Date.now();

      const docRef = this.firestore.collection(collection).doc(id);

      // Undefined değerleri filtreleme işlemi
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        // Undefined değilse değeri ekle
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const dataWithTimestamp = {
        ...filteredData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await docRef.update(dataWithTimestamp);

      // Güncellenen belgeyi getir
      const snapshot = await docRef.get();
      if (!snapshot.exists) {
        throw new Error(
          `${collection} koleksiyonunda ${id} ID'li belge bulunamadı`,
        );
      }

      const endTime = Date.now();
      this.flowTracker.trackDbOperation(
        'UPDATE',
        collection,
        endTime - startTime,
        'FirebaseService',
      );

      return {
        ...(snapshot.data() as T),
        id: snapshot.id,
      };
    } catch (error) {
      this.logger.error(
        `Firestore belge güncelleme hatası: ${error.message}`,
        'FirebaseService.update',
        __filename,
        447,
      );
      throw error;
    }
  }

  /**
   * Belgeyi ID ile getirme
   * @param collection Koleksiyon adı
   * @param id Belge ID'si
   * @returns Belge
   */
  @LogMethod({ trackParams: true })
  @TrackPerformance('findById')
  async findById<T>(
    collection: string,
    id: string,
  ): Promise<(T & { id: string }) | null> {
    try {
      this.flowTracker.trackStep(
        `${collection} koleksiyonundan ${id} ID'li döküman alınıyor`,
        'FirebaseService',
      );
      const startTime = Date.now();
      const docRef = this.firestore.collection(collection).doc(id);
      const doc = await docRef.get();

      const endTime = Date.now();
      this.flowTracker.trackDbOperation(
        'READ',
        collection,
        endTime - startTime,
        'FirebaseService',
      );

      if (!doc.exists) {
        this.logger.warn(
          `${collection} koleksiyonunda ${id} ID'li döküman bulunamadı.`,
          'FirebaseService.findById',
          __filename,
          362, // Yaklaşık satır
        );
        this.logger.debug(
          `findById (iç): Belge bulunamadı. Dönecek sonuç: null`,
          'FirebaseService.findById',
          __filename,
          undefined,
          { collection, id, willReturnNull: true },
        );
        return null;
      }

      const documentData = doc.data() as T;
      // Dönen veriyi logla
      this.logger.debug(
        `Firestore'dan ${collection}/${id} için belge verisi alındı. Alanlar: ${Object.keys(documentData || {}).join(', ')}`,
        'FirebaseService.findById',
        __filename,
        371, // Yaklaşık satır
        {
          documentId: id,
          collectionName: collection,
          retrievedData: documentData,
        }, // Direkt objeyi gönder, LoggerService halletsin
      );

      const result = { ...documentData, id: doc.id };
      this.logger.debug(
        `findById (iç): Belge bulundu ve işlendi. Dönecek sonuç (ilk 100 byte): ${JSON.stringify(result).substring(0, 100)}`,
        'FirebaseService.findById',
        __filename,
        undefined,
        { collection, id, willReturnObject: true },
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Firestore belge getirme hatası: ${error.message}`,
        'FirebaseService.findById',
        __filename,
        490,
      );
      throw error;
    }
  }

  /**
   * Belgeyi koşula göre getirme
   * @param collection Koleksiyon adı
   * @param field Sorgulanacak alan
   * @param operator Operatör ('==', '>', '<', '>=', '<=', '!=', 'array-contains', 'array-contains-any', 'in', 'not-in')
   * @param value Değer
   * @returns İlk eşleşen belge
   */
  @LogMethod()
  async findOne<T>(
    collection: string,
    field: string,
    operator: FirebaseFirestore.WhereFilterOp,
    value: any,
  ): Promise<(T & { id: string }) | null> {
    const startTime = Date.now();
    const logContext = 'FirebaseService.findOne';
    const operationDesc = `${collection} koleksiyonundan ${field} ${operator} ${value} için döküman alınıyor`;

    this.flowTracker.trackStep(operationDesc, 'FirebaseService');

    try {
      const collectionRef = this.firestore.collection(collection);
      const querySnapshot = await collectionRef
        .where(field, operator, value)
        .limit(1)
        .get();

      const endTime = Date.now();
      this.flowTracker.trackDbOperation(
        'READ',
        collection,
        endTime - startTime,
        'FirebaseService.findOne',
      );

      if (querySnapshot.empty) {
        this.logger.debug(
          `Döküman bulunamadı: ${operationDesc}`,
          logContext,
          __filename,
          455,
        );
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data() as T;

      this.logger.debug(
        `Döküman bulundu: ${doc.id}`,
        logContext,
        __filename,
        468,
        { documentId: doc.id },
      );

      return {
        id: doc.id,
        ...data,
      };
    } catch (error) {
      this.logger.logError(error, logContext, {
        collection,
        field,
        operator,
        value,
        additionalInfo: 'findOne işlemi sırasında hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Koleksiyondaki belgeleri koşullara göre getirme
   * @param collection Koleksiyon adı
   * @param wheres Sorgulama koşulları dizisi [{field, operator, value}]
   * @param orderBy Sıralama alanı ve yönü {field, direction}
   * @param limit Sonuç sayısı limiti
   * @returns Belge dizisi
   */
  @LogMethod({ trackParams: true })
  async findMany<T>(
    collection: string,
    wheres: Array<{
      field: string;
      operator: FirebaseFirestore.WhereFilterOp;
      value: any;
    }> = [],
    orderBy?: { field: string; direction: 'asc' | 'desc' },
    limit?: number,
  ): Promise<Array<T & { id: string }>> {
    try {
      this.flowTracker.trackStep(
        `${collection} koleksiyonundan filtrelenmiş dokümanlar alınıyor`,
        'FirebaseService',
      );
      const startTime = Date.now();

      let query: FirebaseFirestore.Query =
        this.firestore.collection(collection);

      // Filtreleri ekle
      wheres.forEach((where) => {
        query = query.where(where.field, where.operator, where.value);
      });

      // Sıralama ekle
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction);
      }

      // Limit ekle
      if (limit) {
        query = query.limit(limit);
      }

      const querySnapshot = await query.get();

      return querySnapshot.docs.map((doc) => ({
        ...(doc.data() as T),
        id: doc.id,
      }));
    } catch (error) {
      this.logger.error(
        `Firestore çoklu sorgu hatası: ${error.message}`,
        'FirebaseService.findMany',
        __filename,
        597,
      );
      throw error;
    }
  }

  /**
   * Belgeyi silme
   * @param collection Koleksiyon adı
   * @param id Belge ID'si
   * @returns Silme işlemi sonucu
   */
  async delete(collection: string, id: string): Promise<void> {
    try {
      await this.firestore.collection(collection).doc(id).delete();
    } catch (error) {
      this.logger.error(
        `Firestore belge silme hatası: ${error.message}`,
        'FirebaseService.delete',
        __filename,
        612,
      );
      throw error;
    }
  }

  /**
   * Alt koleksiyondaki belgeleri getirme
   * @param parentCollection Üst koleksiyon adı
   * @param parentId Üst belge ID'si
   * @param subCollection Alt koleksiyon adı
   * @returns Alt koleksiyondaki belge dizisi
   */
  async findSubCollection<T>(
    parentCollection: string,
    parentId: string,
    subCollection: string,
  ): Promise<Array<T & { id: string }>> {
    try {
      const querySnapshot = await this.firestore
        .collection(parentCollection)
        .doc(parentId)
        .collection(subCollection)
        .get();

      return querySnapshot.docs.map((doc) => ({
        ...(doc.data() as T),
        id: doc.id,
      }));
    } catch (error) {
      this.logger.error(
        `Firestore alt koleksiyon getirme hatası: ${error.message}`,
        'FirebaseService.findSubCollection',
        __filename,
        641,
      );
      throw error;
    }
  }

  /**
   * Firestore transaction çalıştırır
   * @param updateFunction Transaction işlevi
   * @returns Transaction sonucu
   */
  async runTransaction<T>(
    updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>,
  ): Promise<T> {
    try {
      // Use the Promise.resolve to ensure type safety
      return (await this.firestore.runTransaction(updateFunction)) as T;
    } catch (error) {
      this.logger.error(`Transaction hatası: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Firestore batch işlemi başlatır
   * @returns Firestore WriteBatch nesnesi
   */
  createBatch(): FirebaseFirestore.WriteBatch {
    return this.firestore.batch();
  }

  /**
   * Koleksiyon referansı döndürür
   * @param collection Koleksiyon adı
   * @returns Koleksiyon referansı
   */
  collection(collection: string): FirebaseFirestore.CollectionReference {
    return this.firestore.collection(collection);
  }

  /**
   * Belge referansı döndürür
   * @param collection Koleksiyon adı
   * @param id Belge ID'si
   * @returns Belge referansı
   */
  doc(collection: string, id: string): FirebaseFirestore.DocumentReference {
    return this.firestore.collection(collection).doc(id);
  }

  /**
   * Benzersiz bir ID oluşturur
   * @returns Benzersiz ID
   */
  generateId(): string {
    // Firestore'un kendi ID oluşturma metodunu kullan
    return this.firestore.collection('_').doc().id;
  }

  /**
   * Atomik sayaç artırma/azaltma işlemi
   * @param collection Koleksiyon adı
   * @param id Belge ID'si
   * @param field Artırılacak/azaltılacak alan
   * @param value Artış/azalış değeri
   */
  async increment(
    collection: string,
    id: string,
    field: string,
    value: number,
  ): Promise<void> {
    try {
      const docRef = this.firestore.collection(collection).doc(id);

      // Transaction kullanarak atomik güncelleme
      await this.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new Error(`Belge bulunamadı: ${collection}/${id}`);
        }

        // Mevcut değeri al ve artır
        const currentValue = doc.data()?.[field] || 0;
        const newValue = currentValue + value;

        transaction.update(docRef, { [field]: newValue });
        return newValue;
      });
    } catch (error) {
      this.logger.error(
        `Increment işlemi başarısız: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Diziye eleman ekleme işlemi
   * @param collection Koleksiyon adı
   * @param id Belge ID'si
   * @param field Dizi alanının adı
   * @param value Eklenecek değer veya değerler
   */
  async arrayUnion<T>(
    collection: string,
    id: string,
    field: string,
    value: T | T[],
  ): Promise<void> {
    try {
      const valueToAdd = Array.isArray(value)
        ? admin.firestore.FieldValue.arrayUnion(...value)
        : admin.firestore.FieldValue.arrayUnion(value);

      await this.firestore
        .collection(collection)
        .doc(id)
        .update({
          [field]: valueToAdd,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      this.logger.error(
        `Firestore diziye eleman ekleme hatası: ${error.message}`,
        'FirebaseService.arrayUnion',
        __filename,
        758,
      );
      throw error;
    }
  }

  /**
   * Diziden eleman çıkarma işlemi
   * @param collection Koleksiyon adı
   * @param id Belge ID'si
   * @param field Dizi alanının adı
   * @param value Çıkarılacak değer veya değerler
   */
  async arrayRemove<T>(
    collection: string,
    id: string,
    field: string,
    value: T | T[],
  ): Promise<void> {
    try {
      const valueToRemove = Array.isArray(value)
        ? admin.firestore.FieldValue.arrayRemove(...value)
        : admin.firestore.FieldValue.arrayRemove(value);

      await this.firestore
        .collection(collection)
        .doc(id)
        .update({
          [field]: valueToRemove,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      this.logger.error(
        `Firestore diziden eleman çıkarma hatası: ${error.message}`,
        'FirebaseService.arrayRemove',
        __filename,
        791,
      );
      throw error;
    }
  }

  /**
   * Veritabanında belge sayısını hesaplama
   * @param collection Koleksiyon adı
   * @param wheres Sorgulama koşulları dizisi [{field, operator, value}]
   * @returns Belge sayısı
   */
  async count(
    collection: string,
    wheres: Array<{
      field: string;
      operator: FirebaseFirestore.WhereFilterOp;
      value: any;
    }> = [],
  ): Promise<number> {
    try {
      let query: FirebaseFirestore.Query =
        this.firestore.collection(collection);

      // Filtreleri ekle
      wheres.forEach((where) => {
        query = query.where(where.field, where.operator, where.value);
      });

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      this.logger.error(
        `Firestore sayım hatası: ${error.message}`,
        'FirebaseService.count',
        __filename,
        824,
      );
      throw error;
    }
  }

  /**
   * Find all documents in a collection that match a field value
   */
  async findAll<T>(
    collection: string,
    field: string,
    operator: admin.firestore.WhereFilterOp,
    value: any,
    orderBy?: string,
  ): Promise<T[]> {
    try {
      let query = this.firestore
        .collection(collection)
        .where(field, operator, value);

      if (orderBy) {
        query = query.orderBy(orderBy);
      }

      const querySnapshot = await query.get();

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      this.logger.error(`Error in findAll: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Convert any object (including DTOs with prototypes) to a plain JavaScript object
   * that can be safely stored in Firestore
   * @param obj The object to convert
   * @returns A plain JavaScript object without prototypes
   */
  toPlainObject(obj: any): any {
    // Use the utility function from firestore.utils.ts
    return toPlainObject(obj);
  }

  // ==================== CACHE DESTEKLI PERFORMANS METHODLARı ====================

  /**
   * Cache anahtarı oluşturur
   */
  private createCacheKey(operation: string, ...params: any[]): string {
    return `${this.CACHE_PREFIX}${operation}:${params.join(':')}`;
  }

  /**
   * Cache'den veri alır veya yoksa Firestore'dan alır ve cache'e koyar
   * @param collection Koleksiyon adı
   * @param id Belge ID'si
   * @param ttl Cache süresi (saniye)
   * @returns Belge
   */
  async findByIdCached<T>(
    collection: string,
    id: string,
    ttl: number = this.DEFAULT_CACHE_TTL,
  ): Promise<(T & { id: string }) | null> {
    const cacheKey = this.createCacheKey('findById', collection, id);
    
    try {
      // Cache'den kontrol et
      const cached = await this.cacheManager.get<T & { id: string }>(cacheKey);
      if (cached) {
        this.logger.debug(
          `Cache hit: ${cacheKey}`,
          'FirebaseService.findByIdCached',
        );
        return cached;
      }

      // Cache'de yoksa Firestore'dan al
      const result = await this.findById<T>(collection, id);
      
      // Sonucu cache'e kaydet
      if (result) {
        await this.cacheManager.set(cacheKey, result, ttl * 1000);
        this.logger.debug(
          `Cache set: ${cacheKey}`,
          'FirebaseService.findByIdCached',
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Cache destekli findById hatası: ${error.message}`,
        'FirebaseService.findByIdCached',
      );
      // Cache hatası durumunda direkt Firestore'dan al
      return this.findById<T>(collection, id);
    }
  }

  /**
   * Cache destekli findMany işlemi
   * @param collection Koleksiyon adı
   * @param wheres Sorgulama koşulları
   * @param orderBy Sıralama
   * @param limit Limit
   * @param ttl Cache süresi
   * @returns Belge dizisi
   */
  async findManyCached<T>(
    collection: string,
    wheres: Array<{
      field: string;
      operator: FirebaseFirestore.WhereFilterOp;
      value: any;
    }> = [],
    orderBy?: { field: string; direction: 'asc' | 'desc' },
    limit?: number,
    ttl: number = this.DEFAULT_CACHE_TTL,
  ): Promise<Array<T & { id: string }>> {
    const cacheKey = this.createCacheKey(
      'findMany',
      collection,
      JSON.stringify(wheres),
      JSON.stringify(orderBy),
      limit?.toString() || 'no-limit',
    );

    try {
      // Cache'den kontrol et
      const cached = await this.cacheManager.get<Array<T & { id: string }>>(cacheKey);
      if (cached) {
        this.logger.debug(
          `Cache hit: ${cacheKey}`,
          'FirebaseService.findManyCached',
        );
        return cached;
      }

      // Cache'de yoksa Firestore'dan al
      const result = await this.findMany<T>(collection, wheres, orderBy, limit);
      
      // Sonucu cache'e kaydet
      await this.cacheManager.set(cacheKey, result, ttl * 1000);
      this.logger.debug(
        `Cache set: ${cacheKey}`,
        'FirebaseService.findManyCached',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Cache destekli findMany hatası: ${error.message}`,
        'FirebaseService.findManyCached',
      );
      // Cache hatası durumunda direkt Firestore'dan al
      return this.findMany<T>(collection, wheres, orderBy, limit);
    }
  }

  /**
   * Belirli alanları seçerek getiren optimize edilmiş method
   * @param collection Koleksiyon adı
   * @param id Belge ID'si
   * @param fields Getirilecek alanlar
   * @returns Seçili alanlarla belge
   */
  async findByIdSelect<T, K extends keyof T>(
    collection: string,
    id: string,
    fields: K[],
  ): Promise<Pick<T, K> & { id: string } | null> {
    try {
      this.flowTracker.trackStep(
        `${collection} koleksiyonundan ${id} ID'li dökümanın seçili alanları alınıyor`,
        'FirebaseService',
      );
      const startTime = Date.now();
      
      const docRef = this.firestore.collection(collection).doc(id);
      const doc = await docRef.get();

      const endTime = Date.now();
      this.flowTracker.trackDbOperation(
        'READ_SELECT',
        collection,
        endTime - startTime,
        'FirebaseService',
      );

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      if (!data) return null;

      // Sadece istenen alanları seç
      const selectedData = {} as Pick<T, K>;
      fields.forEach(field => {
        if (data[field.toString()] !== undefined) {
          selectedData[field] = data[field.toString()];
        }
      });

      return { ...selectedData, id: doc.id };
    } catch (error) {
      this.logger.error(
        `Firestore seçili alan getirme hatası: ${error.message}`,
        'FirebaseService.findByIdSelect',
      );
      throw error;
    }
  }

  /**
   * Cache'i temizler
   * @param pattern Temizlenecek cache pattern'i
   */
  async clearCache(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        // Belirli pattern'e göre temizleme (basit implementation)
        this.logger.info(
          `Cache pattern temizleniyor: ${pattern}`,
          'FirebaseService.clearCache',
        );
        // Cache manager'ın store'una erişim gerekebilir
        // Bu implementasyon cache manager tipine bağlı
      } else {
        // Tüm cache'i temizle
        await this.cacheManager.reset();
        this.logger.info(
          'Tüm cache temizlendi',
          'FirebaseService.clearCache',
        );
      }
    } catch (error) {
      this.logger.error(
        `Cache temizleme hatası: ${error.message}`,
        'FirebaseService.clearCache',
      );
    }
  }

  /**
   * Belge güncellemesi sonrası cache'i temizler
   * @param collection Koleksiyon adı
   * @param id Belge ID'si
   * @param data Güncellenecek veri
   * @returns Güncellenen belge
   */
  async updateAndClearCache<T>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<T & { id: string }> {
    try {
      // Önce güncelleme yap
      const result = await this.update<T>(collection, id, data);
      
      // İlgili cache'leri temizle
      const specificCacheKey = this.createCacheKey('findById', collection, id);
      await this.cacheManager.del(specificCacheKey);
      
      this.logger.debug(
        `Cache temizlendi: ${specificCacheKey}`,
        'FirebaseService.updateAndClearCache',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Güncelleme ve cache temizleme hatası: ${error.message}`,
        'FirebaseService.updateAndClearCache',
      );
      throw error;
    }
  }

  /**
   * Batch işlemlerini optimize eder
   * @param operations Batch operasyonları
   * @returns Batch sonucu
   */
  async optimizedBatch(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      collection: string;
      id?: string;
      data?: any;
    }>,
  ): Promise<void> {
    try {
      this.flowTracker.trackStep(
        `${operations.length} adet batch operasyonu başlatılıyor`,
        'FirebaseService',
      );
      const startTime = Date.now();

      const batch = this.createBatch();

      operations.forEach(operation => {
        const { type, collection, id, data } = operation;
        
        switch (type) {
          case 'create':
            if (id) {
              const docRef = this.firestore.collection(collection).doc(id);
              batch.set(docRef, {
                ...data,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            }
            break;
            
          case 'update':
            if (id) {
              const docRef = this.firestore.collection(collection).doc(id);
              batch.update(docRef, {
                ...data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            }
            break;
            
          case 'delete':
            if (id) {
              const docRef = this.firestore.collection(collection).doc(id);
              batch.delete(docRef);
            }
            break;
        }
      });

      await batch.commit();

      const endTime = Date.now();
      this.flowTracker.trackDbOperation(
        'BATCH',
        'multiple',
        endTime - startTime,
        'FirebaseService',
      );

      this.logger.info(
        `Batch işlemi tamamlandı: ${operations.length} operasyon`,
        'FirebaseService.optimizedBatch',
      );
    } catch (error) {
      this.logger.error(
        `Batch işlemi hatası: ${error.message}`,
        'FirebaseService.optimizedBatch',
      );
      throw error;
    }
  }

  /**
   * Pagination destekli sorgulama
   * @param collection Koleksiyon adı
   * @param pageSize Sayfa boyutu
   * @param lastDoc Son belge (pagination için)
   * @param wheres Sorgulama koşulları
   * @param orderBy Sıralama
   * @returns Sayfalanmış sonuç
   */
  async findWithPagination<T>(
    collection: string,
    pageSize: number,
    lastDoc?: FirebaseFirestore.DocumentSnapshot,
    wheres: Array<{
      field: string;
      operator: FirebaseFirestore.WhereFilterOp;
      value: any;
    }> = [],
    orderBy?: { field: string; direction: 'asc' | 'desc' },
  ): Promise<{
    data: Array<T & { id: string }>;
    lastDoc: FirebaseFirestore.DocumentSnapshot | null;
    hasMore: boolean;
  }> {
    try {
      this.flowTracker.trackStep(
        `${collection} koleksiyonundan sayfalanmış veri alınıyor`,
        'FirebaseService',
      );
      const startTime = Date.now();

      let query: FirebaseFirestore.Query = this.firestore.collection(collection);

      // Filtreleri ekle
      wheres.forEach((where) => {
        query = query.where(where.field, where.operator, where.value);
      });

      // Sıralama ekle
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction);
      }

      // Pagination
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      // Bir fazla al ki sonraki sayfa olup olmadığını bilelim
      query = query.limit(pageSize + 1);

      const querySnapshot = await query.get();

      const endTime = Date.now();
      this.flowTracker.trackDbOperation(
        'READ_PAGINATED',
        collection,
        endTime - startTime,
        'FirebaseService',
      );

      const docs = querySnapshot.docs;
      const hasMore = docs.length > pageSize;
      
      // Son fazla belgeyi çıkar
      if (hasMore) {
        docs.pop();
      }

      const data = docs.map((doc) => ({
        ...(doc.data() as T),
        id: doc.id,
      }));

      return {
        data,
        lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
        hasMore,
      };
    } catch (error) {
      this.logger.error(
        `Pagination sorgu hatası: ${error.message}`,
        'FirebaseService.findWithPagination',
      );
      throw error;
    }
  }
}
