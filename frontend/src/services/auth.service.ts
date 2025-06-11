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
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { setAuthCookie, removeAuthCookie } from "@/lib/utils";
import { User } from "@/types";
import { adaptUserFromBackend, adaptUserToBackend } from "@/lib/adapters";
import axios, { AxiosError } from "axios";

// Hata yanıtı için arayüz
interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: unknown;
  errorCode?: string;
}

// API yanıt tipleri
interface AuthResponse {
  user: User;
  token: string;
}

interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

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
    userData?: { firstName?: string; lastName?: string },
  ): Promise<AuthResponse> {
    try {
      const requestData: Record<string, unknown> = { idToken };

      // Kullanıcı verileri varsa ekle
      if (userData) {
        requestData.userData = userData;
      }

      const response = await apiService.post<AuthResponse>(
        "/auth/login-via-idtoken",
        requestData,
      );

      // User tipini dönüştür
      return {
        ...response,
        user: adaptUserFromBackend(response.user),
      };
    } catch (error: unknown) {
      throw error;
    }
  }

  async register(
    email: string,
    password: string,
    userData: { firstName?: string; lastName?: string },
  ): Promise<AuthResponse> {
    try {
      if (!password || password.trim() === "") {
        const error = new Error("auth/missing-password");

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

      const loginResponse = await this.loginWithIdToken(idToken, userData);

      if (
        userData.firstName &&
        userCredential.user.displayName !==
          `${userData.firstName} ${userData.lastName || ""}`.trim()
      ) 
      

      return loginResponse; // loginWithIdToken yanıtını döndür
    } catch (error: unknown) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await result.user.getIdToken();

      const response = await apiService.post<AuthResponse>(
        "/auth/login-via-idtoken",
        {
          idToken,
        },
      );

      return {
        ...response,
        user: adaptUserFromBackend(response.user),
      };
    } catch (error: unknown) {
      throw error;
    }
  }

  async loginWithGoogle(idToken?: string): Promise<GoogleAuthResponse> {
    try {
      // idToken parametresi verilmediyse, Google popup ile giriş yap
      if (!idToken) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        idToken = await result.user.getIdToken();
      }

      // Backend'e giriş için API çağrısı yap
      const response = await apiService.post<GoogleAuthResponse>(
        "/auth/login-via-google",
        {
          idToken,
        },
      );

      return {
        ...response,
        user: adaptUserFromBackend(response.user),
      };
    } catch (error: unknown) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await apiService.post("/auth/logout", {});

      // Ardından Firebase'den çıkış yap
      await firebaseSignOut(auth);

      // localStorage'dan token'ları ve Zustand state'ini temizle
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth-storage");
        removeAuthCookie(); // Varsa diğer cookie temizleme yardımcı fonksiyonu
      }

      return;
    } catch (error) {
      throw error;
    }
  }

  async getProfile(): Promise<User> {
    try {
      let retryCount = 0;
      const MAX_RETRY = 3;

      const attemptProfileFetch = async (): Promise<User> => {
        try {
          const backendUser = await apiService.get<User>("/users/profile");

          return adaptUserFromBackend(backendUser);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.message === "Network Error") {
              // Bağlantı hatası durumunda biraz bekleyip tekrar dene
              if (retryCount < MAX_RETRY) {
                retryCount++;
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * retryCount),
                ); // Giderek artan bekleme
                return attemptProfileFetch(); // Recursively try again
              }
            }

            if (error.response?.status === 401 && retryCount < MAX_RETRY) {
              retryCount++;

              // Firebase token'ı yenile
              const user = auth.currentUser;
              if (!user) {
                throw new Error("Kullanıcı oturumu bulunamadı");
              }

              try {
                // Force refresh ile token'ı yenile
                const idToken = await user.getIdToken(true);

                // Backend'e token'ı tekrar gönder
                await apiService.post<AuthResponse>("/auth/login-via-idtoken", {
                  idToken,
                });
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Profil bilgisini tekrar iste
                return attemptProfileFetch();
              } catch (tokenError) {
                throw tokenError;
              }
            }
          }

          throw error;
        }
      };

      // İlk denemeyi başlat
      return await attemptProfileFetch();
    } catch (error: unknown) {
      throw error;
    }
  }

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

        try {
          await firebaseUpdateProfile(currentUser, {
            displayName: displayName || null,
          });
        } catch (firebaseError) {
          // Firebase güncellemesi başarısız olsa bile devam et
        }
      }

      if (profileData.profileImageUrl) {
        try {
          await firebaseUpdateProfile(currentUser, {
            photoURL: profileData.profileImageUrl,
          });
        } catch (firebaseError) {
          {
            error: firebaseError;
          }
        }
      }

      // Backend'e uygun formata dönüştür
      const backendProfileData = adaptUserToBackend(profileData);

      // Backend'e profil güncellemesi için API çağrısı yap
      try {
        const updatedBackendUser = await apiService.put<User>(
          "/users/profile",
          backendProfileData,
        );

        return adaptUserFromBackend(updatedBackendUser);
      } catch (apiError) {
        // Daha detaylı axios hatası yakalama
        if (axios.isAxiosError(apiError)) {
          const axiosError = apiError as AxiosError;
        }

        throw apiError;
      }
    } catch (error: unknown) {
      throw error;
    }
  }

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

          if (retryCount === 0 && !previousAuthState) {
            console.log(
              "⏱️ [AuthService] Yeni kullanıcı kaydı için 1 saniye bekleniyor",
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          // ID token al - force refresh yaparak her zaman güncel token al
          const idToken = await firebaseUser.getIdToken(true);
          console.log(
            "✅ [AuthService] Token alındı, uzunluk:",
            idToken.length,
          );

          // Backend'e giriş için API çağrısı yap
          console.log("📡 [AuthService] Backend oturum yenilemesi yapılıyor");
          try {
            const response = await apiService.post<AuthResponse>(
              "/auth/login-via-idtoken",
              { idToken },
            );

            retryCount = 0; // Başarılı istek sonrası sayacı sıfırla

            // Token'ı localStorage'a kaydet
            if (response.token) {
              localStorage.setItem("auth_token", response.token);
              setAuthCookie(response.token);
              console.log("💾 [AuthService] Token önbelleğe kaydedildi");
            }
          } catch (error) {
            console.error(
              "❌ [AuthService] Backend oturum yenilemesi sırasında hata:",
              error,
            );

            if (axios.isAxiosError(error)) {
              const axiosError = error as AxiosError;

              // Bağlantı sorunları - offline mod
              if (
                axiosError.code === "ECONNABORTED" ||
                axiosError.code === "ECONNREFUSED" ||
                axiosError.code === "ERR_NETWORK"
              ) {
                console.log(
                  "⚠️ [AuthService] Backend bağlantı hatası nedeniyle işleme devam ediliyor",
                );
                // Bağlantı hatası durumunda devam et, oturumu koru
              } else if (
                axiosError.response?.status === 401 &&
                retryCount < MAX_RETRY
              ) {
                retryCount++;
                console.log(
                  `⚠️ [AuthService] 401 hatası alındı, yeniden deneme (${retryCount}/${MAX_RETRY})`,
                );

                // Yeni kayıt durumunda zaman tanıyarak tekrar dene
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // ID token'ı yenile ve tekrar dene
                try {
                  const refreshedToken = await firebaseUser.getIdToken(true);
                  console.log(
                    "🔄 [AuthService] Token yenilendi, tekrar deneniyor",
                  );

                  const retryResponse = await apiService.post<AuthResponse>(
                    "/auth/login-via-idtoken",
                    { idToken: refreshedToken },
                  );

                  // Token'ı localStorage'a kaydet
                  if (retryResponse.token) {
                    localStorage.setItem("auth_token", retryResponse.token);
                    setAuthCookie(retryResponse.token);
                    console.log("💾 [AuthService] Token önbelleğe kaydedildi");
                  }

                  retryCount = 0; // Başarılı istek sonrası sayacı sıfırla
                } catch (retryError) {
                  console.error(
                    "❌ [AuthService] Yeniden deneme başarısız:",
                    retryError,
                  );
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
          localStorage.removeItem("auth_token");
          removeAuthCookie();
        }
      } else {
        // Kullanıcı oturumu zaten kapalı ise sessizce işle
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
        console.error(
          "❌ [AuthService] Callback çağrılırken hata:",
          callbackError,
        );
      }
    });
  }

  getCurrentUser() {
    return auth.currentUser;
  }

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

  async getAuthToken(): Promise<string | null> {
    try {
      // Önce localStorage'dan token'ı kontrol et
      const storedToken = localStorage.getItem("auth_token");

      if (storedToken) {
        return storedToken;
      }
      // localStorage'da token yoksa Firebase'den al
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        return null;
      }

      // Firebase'den fresh token al
      const token = await firebaseUser.getIdToken(true);

      if (token) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem("auth_token", token);
        return token;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  formatAuthError(error: unknown): string {
    if (error instanceof FirebaseError) {
      return this.formatFirebaseError(error).message;
    } else if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // API hatalarını daha detaylı inceleme
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const responseData = axiosError.response.data as ApiErrorResponse;

        // Durum kodlarına göre anlamlı mesajlar
        switch (statusCode) {
          case 400:
            return (
              responseData?.message ||
              "Geçersiz istek. Lütfen bilgilerinizi kontrol edin."
            );
          case 401:
            return "Oturum süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın.";
          case 403:
            return "Bu işlemi yapmak için yetkiniz yok.";
          case 404:
            return "İstenen kaynak bulunamadı.";
          case 429:
            return "Çok fazla istek gönderdiniz. Lütfen birkaç dakika bekleyip tekrar deneyin.";
          case 500:
            return "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
          case 503:
            return "Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.";
          default:
            return `API hatası: ${axiosError.response.statusText || `Hata kodu: ${statusCode}`}`;
        }
      }
      // Bağlantı hataları
      else if (axiosError.code === "ECONNABORTED") {
        return "İstek zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.";
      } else if (axiosError.code === "ECONNREFUSED") {
        return "Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.";
      } else if (axiosError.code === "ERR_NETWORK") {
        return "Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.";
      }

      // Token yenilemesi ile ilgili hatalar için özel mesaj
      if (axiosError.config?.url?.includes("refresh-token")) {
        return "Oturum yenilenemedi. Lütfen tekrar giriş yapın.";
      }

      return `API hatası: ${axiosError.message}`;
    } else if (error instanceof Error) {
      return error.message;
    } else {
      return "Bilinmeyen bir hata oluştu";
    }
  }

  private formatFirebaseError(error: unknown): {
    code: string;
    message: string;
  } {
    // FirebaseError tipini kontrol et
  

    return {
      code: "unknown",
      message: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }

 
  async refreshToken(): Promise<{ token: string }> {
    try {
      // Timeout'u artırarak bağlantı sorunlarına karşı biraz daha tolerans göster
      const response = await apiService.post<{
        success: boolean;
        token: string;
        expiresIn?: number;
      }>(
        "/auth/refresh-token",
        {},
        {
          withCredentials: true, // HTTP-only cookie'lerin gönderilmesi için gerekli
          timeout: 10000, // 10 saniye timeout
        },
      );

      // Yeni token'ı döndür
      if (response && response.token) {
        // Yeni token'ı localStorage ve cookie'ye kaydet
        localStorage.setItem("auth_token", response.token);
        setAuthCookie(response.token);

        return { token: response.token };
      } else {
        throw new Error("Refresh token yanıtında token bulunamadı");
      }
    } catch (error) {
      // Eğer Firebase kullanıcısı varsa, yeni bir token almayı deneyelim
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Firebase'den yeni token al
          const idToken = await currentUser.getIdToken(true);

          // Yeni ID token ile backend oturumu güncelle
          const idTokenResponse = await this.loginWithIdToken(idToken);

          if (idTokenResponse && idTokenResponse.token) {
            return { token: idTokenResponse.token };
          }
        }
      } catch (firebaseError) {}

      // Tüm token'ları temizle
      localStorage.removeItem("auth_token");
      removeAuthCookie();

      // Firebase'den çıkış yapmayı dene (token geçersiz olduğundan)
      try {
        await firebaseSignOut(auth);
      } catch (signOutError) {}

      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
