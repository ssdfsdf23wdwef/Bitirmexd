import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";



export const setAuthCookie = (token: string, days: number = 7): void => {
  if (typeof window === "undefined") return; // Server tarafında çalışmayı engelle

  try {
    // Token timestamp kaydet
    const tokenTimestamp = Date.now();
    localStorage.setItem("token_timestamp", tokenTimestamp.toString());
    localStorage.setItem("auth_token", token);

    // Cookie ayarla
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // gün cinsinden
    const expires = `expires=${date.toUTCString()}`;
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

    // Ana cookie
    document.cookie = `firebase-auth-token=${token}; ${expires}; path=/; SameSite=Lax${secure}`;

    // Yedek cookie
    document.cookie = `auth_token=${token}; ${expires}; path=/; SameSite=Lax${secure}`;

    console.log("🔐 Auth token cookie ve localStorage'a kaydedildi");
  } catch (error) {
    console.error("🔴 Auth token kaydedilirken hata:", error);
  }
};

/**
 * Firebase auth token cookie'lerini ve localStorage verilerini siler
 */
export const removeAuthCookie = (): void => {
  if (typeof window === "undefined") return; // Server tarafında çalışmayı engelle

  try {
    // Cookie'leri temizle
    document.cookie =
      "firebase-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/auth/refresh-token;";
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // LocalStorage'ı temizle
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token_timestamp");

    console.log("🔓 Auth token cookie ve localStorage'dan silindi");
  } catch (error) {
    console.error("🔴 Auth token silinirken hata:", error);
  }
};

/**
 * Token'ın yenilenip yenilenmemesi gerektiğini kontrol eder
 * @param minRemainingMinutes En az kaç dakika kalan süre olması gerektiği
 * @returns Token'ın yenilenmesi gerekiyorsa true
 */





export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
