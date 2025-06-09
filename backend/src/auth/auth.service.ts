import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRefreshToken } from '../common/types/user-refresh-token.type';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import { FIRESTORE_COLLECTIONS } from '../common/constants';
import { logError, logFlow } from '../common/utils/logger.utils';
import { LoggerService } from '../common/services/logger.service';
import { FlowTrackerService } from '../common/services/flow-tracker.service';
import { LogMethod } from '../common/decorators';

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;
  private readonly flowTracker: FlowTrackerService;
  private readonly SALT_ROUNDS = 10;
  private readonly REFRESH_TOKEN_VALIDITY_DAYS = 7;
  private readonly ACCESS_TOKEN_EXPIRES_IN_MS = 15 * 60 * 1000; // 15 dakika
  private readonly REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

  constructor(
    private firebaseService: FirebaseService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    this.logger = LoggerService.getInstance();
    this.flowTracker = FlowTrackerService.getInstance();
    logFlow('AuthService başlatıldı', 'AuthService.constructor');
  }

  /**
   * Sistem production modunda mı çalışıyor
   * @returns {boolean} Production modunda ise true
   */
  isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  /**
   * Access token'ın geçerlilik süresini milisaniye cinsinden döndürür
   * @returns {number} Access token'ın geçerlilik süresi (ms)
   */
  getAccessTokenExpiresInMs(): number {
    return this.ACCESS_TOKEN_EXPIRES_IN_MS;
  }

  /**
   * Refresh token'ın geçerlilik süresini milisaniye cinsinden döndürür
   * @returns {number} Refresh token'ın geçerlilik süresi (ms)
   */
  getRefreshTokenExpiresInMs(): number {
    return this.REFRESH_TOKEN_EXPIRES_IN_MS;
  }

  /**
   * Google ID token ile giriş yapar
   * @param idToken Google ID token
   * @param ipAddress Kullanıcının IP adresi
   * @param userAgent Kullanıcının tarayıcı bilgisi
   * @param res HTTP yanıt nesnesi (cookie ayarlamak için)
   */
  @LogMethod({ trackParams: true })
  async loginWithGoogle(
    idToken: string,
    ipAddress?: string,
    userAgent?: string,
    res?: any,
  ): Promise<{ user: any; token?: string; refreshToken?: string }> {
    this.logger.debug(
      'Google ID token ile giriş yapılıyor',
      'AuthService.loginWithGoogle',
      __filename,
      66,
    );

    // Aslında Google ID token ile giriş, normal ID token ile aynı
    // işlemi yapıyor, sadece token'ın kaynağı farklı
    return this.loginWithIdToken(idToken, ipAddress, userAgent, res);
  }

  /**
   * Firebase ID token ile giriş yapar ve kullanıcıyı sisteme kaydeder
   * @param idToken Firebase ID token
   * @param ipAddress Kullanıcı IP adresi
   * @param userAgent Kullanıcı tarayıcı bilgisi
   * @param res Express yanıt nesnesi (cookie'ler için)
   * @param additionalData Ek kullanıcı verileri
   * @returns Kullanıcı ve token bilgileri
   */
  @LogMethod({ trackParams: false })
  async loginWithIdToken(
    idToken: string,
    ipAddress?: string,
    userAgent?: string,
    res?: any,
    additionalData?: {
      firstName?: string;
      lastName?: string;
      password?: string;
    },
  ): Promise<{ user: any; token?: string; refreshToken?: string }> {
    logFlow('ID token ile giriş yapılıyor', 'AuthService.loginWithIdToken');
    try {
      this.flowTracker.trackStep('ID token ile giriş yapılıyor', 'AuthService');
      // Verify Firebase ID token
      this.logger.debug(
        `ID token doğrulanıyor: ${idToken.substring(0, 30)}...`,
        'AuthService.loginWithIdToken',
        __filename,
        '46', // String olarak satır numarası
      );
      const decodedToken =
        await this.firebaseService.auth.verifyIdToken(idToken);
      this.logger.debug(
        `ID token doğrulandı. UID: ${decodedToken.uid}`,
        'AuthService.loginWithIdToken',
        __filename,
        '53', // String olarak satır numarası
      );

      if (!decodedToken.uid) {
        logFlow('Geçersiz kimlik: UID yok', 'AuthService.loginWithIdToken');
        throw new UnauthorizedException('Geçersiz kimlik');
      }

      // Get user info from Firebase
      logFlow(
        `Firebase kullanıcısı alınıyor: ${decodedToken.uid}`,
        'AuthService.loginWithIdToken',
      );
      this.logger.debug(
        `Firebase'den kullanıcı bilgisi alınıyor: ${decodedToken.uid}`,
        'AuthService.loginWithIdToken',
        __filename,
        '67', // String olarak satır numarası
      );
      const firebaseUser = await this.firebaseService.auth.getUser(
        decodedToken.uid,
      );
      this.logger.debug(
        `Firebase kullanıcı bilgisi alındı: ${firebaseUser.email}`,
        'AuthService.loginWithIdToken',
        __filename,
        '74', // String olarak satır numarası
      );

      if (!firebaseUser.email) {
        // Error için doğru obje loglaması
        const error = new Error(
          `Firebase user has no email: ${firebaseUser.uid}`,
        );
        logError(error, 'AuthService.loginWithIdToken', __filename, '83', {
          userId: firebaseUser.uid,
          stack: error.stack,
          context: 'Email validation',
        });
        throw new BadRequestException(
          'Kullanıcı email bilgisi eksik. Firebase hesabınızda email adresinizi doğrulayın.',
        );
      }

      // Backend kullanıcı tablosunda da kullanıcıyı bul veya oluştur
      logFlow(
        `Kullanıcı bulunuyor veya oluşturuluyor: ${firebaseUser.email}`,
        'AuthService.loginWithIdToken',
      );
      this.logger.debug(
        `Yerel kullanıcı bulunuyor veya oluşturuluyor: ${firebaseUser.email}, Ek Veri: ${JSON.stringify(additionalData)}`,
        'AuthService.loginWithIdToken',
        __filename,
        '92', // String olarak satır numarası
      );
      const user = await this.usersService.findOrCreateUser(
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        },
        additionalData,
      );

      // Her başarılı girişte son giriş tarihini güncelle
      logFlow(
        `Son giriş tarihi güncelleniyor: ${user.id}`,
        'AuthService.loginWithIdToken',
      );
      this.logger.debug(
        `Son giriş tarihi güncelleniyor: ${user.id}`,
        'AuthService.loginWithIdToken',
        __filename,
        107, // Satır numarasını kontrol et
      );
      await this.usersService.updateLastLogin(user.id);

      // Kullanıcı bilgilerini veritabanından al
      const userData = {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileImageUrl: user.profileImageUrl || null,
        role: user.role,
        onboarded: user.onboarded,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        settings: user.settings || {},
      };

      // Refresh token oluştur
      logFlow('Refresh token oluşturuluyor', 'AuthService.loginWithIdToken');
      this.logger.debug(
        `Refresh token oluşturuluyor: Kullanıcı ID: ${user.id}`,
        'AuthService.loginWithIdToken',
        __filename,
        127, // Satır numarasını kontrol et
      );
      const refreshToken = await this.createRefreshToken(
        user.id,
        ipAddress,
        userAgent,
      );

      // Cookie'ler için yapılandırma - backend tarafında token yönetimi için HTTP Only cookie'ler kullan
      if (res && res.cookie) {
        this.setAuthCookies(res, idToken, refreshToken, user.id);
        this.logger.debug(
          "Auth cookie'leri başarıyla ayarlandı",
          'AuthService.loginWithIdToken',
          __filename,
          90,
          { userId: user.id },
        );
      } else {
        this.logger.warn(
          "Yanıt nesnesi olmadığı için cookie'ler ayarlanamadı",
          'AuthService.loginWithIdToken',
          __filename,
          97,
        );
      }

      logFlow('Giriş başarılı', 'AuthService.loginWithIdToken');
      this.logger.info(
        'Kullanıcı başarıyla giriş yaptı',
        'AuthService.loginWithIdToken',
        __filename,
        undefined,
        { userId: user.id, email: user.email },
      );

      // Client stratejisine bağlı olarak token'ı paylaş veya paylaşma
      // Client token'ı cookie olarak alacaksa, burada dönmemize gerek yok
      const responseData = {
        user: userData,
        ...(!res || !res.cookie
          ? { token: idToken, refreshToken: refreshToken }
          : {}),
      };

      return responseData;
    } catch (error) {
      // Hata bilgilerini hazırla
      const errorInfo = {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        idToken: idToken ? '***' : undefined,
        ipAddress,
      };

      // Hata loglaması - doğru parametrelerle
      logError(
        error instanceof Error ? error : new Error(String(error)),
        'AuthService.loginWithIdToken',
        __filename,
        undefined,
        errorInfo,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Giriş işlemi sırasında bir hata oluştu',
      );
    }
  }

  /**
   * Bir HTTP yanıtında auth cookie'leri ayarlar
   * @param res HTTP yanıt nesnesi
   * @param token Access token
   * @param refreshToken Refresh token
   * @param userId Kullanıcı ID'si
   */
  private setAuthCookies(
    res: any,
    token: string,
    refreshToken: string,
    userId: string,
  ): void {
    if (!res || !res.cookie) {
      this.logger.warn(
        'Cookie ayarlama fonksiyonu bulunamadı',
        'AuthService.setAuthCookies',
        __filename,
        149,
      );
      return;
    }

    try {
      // Üretim ortamı için secure cookie ayarı
      const isProduction = process.env.NODE_ENV === 'production';

      // Access token cookie - kısa ömürlü (1 saat)
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000, // 1 saat
        path: '/',
      });

      // Refresh token cookie - uzun ömürlü (7 gün)
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: this.REFRESH_TOKEN_VALIDITY_DAYS * 24 * 60 * 60 * 1000, // 7 gün
        path: '/',
      });

      // Oturum cookie - kullanıcı ID'si içerir, tarayıcı tarafından erişilebilir
      res.cookie(
        'auth_session',
        JSON.stringify({
          userId,
          isLoggedIn: true,
          expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        }),
        {
          httpOnly: false, // Client JavaScript tarafından okunabilir
          secure: isProduction,
          sameSite: 'lax',
          maxAge: 60 * 60 * 1000, // 1 saat
          path: '/',
        },
      );

      this.logger.debug(
        "Auth cookie'leri ayarlandı",
        'AuthService.setAuthCookies',
        __filename,
        189,
      );
    } catch (error) {
      this.logger.error(
        'Cookie ayarlama sırasında hata',
        'AuthService.setAuthCookies',
        __filename,
        196,
        undefined,
        {
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }

  /**
   * Refresh token kullanarak yeni bir access token (JWT Token) oluşturur
   * @param refreshToken Cookie'den alınan orijinal (hashlenmemiş) refresh token
   * @returns Yeni access token (JWT Token)
   */
  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; newRefreshToken?: string }> {
    this.logger.debug(`[AuthService] Attempting to refresh token. Received token (first 10 chars): ${refreshToken ? refreshToken.substring(0, 10) + '...' : 'NONE'}`, 'AuthService.refreshToken', __filename); 
    this.logger.debug(
      `Token yenileme isteği: Token: ${refreshToken ? refreshToken.substring(0, 10) + '...' : 'Yok'}`,
      'AuthService.refreshToken',
      __filename,
      218,
    );
    try {
      const validationResult =
        await this.validateAndGetUserByRefreshToken(refreshToken);
      if (!validationResult) {
        this.logger.warn(
          `[AuthService] Refresh token validation failed. Token (first 10 chars): ${refreshToken ? refreshToken.substring(0, 10) + '...' : 'NONE'}. No valid user or token found in DB.`,
          'AuthService.refreshToken',
          __filename,
        );
        throw new UnauthorizedException(
          'Geçersiz veya süresi dolmuş refresh token',
        );
      }

      const { user, storedTokenId } = validationResult; 

      if (!user || !user.firebaseUid) {
        this.logger.error(
          `[AuthService] Refresh token validated (DB ID: ${storedTokenId}), but user data or firebaseUid is missing.`,
          'AuthService.refreshToken',
          __filename,
          undefined,
          { userJson: JSON.stringify(user) }
        );
        throw new UnauthorizedException('Kullanıcı verisi bulunamadı');
      }

      // JWT Token oluştur (Firebase Custom Token yerine)
      let jwtToken;
      try {
        // JWT Secret'i al
        const jwtSecret = this.configService.get<string>('JWT_SECRET') || 
                         process.env.JWT_SECRET || 
                         'bitirme_projesi_gizli_anahtar';
        
        // JWT Payload'ı hazırla
        const payload = {
          sub: user.firebaseUid, // Subject - kullanıcının Firebase UID'si
          email: user.email,
          role: user.role || 'USER',
          iat: Math.floor(Date.now() / 1000), // Issued at
        };

        // JWT Token'ı imzala
        const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
        jwtToken = jwt.sign(payload, jwtSecret, { expiresIn });

        this.logger.debug(
          `JWT token oluşturuldu: Kullanıcı ${user.id}, Geçerlilik süresi: ${expiresIn}`,
          'AuthService.refreshToken',
          __filename,
        );
      } catch (jwtError) {
        this.logger.error(
          `[AuthService] JWT token creation failed for user ${user?.id}.`,
          'AuthService.refreshToken',
          __filename,
          undefined,
          { errorMessage: jwtError instanceof Error ? jwtError.message : String(jwtError) }
        );
        throw new InternalServerErrorException('Token oluşturulamadı');
      }

      this.logger.info(
        `[AuthService] JWT token successfully refreshed for user ${user.id}. DB Token ID: ${storedTokenId}`,
        'AuthService.refreshToken',
        __filename,
        '242', // Preserving original line number as string
      );

      return {
        accessToken: jwtToken,
        // newRefreshToken: newRefreshTokenString // Rotasyon aktifse
      };
    } catch (error) {
      this.logger.error(
        `[AuthService] Error during refreshToken process. Token (first 10 chars): ${refreshToken ? refreshToken.substring(0, 10) + '...' : 'NONE'}. Error: ${error.message}`,
        'AuthService.refreshToken',
        __filename,
        undefined,
        {
          hasRefreshToken: !!refreshToken,
          errorName: error.name,
          errorMessage: error.message,
          // stack: error.stack, // Stack can be very verbose
          errorContext: 'Token yenileme sırasında hata',
        }
      );
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token yenileme başarısız oldu');
    }
  }

  /**
   * Kullanıcı için güvenli bir refresh token oluşturur ve Firestore'da saklar
   * @param userId Kullanıcı ID'si
   * @param ipAddress İsteğin yapıldığı IP adresi (isteğe bağlı)
   * @param userAgent Kullanıcının tarayıcı/cihaz bilgisi (isteğe bağlı)
   * @returns Oluşturulan orijinal refresh token (hashlenMEmiş)
   */
  private async createRefreshToken(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    this.logger.debug(
      `createRefreshToken çağrıldı: Kullanıcı ID: ${userId}`,
      'AuthService.createRefreshToken',
      __filename,
      474,
    );
    try {
      // Önce aynı kullanıcı için mevcut tokenları temizle
      // Bu sayede sürekli yeni tokenlar oluşturulmasını engelliyoruz
      await this.cleanupOldRefreshTokens(userId, userAgent);

      // Benzersiz bir token oluştur
      const originalToken = uuidv4();

      // Token'ı hashle
      const hashedToken = await bcrypt.hash(originalToken, this.SALT_ROUNDS);
      const tokenHash = crypto
        .createHash('sha256')
        .update(originalToken)
        .digest('hex');
      // Geçerlilik tarihini hesapla
      const expiresAtDate = new Date();
      expiresAtDate.setDate(
        expiresAtDate.getDate() + this.REFRESH_TOKEN_VALIDITY_DAYS,
      );

      // UserRefreshToken nesnesi oluştur
      const refreshToken: UserRefreshToken = {
        userId,
        hashedToken,
         tokenHash,
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAtDate),
        createdAt: admin.firestore.Timestamp.now(),
      };

      // İsteğe bağlı alanları sadece tanımlıysa ekle
      if (ipAddress) {
        refreshToken.ipAddress = ipAddress;
      }

      if (userAgent) {
        refreshToken.userAgent = userAgent;
      }

      // Firestore'a kaydet
      await this.firebaseService.create(
        FIRESTORE_COLLECTIONS.REFRESH_TOKENS,
        refreshToken,
      );

      // Orijinal token'ı döndür (hashlenMEmiş)
      return originalToken;
    } catch (error) {
      this.logger.error(
        `Refresh token oluşturma hatası: ${error instanceof Error ? error.message : String(error)}`,
        'AuthService.createRefreshToken',
        __filename,
        undefined,
        error instanceof Error ? error : undefined,
      );
      throw new InternalServerErrorException('Refresh token oluşturulamadı');
    }
  }

  /**
   * Aynı kullanıcı ve tarayıcı/cihaz kombinasyonu için eski refresh tokenları temizler
   * @param userId Kullanıcı ID'si
   * @param userAgent Kullanıcının tarayıcı/cihaz bilgisi
   */
  private async cleanupOldRefreshTokens(
    userId: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      // Aynı kullanıcıya ait tüm tokenları bulalım
      // Firebase WhereFilterOp tipine uygun olarak sorgu oluşturalım
      let conditions: any[] = [
        {
          field: 'userId',
          operator: '==',
          value: userId,
        },
      ];

      // Eğer userAgent belirtilmişse, aynı cihazdan gelen tokenları hedefle
      if (userAgent) {
        conditions.push({
          field: 'userAgent',
          operator: '==',
          value: userAgent,
        });
      }

      const existingTokens =
        await this.firebaseService.findMany<UserRefreshToken>(
          FIRESTORE_COLLECTIONS.REFRESH_TOKENS,
          conditions,
        );

      // Bu kullanıcı için token varsa hepsini temizle
      if (existingTokens && existingTokens.length > 0) {
        this.logger.info(
          `Kullanıcı ${userId} için ${existingTokens.length} eski token temizleniyor`,
          'AuthService.cleanupOldRefreshTokens',
          __filename,
        );

        // Tüm eski tokenları sil
        const deletePromises = existingTokens.map((token) =>
          this.firebaseService.delete(
            FIRESTORE_COLLECTIONS.REFRESH_TOKENS,
            token.id,
          ),
        );

        await Promise.all(deletePromises);
      }
    } catch (error) {
      // Hata olsa bile devam et, yeni token oluşturmayı engelleme
      this.logger.warn(
        `Eski token temizleme hatası: ${error instanceof Error ? error.message : String(error)}`,
        'AuthService.cleanupOldRefreshTokens',
        __filename,
      );
    }
  }

  /**
   * Orijinal (hashlenmemiş) refresh token'ı doğrular, ilgili kullanıcıyı ve token ID'sini döndürür.
   * Veritabanındaki *tüm* tokenları taramak yerine, potansiyel eşleşmeleri bulmak için daha verimli bir yol izler.
   * Not: Bu yöntem hala tüm tokenları getirebilir, daha büyük sistemlerde tokenları hash'lerine göre indekslemek daha iyi olabilir.
   * @param token Doğrulanacak orijinal refresh token (hashlenMEmiş)
   * @returns { user: Kullanıcı nesnesi, storedTokenId: Veritabanındaki token ID'si } veya hata
   */
  private async validateAndGetUserByRefreshToken(
    token: string,
  ): Promise<{ user: any; storedTokenId: string } | null> {
    this.logger.debug(`[AuthService] validateAndGetUserByRefreshToken called. Received token (first 10 chars): ${token ? token.substring(0, 10) + '...' : 'NONE'}`, 'AuthService.validateAndGetUserByRefreshToken', __filename); 
    this.logger.debug(
      `validateAndGetUserByRefreshToken çağrıldı: Token: ${token ? token.substring(0, 10) + '...' : 'Yok'}`,
      'AuthService.validateAndGetUserByRefreshToken',
      __filename,
      308, // Satır numarasını kontrol et
    );
    try {
     
      const now = admin.firestore.Timestamp.now();
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      this.logger.debug(`[AuthService] Generated SHA256 hash for received token: ${tokenHash}`, 'AuthService.validateAndGetUserByRefreshToken', __filename); 

      const potentialTokens =
         await this.firebaseService.findMany<UserRefreshToken>(
          FIRESTORE_COLLECTIONS.REFRESH_TOKENS,
          [
            { field: 'tokenHash', operator: '==', value: tokenHash },
            { field: 'expiresAt', operator: '>=', value: now },
          ],
          undefined,
          1,
        );
      
      this.logger.debug(`[AuthService] Found ${potentialTokens ? potentialTokens.length : 0} potential token(s) in DB matching hash and expiry.`, 'AuthService.validateAndGetUserByRefreshToken', __filename); 

      if (!potentialTokens || potentialTokens.length === 0) {
        this.logger.warn(
          `[AuthService] No active refresh token found in DB for hash: ${tokenHash}. Token (first 10 chars): ${token ? token.substring(0, 10) + '...' : 'NONE'}`,
          'AuthService.validateAndGetUserByRefreshToken',
          __filename,
        );
        return null;
      }
      const storedToken = potentialTokens[0];
      this.logger.debug(`[AuthService] Potential token found in DB. ID: ${storedToken.id}, UserID: ${storedToken.userId}, HashedToken (bcrypt): ${storedToken.hashedToken ? storedToken.hashedToken.substring(0,10) + '...': 'N/A'}`, 'AuthService.validateAndGetUserByRefreshToken', __filename); 

      const isValid = await bcrypt.compare(token, storedToken.hashedToken);
      this.logger.debug(`[AuthService] bcrypt.compare result for received token against DB token (ID: ${storedToken.id}): ${isValid}`, 'AuthService.validateAndGetUserByRefreshToken', __filename); 

      if (!isValid) {
        this.logger.warn(`[AuthService] bcrypt.compare failed for DB token ID: ${storedToken.id}. Received token (first 10 chars): ${token ? token.substring(0, 10) + '...' : 'NONE'} did not match stored hashedToken.`, 'AuthService.validateAndGetUserByRefreshToken', __filename); 
        return null;
   
      }
      const user = await this.usersService.findById(storedToken.userId);
      if (!user) {
        this.logger.error(
          `[AuthService] Refresh token (DB ID: ${storedToken.id}) is valid, but associated user (ID: ${storedToken.userId}) not found in users collection.`,
          'AuthService.validateAndGetUserByRefreshToken',
          __filename,
          '350', // Preserving original line number as string
        );
        return null;
      }

      const validTokenInfo: { user: any; storedTokenId: string } = {
        user,
        storedTokenId: storedToken.id,
      };

      this.logger.info(
        `[AuthService] Refresh token successfully validated. User ID: ${validTokenInfo.user.id}, DB Token ID: ${validTokenInfo.storedTokenId}`,
        'AuthService.validateAndGetUserByRefreshToken',
        __filename 
      );
      return validTokenInfo;
    } catch (error) {
      this.logger.error(
        `[AuthService] Error in validateAndGetUserByRefreshToken. Token (first 10 chars): ${token ? token.substring(0, 10) + '...' : 'NONE'}. Error: ${error.message}`,
        'AuthService.validateAndGetUserByRefreshToken',
        __filename,
        undefined,
        {
          errorName: error.name,
          errorMessage: error.message,
          // stack: error.stack,
          errorContext: 'Refresh token doğrulama sırasında genel hata',
        }
      );
      return null;
    }
  }

  /**
   * Belirtilen ID'ye sahip refresh token'ı siler.
   * @param tokenId Silinecek token'ın Firestore ID'si
   */
  private async removeRefreshTokenById(tokenId: string): Promise<void> {
    this.logger.debug(
      `removeRefreshTokenById çağrıldı: Token ID: ${tokenId}`,
      'AuthService.removeRefreshTokenById',
      __filename,
      400, // Satır numarasını kontrol et
    );
    try {
      await this.firebaseService.delete(
        FIRESTORE_COLLECTIONS.REFRESH_TOKENS,
        tokenId,
      );
    } catch (error) {
      this.logger.logError(error, 'AuthService.removeRefreshTokenById', {
        tokenId,
        errorContext: 'Refresh token ID ile silinirken hata',
      });
      // Hata olsa bile devam et, logout/refresh işlemini engelleme
    }
  }

  /**
   * Eski: Refresh token'ı doğrular ve ilişkili kullanıcıyı döndürür (Artık kullanılmıyor olabilir)
   * @param userId Kullanıcı ID'si
   * @param token Doğrulanacak orijinal refresh token (hashlenMEmiş)
   * @returns İlişkili kullanıcı veya hata (token geçersizse)
   */
  private async validateRefreshToken_OLD(
    userId: string,
    token: string,
  ): Promise<any> {
    this.logger.debug(
      `validateRefreshToken_OLD çağrıldı: Kullanıcı ID: ${userId}, Token: ${token ? token.substring(0, 10) + '...' : 'Yok'}`,
      'AuthService.validateRefreshToken_OLD',
      __filename,
      308, // Satır numarasını kontrol et
    );
    try {
      // Kullanıcının tüm refresh token'larını getir
      const tokens = await this.firebaseService.findMany<UserRefreshToken>(
        FIRESTORE_COLLECTIONS.REFRESH_TOKENS,
        [
          {
            field: 'userId',
            operator: '==',
            value: userId,
          },
        ],
      );

      // Şimdi geçerli token'ı bul
      const now = admin.firestore.Timestamp.now();
      const validToken = await Promise.all(
        tokens.map(async (refreshToken) => {
          // Süresi dolmuş tokenları kontrol et
          if (refreshToken.expiresAt.toMillis() < now.toMillis()) {
            return null;
          }

          // Hash'i karşılaştır
          const isValid = await bcrypt.compare(token, refreshToken.hashedToken);
          return isValid ? refreshToken : null;
        }),
      ).then((results) => results.find((result) => result !== null));

      if (!validToken) {
        return null;
      }

      // Valid token bulundu, kullanıcı bilgilerini getir
      return this.usersService.findById(userId);
    } catch (error) {
      this.logger.error(
        `Refresh token doğrulama hatası: ${error instanceof Error ? error.message : String(error)}`,
        'AuthService.validateRefreshToken_OLD',
        __filename,
        342, // Satır numarasını kontrol et
        error instanceof Error ? error : undefined,
      );
      return null;
    }
  }

  /**
   * Refresh token'ı silmek için kullanılır (logout işlemi sırasında)
   */
  async removeRefreshToken(userId: string, token: string): Promise<void> {
    this.logger.debug(`[AuthService] removeRefreshToken called. UserID: ${userId}, Token (first 10 chars): ${token ? token.substring(0, 10) + '...' : 'NONE'}`, 'AuthService.removeRefreshToken', __filename); 
    this.logger.debug(
      `removeRefreshToken çağrıldı: Kullanıcı ID: ${userId}, Token: ${token ? token.substring(0, 10) + '...' : 'Yok'}`,
      'AuthService.removeRefreshToken',
      __filename,
      353, // Satır numarasını kontrol et
    );
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      this.logger.debug(`[AuthService] removeRefreshToken: Generated SHA256 hash for received token: ${tokenHash} (UserID: ${userId})`, 'AuthService.removeRefreshToken', __filename);

      const tokens = await this.firebaseService.findMany<UserRefreshToken>(
        FIRESTORE_COLLECTIONS.REFRESH_TOKENS,
        [
          { field: 'userId', operator: '==', value: userId },
          // It would be better to also match on tokenHash if we store it consistently
          // For now, we iterate as per existing logic.
        ],
      );
      
      this.logger.debug(`[AuthService] removeRefreshToken: Found ${tokens ? tokens.length : 0} tokens in DB for UserID: ${userId}.`, 'AuthService.removeRefreshToken', __filename);

      let tokenFoundAndDeleted = false;
      for (const storedToken of tokens) {
        this.logger.debug(`[AuthService] removeRefreshToken: Checking DB token ID: ${storedToken.id} (UserID: ${userId}). Comparing with received token.`, 'AuthService.removeRefreshToken', __filename);
        try {
          const isValid = await bcrypt.compare(token, storedToken.hashedToken);
          this.logger.debug(`[AuthService] removeRefreshToken: bcrypt.compare result for DB token ID ${storedToken.id} (UserID: ${userId}): ${isValid}`, 'AuthService.removeRefreshToken', __filename);
          if (isValid) {
            this.logger.debug(`[AuthService] removeRefreshToken: Match found! Deleting DB token ID: ${storedToken.id} (UserID: ${userId}).`, 'AuthService.removeRefreshToken', __filename);
            await this.firebaseService.delete(
              FIRESTORE_COLLECTIONS.REFRESH_TOKENS,
              storedToken.id,
            );
            tokenFoundAndDeleted = true;
            this.logger.info(`[AuthService] Successfully removed refresh token from DB. Token ID: ${storedToken.id}, User ID: ${userId}.`, 'AuthService.removeRefreshToken', __filename);
            break; 
          }
        } catch (compareError) {
          this.logger.warn(`[AuthService] removeRefreshToken: bcrypt.compare failed for DB token ID ${storedToken.id} (UserID: ${userId}). Error: ${compareError.message}. Skipping this token.`, 'AuthService.removeRefreshToken', __filename);
          continue;
        }
      }
      if (!tokenFoundAndDeleted && tokens && tokens.length > 0) {
          this.logger.warn(`[AuthService] removeRefreshToken: No matching token found to delete for UserID: ${userId} after checking ${tokens.length} DB tokens. Received token (first 10 chars): ${token ? token.substring(0, 10) + '...' : 'NONE'}`, 'AuthService.removeRefreshToken', __filename);
      } else if (!tokens || tokens.length === 0) {
          this.logger.warn(`[AuthService] removeRefreshToken: No tokens found in DB for UserID: ${userId}. Nothing to delete.`, 'AuthService.removeRefreshToken', __filename);
      }

    } catch (error) {
      this.logger.error(
        `[AuthService] Error in removeRefreshToken for UserID: ${userId}. Token (first 10 chars): ${token ? token.substring(0, 10) + '...' : 'NONE'}. Error: ${error.message}`,
        'AuthService.removeRefreshToken',
        __filename,
        '385', // Preserving original line number as string
        {
            errorName: error.name,
            errorMessage: error.message,
            // stack: error.stack,
        }
      );
    }
  }

  async logout(
    userId: string,
    refreshToken: string,
  ): Promise<{ success: boolean }> {
    this.logger.debug(`[AuthService] logout called. UserID: ${userId}, Token (first 10 chars): ${refreshToken ? refreshToken.substring(0, 10) + '...' : 'NONE'}`, 'AuthService.logout', __filename); 
    this.logger.debug(
      `logout çağrıldı: Kullanıcı ID: ${userId}, Token: ${refreshToken ? refreshToken.substring(0, 10) + '...' : 'Yok'}`,
      'AuthService.logout',
      __filename,
      397, // Satır numarasını kontrol et
    );
    try {
      // Refresh token'ı sil
      await this.removeRefreshToken(userId, refreshToken);
      this.logger.info(`[AuthService] Logout successful for UserID: ${userId}. Refresh token removal attempted.`, 'AuthService.logout', __filename);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `[AuthService] Error during logout for UserID: ${userId}. Error: ${error.message}`, 
        'AuthService.logout',
        __filename,
        undefined,
        {
            errorName: error.name,
            errorMessage: error.message,
            // stack: error.stack,
        }
        );
      return { success: false };
    }
  }

  @LogMethod({ trackParams: true })
  async validateUser(email: string, password: string): Promise<any> {
    try {
      this.flowTracker.trackStep(
        `${email} için kullanıcı doğrulaması başlatıldı`,
        'AuthService',
      );

      // Mevcut kod
      // ...

      // Örnek başarılı log
      this.logger.info(
        'Kullanıcı başarıyla doğrulandı',
        'AuthService.validateUser',
        __filename,
        undefined,
        { email },
      );

      // Mevcut return ifadesi
    } catch (error) {
      this.logger.logError(error, 'AuthService.validateUser', {
        email,
        errorContext: 'Kullanıcı doğrulama hatası',
      });
      throw error;
    }
  }

  @LogMethod({ trackParams: true })
  async register(registerDto: any) {
    try {
      this.flowTracker.trackStep(
        `${registerDto.email} için kayıt işlemi başlatıldı`,
        'AuthService',
      );

      // Mevcut kod
      // ...

      this.logger.info(
        'Yeni kullanıcı başarıyla oluşturuldu',
        'AuthService.register',
        __filename,
        undefined,
        { email: registerDto.email },
      );

      // Mevcut return ifadesi
    } catch (error) {
      this.logger.logError(error, 'AuthService.register', {
        email: registerDto.email,
      });
      throw error;
    }
  }
}
