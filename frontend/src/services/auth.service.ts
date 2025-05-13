import apiService from "./api.service";
import { auth } from "@/app/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as firebaseUpdateProfile,
  AuthError,
  UserCredential,
  sendPasswordResetEmail,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { setAuthCookie, removeAuthCookie } from "@/lib/utils";
import { User } from "@/types";
import { adaptUserFromBackend, adaptUserToBackend } from "@/lib/adapters";
import axios, { AxiosError } from "axios";
import { getLogger, getFlowTracker, FlowCategory, trackFlow, mapToTrackerCategory } from "../lib/logger.utils";

// API yanıt tipleri
interface AuthResponse {
  user: User;
  token: string;
}

interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

// Oturum durumu tipi
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

// Kimlik API URL'leri
const API_URLS = {
  LOGIN: "/api/auth/login-via-idtoken",
  REGISTER: "/api/auth/register",
  GOOGLE_LOGIN: "/api/auth/login-with-google",
  LOGOUT: "/api/auth/logout",
  PROFILE: "/api/users/profile",
  UPDATE_PROFILE: "/api/users/profile",
};

/**
 * Kimlik doğrulama hizmet sınıfı
 * Auth ile ilgili tüm API çağrılarını ve işlemleri yönetir
 */
class AuthService {
  /**
   * ID token ile giriş işlemi - Firebase tarafından alınan token ile backend'e doğrulama yapar
   * @param idToken Firebase'den alınan kimlik doğrulama token'ı
   * @param userData İsteğe bağlı kullanıcı verileri (kayıt için)
   * @returns Backend yanıtı (kullanıcı bilgileri ve session token)
   */
  async loginWithIdToken(
    idToken: string, 
    userData?: { firstName?: string; lastName?: string }
  ): Promise<AuthResponse> {
    try {
      trackFlow(
        'ID Token ile giriş başlatıldı',
        'AuthService.loginWithIdToken',
        FlowCategory.Auth
      );
      
      this.logger.debug(
        'ID Token ile backend login isteği gönderiliyor',
        'AuthService.loginWithIdToken',
        __filename,
        141
      );
      
      // İstek verisini hazırla
      const requestData: Record<string, any> = { idToken };
      
      // Kullanıcı verileri varsa ekle
      if (userData) {
        requestData.userData = userData;
      }
      
      const response = await apiService.post<AuthResponse>("/auth/login-via-idtoken", requestData);

      this.logger.info(
        'ID Token ile login başarılı',
        'AuthService.loginWithIdToken',
        __filename,
        149,
        { userId: response.user.id }
      );

      // User tipini dönüştür
      return {
        ...response,
        user: adaptUserFromBackend(response.user),
      };
    } catch (error: unknown) {
      this.logger.error(
        'ID Token ile giriş hatası',
        'AuthService.loginWithIdToken',
        __filename,
        166,
        { error: this.formatFirebaseError(error) }
      );
      
      throw error;
    }
  }

  private readonly logger = getLogger();
  private readonly flowTracker = getFlowTracker();
  
  constructor() {
    this.logger.info(
      'AuthService başlatıldı',
      'AuthService.constructor',
      __filename,
      14
    );
  }

  /**
   * E-posta ve şifre ile kayıt
   * @param email Kullanıcı e-postası
   * @param password Kullanıcı şifresi
   * @param userData Kullanıcı bilgileri (ilk adı ve soyadı)
   * @returns Kayıt yanıtı
   */
  async register(
    email: string,
    password: string,
    userData: { firstName?: string; lastName?: string },
  ): Promise<AuthResponse> {
    try {
      // Şifre kontrolü
      this.logger.info(
        'Kullanıcı kaydı başlatılıyor',
        'AuthService.register',
        __filename,
        50,
        { email }
      );
      
      trackFlow(
        'Kullanıcı kaydı başlatıldı',
        'AuthService.register',
        FlowCategory.Auth,
        { email }
      );

      if (!password || password.trim() === "") {
        const error = new Error("auth/missing-password");
        this.logger.error(
          'Şifre eksik',
          'AuthService.register',
          __filename,
          64,
          { error }
        );
        throw error;
      }

      // Firebase ile yeni kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // ID token al
      const idToken = await userCredential.user.getIdToken();

      // Bunun yerine loginWithIdToken çağır, bu metod backend'de kullanıcıyı oluşturacak/güncelleyecektir.
      // userData'nın (firstName, lastName) nasıl işleneceği ayrıca değerlendirilmeli.
      // Belki loginWithIdToken backend'de bu bilgileri Firebase'den alır veya ayrı bir updateProfile gerekir.
      const loginResponse = await this.loginWithIdToken(idToken, userData);

      // Eğer Firebase'de displayName güncellenmemişse ve userData varsa güncelleyelim.
      // Bu, Firebase Console'da kullanıcının adının görünmesine yardımcı olabilir.
      if (userData.firstName && userCredential.user.displayName !== `${userData.firstName} ${userData.lastName || ''}`.trim()) {
        try {
          await firebaseUpdateProfile(userCredential.user, {
            displayName: `${userData.firstName} ${userData.lastName || ''}`.trim(),
          });
          this.logger.info(
            'Firebase kullanıcı profili (displayName) güncellendi.',
            'AuthService.register',
            __filename,
            100 // Satır numarasını kontrol edin
          );
        } catch (profileError) {
          this.logger.warn(
            'Firebase kullanıcı profili (displayName) güncellenemedi.',
            'AuthService.register',
            __filename,
            106, // Satır numarasını kontrol edin
            { error: this.formatFirebaseError(profileError) }
          );
        }
      }

      // Token artık backend tarafından HttpOnly cookie olarak yönetiliyor
      // localStorage kullanımını kaldırıyoruz
      
      // User tipini dönüştür
      // return {
      //   ...response,
      //   user: adaptUserFromBackend(response.user),
      // };
      return loginResponse; // loginWithIdToken yanıtını döndür

    } catch (error: unknown) {
      this.logger.error(
        'Kayıt hatası',
        'AuthService.register',
        __filename,
        92,
        { error: this.formatFirebaseError(error) }
      );
      throw error;
    }
  }

  /**
   * E-posta ve şifre ile giriş
   * @param email Kullanıcı e-postası
   * @param password Kullanıcı şifresi
   * @returns Giriş yanıtı
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      trackFlow(
        'Kullanıcı girişi başlatıldı',
        'AuthService.login',
        FlowCategory.Auth,
        { email }
      );
      this.flowTracker.markStart('login');
      
      this.logger.info(
        `Kullanıcı girişi deneniyor: ${email}`,
        'AuthService.login',
        __filename,
        116
      );
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Ölç ve logla
      const duration = this.flowTracker.markEnd('login', mapToTrackerCategory(FlowCategory.Auth), 'AuthService.login');
      this.logger.info(
        `Kullanıcı girişi başarılı: ${email}`,
        'AuthService.login',
        __filename,
        126,
        { duration, uid: result.user.uid }
      );
      
      // ID token al
      const idToken = await result.user.getIdToken();
      this.logger.debug(
        'Firebase ID token alındı',
        'AuthService.login',
        __filename,
        135
      );

      // Backend'e giriş için API çağrısı yap
      this.logger.debug(
        'Backend login isteği gönderiliyor',
        'AuthService.login',
        __filename,
        141
      );
      
      const response = await apiService.post<AuthResponse>("/auth/login-via-idtoken", {
        idToken,
      });

      this.logger.info(
        'Backend login başarılı',
        'AuthService.login',
        __filename,
        149,
        { userId: response.user.id }
      );

      // Token artık backend tarafından HttpOnly cookie olarak yönetiliyor
      // localStorage kullanımını kaldırıyoruz

      // User tipini dönüştür
      return {
        ...response,
        user: adaptUserFromBackend(response.user),
      };
    } catch (error: unknown) {
      this.logger.error(
        'Giriş hatası',
        'AuthService.login',
        __filename,
        166,
        { error: this.formatFirebaseError(error) }
      );
      
      // Hata tipini kontrol et ve daha detaylı logla
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        this.logger.error(
          'API Hatası',
          'AuthService.login',
          __filename,
          176,
          { 
            code: axiosError.code, 
            response: axiosError.response?.data,
            url: axiosError.config?.url, 
            method: axiosError.config?.method 
          }
        );
      }
      
      throw error;
    }
  }

  /**
   * Google ile giriş
   * @param idToken Firebase'den alınan ID token
   * @returns Giriş yanıtı
   */
  async loginWithGoogle(idToken?: string): Promise<GoogleAuthResponse> {
    try {
      trackFlow(
        'Google ile giriş başlatıldı',
        'AuthService.loginWithGoogle',
        FlowCategory.Auth
      );
      
      // idToken parametresi verilmediyse, Google popup ile giriş yap
      if (!idToken) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        idToken = await result.user.getIdToken();
      }
      
      // Backend'e giriş için API çağrısı yap
      const response = await apiService.post<GoogleAuthResponse>("/auth/login-via-google", {
        idToken,
      });
      
      this.logger.info(
        'Google ile giriş başarılı',
        'AuthService.loginWithGoogle',
        __filename,
        228,
        { userId: response.user.id, isNewUser: response.isNewUser }
      );
      
      // User tipini dönüştür
      return {
        ...response,
        user: adaptUserFromBackend(response.user),
      };
    } catch (error: unknown) {
      this.logger.error(
        'Google ile giriş hatası',
        'AuthService.loginWithGoogle',
        __filename,
        242,
        { error: this.formatFirebaseError(error) }
      );
      throw error;
    }
  }

  /**
   * Çıkış yap
   * @returns Çıkış işlemi başarılı olup olmadığı
   */
  async signOut(): Promise<void> {
    try {
      trackFlow(
        'Kullanıcı çıkışı başlatıldı',
        'AuthService.signOut',
        FlowCategory.Auth
      );
      this.flowTracker.markStart('logout');
      
      this.logger.info(
        'Kullanıcı çıkışı yapılıyor',
        'AuthService.signOut',
        __filename,
        246
      );
      
      // Backend'e çıkış isteği yaparak cookie'yi temizle
      await apiService.post('/auth/logout', {});
      
      // Ardından Firebase'den çıkış yap
      await firebaseSignOut(auth);

      // localStorage'dan token'ı temizle - cookie tamamen kaldırıldı, ancak localStorage'da varsa temizle
      if (typeof window !== 'undefined') {
        localStorage.removeItem("auth_token");
        removeAuthCookie();
      }
      
      // Çıkış işlemi başarılı
      const duration = this.flowTracker.markEnd('logout', mapToTrackerCategory(FlowCategory.Auth), 'AuthService.signOut');
      this.logger.info(
        'Kullanıcı çıkışı tamamlandı',
        'AuthService.signOut',
        __filename,
        266,
        { duration }
      );
      
      return;
    } catch (error) {
      this.logger.error(
        'Çıkış hatası',
        'AuthService.signOut',
        __filename,
        274,
        { error: this.formatFirebaseError(error) }
      );
      throw error;
    }
  }

  /**
   * Kullanıcı profili getir
   * @returns Kullanıcı profil bilgileri
   */
  async getProfile(): Promise<User> {
    try {
      const backendUser = await apiService.get<User>("/users/profile");
      return adaptUserFromBackend(backendUser);
    } catch (error: unknown) {
      console.error("Profil getirme hatası:", error);
      throw error;
    }
  }

  /**
   * Kullanıcı profilini güncelle
   * @param profileData Güncellenecek profil verileri
   * @returns Güncellenmiş kullanıcı profili
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      // Firebase kullanıcısını al
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Kullanıcı oturumu bulunamadı");
      }

      // Firebase profilini güncelle (displayName ve photoURL)
      if (profileData.firstName || profileData.lastName) {
        const displayName = [
          profileData.firstName || "",
          profileData.lastName || "",
        ]
          .filter(Boolean)
          .join(" ");

        await firebaseUpdateProfile(currentUser, {
          displayName: displayName || null,
        });
      }

      if (profileData.profileImageUrl) {
        await firebaseUpdateProfile(currentUser, {
          photoURL: profileData.profileImageUrl,
        });
      }

      // Backend'e uygun formata dönüştür
      const backendProfileData = adaptUserToBackend(profileData);

      // Backend'e profil güncellemesi için API çağrısı yap
      const updatedBackendUser = await apiService.put<User>(
        "/users/profile",
        backendProfileData,
      );

      // Frontend tipine dönüştür
      return adaptUserFromBackend(updatedBackendUser);
    } catch (error: unknown) {
      console.error("Profil güncelleme hatası:", error);
      throw error;
    }
  }

  /**
   * Firebase oturum durumu değişikliklerini dinle
   * @param callback Oturum durumu değiştiğinde çağrılacak fonksiyon
   * @returns Dinlemeyi durduracak fonksiyon
   */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    console.log("🎧 [AuthService] onAuthStateChange başlatılıyor");
    
    let previousAuthState: FirebaseUser | null = null;
    let retryCount = 0;
    const MAX_RETRY = 3;
    
    return onAuthStateChanged(auth, async (firebaseUser) => {
      // Başlangıçta ve durumda bir değişiklik olmadığında gereksiz log oluşturma
      const isLoginOrInitialState = firebaseUser !== null;
      
      if (isLoginOrInitialState) {
        try {
          console.log("🔑 [AuthService] Token isteniyor");
          
          // Firebase kullanıcısına yapılan değişikliklerin işlenmesi için kısa bir bekleme
          // Bu özellikle yeni kayıt olan kullanıcılar için önemli
          if (retryCount === 0 && !previousAuthState) {
            console.log("⏱️ [AuthService] Yeni kullanıcı kaydı için 1 saniye bekleniyor");
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // ID token al - force refresh yaparak her zaman güncel token al
          const idToken = await firebaseUser.getIdToken(true);
          console.log("✅ [AuthService] Token alındı, uzunluk:", idToken.length);

          // Backend'e giriş için API çağrısı yap
          console.log("📡 [AuthService] Backend oturum yenilemesi yapılıyor");
          try {
            const response = await apiService.post<AuthResponse>(
              "/auth/login-via-idtoken",
              { idToken },
            );

            console.log("✅ [AuthService] Backend oturum yenilemesi başarılı");
            retryCount = 0; // Başarılı istek sonrası sayacı sıfırla

            // Token'ı localStorage'a kaydet
            if (response.token) {
              localStorage.setItem("auth_token", response.token);
              setAuthCookie(response.token);
              console.log("💾 [AuthService] Token önbelleğe kaydedildi");
            }
          } catch (error) {
            console.error("❌ [AuthService] Backend oturum yenilemesi sırasında hata:", error);
            
            if (axios.isAxiosError(error)) {
              const axiosError = error as AxiosError;
              
              // Bağlantı sorunları - offline mod
              if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
                console.log("⚠️ [AuthService] Backend bağlantı hatası nedeniyle işleme devam ediliyor");
                // Bağlantı hatası durumunda devam et, oturumu koru
              } 
              // 401 Unauthorized hatası - yeni kayıt olan kullanıcılar için yeniden deneme
              else if (axiosError.response?.status === 401 && retryCount < MAX_RETRY) {
                retryCount++;
                console.log(`⚠️ [AuthService] 401 hatası alındı, yeniden deneme (${retryCount}/${MAX_RETRY})`);
                
                // Yeni kayıt durumunda zaman tanıyarak tekrar dene
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // ID token'ı yenile ve tekrar dene
                try {
                  const refreshedToken = await firebaseUser.getIdToken(true);
                  console.log("🔄 [AuthService] Token yenilendi, tekrar deneniyor");
                  
                  const retryResponse = await apiService.post<AuthResponse>(
                    "/auth/login-via-idtoken",
                    { idToken: refreshedToken },
                  );
                  
                  console.log("✅ [AuthService] Yeniden deneme başarılı");
                  
                  // Token'ı localStorage'a kaydet
                  if (retryResponse.token) {
                    localStorage.setItem("auth_token", retryResponse.token);
                    setAuthCookie(retryResponse.token);
                    console.log("💾 [AuthService] Token önbelleğe kaydedildi");
                  }
                  
                  retryCount = 0; // Başarılı istek sonrası sayacı sıfırla
                } catch (retryError) {
                  console.error("❌ [AuthService] Yeniden deneme başarısız:", retryError);
                  throw retryError; // Hatayı yukarı fırlat
                }
              } else {
                throw error; // Diğer hataları yukarıya fırlat
              }
            } else {
              throw error;
            }
          }
        } catch (error) {
          console.error("❌ [AuthService] onAuthStateChange işlemi sırasında kritik hata:", error);
          
          // Kullanıcı oturumu kapalı, token'ları temizle
          localStorage.removeItem("auth_token");
          removeAuthCookie();
        }
      } else {
        // Kullanıcı oturumu zaten kapalı ise sessizce işle
        // Sadece gerçekten bir oturum kapatma varsa (daha önce kullanıcı varken şimdi yoksa) logla
        if (previousAuthState !== null && previousAuthState !== firebaseUser) {
          console.log("🔓 Firebase Auth: Kullanıcı oturumu kapatıldı");
          localStorage.removeItem("auth_token");
          removeAuthCookie();
        } else {
          // İlk yüklenme veya yenileme sırasında, sessizce token temizliği yap
          const token = localStorage.getItem("auth_token");
          if (token) {
            localStorage.removeItem("auth_token");
            removeAuthCookie();
          }
        }
      }
      
      // Bir sonraki karşılaştırma için mevcut durumu kaydet
      previousAuthState = firebaseUser;
      
      // Callback'i çağır
      try {
        callback(firebaseUser);
      } catch (callbackError) {
        console.error("❌ [AuthService] Callback çağrılırken hata:", callbackError);
      }
    });
  }

  /**
   * Şu anki kullanıcıyı al
   * @returns Firebase kullanıcı nesnesi veya null
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Şu anki kullanıcının token'ini al
   * @returns JWT token veya null
   */
  async getCurrentToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      return await user.getIdToken(true);
    } catch (error) {
      console.error("Token alma hatası:", error);
      return null;
    }
  }

  /**
   * Hata mesajlarını formatlar - Firebase ve diğer hatalar için tutarlı bir format sağlar
   * @param error Hata nesnesi
   * @returns Formatlanmış hata mesajı
   */
  formatAuthError(error: unknown): string {
    if (error instanceof FirebaseError) {
      return this.formatFirebaseError(error).message;
    } else if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // API hatalarını daha detaylı inceleme
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const responseData = axiosError.response.data as any;
        
        // Durum kodlarına göre anlamlı mesajlar
        switch (statusCode) {
          case 400:
            return responseData?.message || 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.';
          case 401:
            return 'Oturum süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın.';
          case 403:
            return 'Bu işlemi yapmak için yetkiniz yok.';
          case 404:
            return 'İstenen kaynak bulunamadı.';
          case 429:
            return 'Çok fazla istek gönderdiniz. Lütfen birkaç dakika bekleyip tekrar deneyin.';
          case 500:
            return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
          case 503:
            return 'Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
          default:
            return `API hatası: ${axiosError.response.statusText || `Hata kodu: ${statusCode}`}`;
        }
      } 
      // Bağlantı hataları
      else if (axiosError.code === 'ECONNABORTED') {
        return 'İstek zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.';
      } else if (axiosError.code === 'ECONNREFUSED') {
        return 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.';
      } else if (axiosError.code === 'ERR_NETWORK') {
        return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
      }
      
      // Token yenilemesi ile ilgili hatalar için özel mesaj
      if (axiosError.config?.url?.includes('refresh-token')) {
        return 'Oturum yenilenemedi. Lütfen tekrar giriş yapın.';
      }
      
      return `API hatası: ${axiosError.message}`;
    } else if (error instanceof Error) {
      return error.message;
    } else {
      return 'Bilinmeyen bir hata oluştu';
    }
  }

  private formatFirebaseError(error: unknown): { code: string; message: string } {
    // FirebaseError tipini kontrol et
    if (error instanceof FirebaseError) {
      return {
        code: error.code,
        message: this.getFirebaseErrorMessage(error.code)
      };
    }
    
    return {
      code: 'unknown',
      message: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }

  private getFirebaseErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'Geçersiz e-posta formatı. Lütfen geçerli bir e-posta adresi girin.';
      case 'auth/user-disabled':
        return 'Bu kullanıcı hesabı devre dışı bırakılmış. Lütfen destek ekibimizle iletişime geçin.';
      case 'auth/user-not-found':
        return 'Bu e-posta adresine sahip bir kullanıcı bulunamadı. Lütfen kayıt olun.';
      case 'auth/wrong-password':
        return 'Hatalı şifre. Lütfen şifrenizi kontrol edin ve tekrar deneyin.';
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda. Lütfen farklı bir e-posta adresi deneyin.';
      case 'auth/weak-password':
        return 'Güvenli olmayan şifre. Şifreniz en az 6 karakterden oluşmalıdır.';
      case 'auth/operation-not-allowed':
        return 'Bu işlem şu anda devre dışı bırakılmış. Lütfen destek ekibimizle iletişime geçin.';
      case 'auth/too-many-requests':
        return 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin veya şifrenizi sıfırlayın.';
      case 'auth/network-request-failed':
        return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return 'E-posta adresi veya şifre hatalı. Lütfen tekrar deneyin.';
      case 'auth/missing-password':
        return 'Şifre girilmedi. Lütfen şifrenizi girin.';
      case 'auth/popup-closed-by-user':
        return 'Giriş penceresi kullanıcı tarafından kapatıldı. Lütfen tekrar deneyin.';
      default:
        return `Bir kimlik doğrulama hatası oluştu: ${code}`;
    }
  }

  /**
   * Access token'ı yenile
   * Backend'in /auth/refresh-token endpoint'ini çağırarak HttpOnly cookie içindeki
   * refresh token ile yeni bir access token alır.
   * 
   * @returns {Promise<{token: string}>} Başarılı olursa yeni access token
   * @throws {Error} Token yenilenemezse hata fırlatır
   */
  async refreshToken(): Promise<{token: string}> {
    try {
      // Backend'in refresh token endpoint'ine, HTTP-only cookie içindeki refresh token'ı kullanarak istek at
      // withCredentials: true sayesinde browser otomatik olarak cookie'yi gönderir
      this.logger.info(
        'Token yenileme işlemi başlatılıyor',
        'AuthService.refreshToken',
        __filename,
        725
      );
      
      trackFlow(
        'Token yenileme işlemi başlatıldı',
        'AuthService.refreshToken',
        FlowCategory.Auth
      );
      
      // Timeout'u artırarak bağlantı sorunlarına karşı biraz daha tolerans göster
      const response = await apiService.post<{success: boolean, token: string, expiresIn?: number}>(
        "/auth/refresh-token", 
        {}, 
        {
          withCredentials: true, // HTTP-only cookie'lerin gönderilmesi için gerekli
          timeout: 10000, // 10 saniye timeout
        }
      );
      
      // Yeni token'ı döndür
      if (response && response.token) {
        this.logger.info(
          'Token başarıyla yenilendi',
          'AuthService.refreshToken',
          __filename,
          748
        );
        
        trackFlow(
          'Token yenileme başarılı',
          'AuthService.refreshToken',
          FlowCategory.Auth
        );
        
        // Yeni token'ı localStorage ve cookie'ye kaydet
        localStorage.setItem("auth_token", response.token);
        setAuthCookie(response.token);
        
        return { token: response.token };
      } else {
        this.logger.error(
          'Refresh token yanıtında token bulunamadı',
          'AuthService.refreshToken',
          __filename,
          764,
          { response }
        );
        
        trackFlow(
          'Token yenileme yanıtında token bulunamadı',
          'AuthService.refreshToken',
          FlowCategory.Error
        );
        
        throw new Error("Refresh token yanıtında token bulunamadı");
      }
    } catch (error) {
      this.logger.error(
        'Token yenileme hatası',
        'AuthService.refreshToken',
        __filename,
        779,
        { error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
      );
      
      trackFlow(
        'Token yenileme hatası',
        'AuthService.refreshToken',
        FlowCategory.Error,
        { error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
      );
      
      // Tüm token'ları temizle
      localStorage.removeItem("auth_token");
      removeAuthCookie();
      
      // Firebase'den çıkış yapmayı dene (token geçersiz olduğundan)
      try {
        await firebaseSignOut(auth);
      } catch (signOutError) {
        this.logger.warn(
          'Token yenileme sonrası Firebase çıkış hatası',
          'AuthService.refreshToken',
          __filename,
          799,
          { error: signOutError }
        );
      }
      
      throw error;
    }
  }
}

// Singleton instance oluştur ve export et
const authService = new AuthService();
export default authService;
export { authService as AuthService };
