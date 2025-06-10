"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider";
import { FaGoogle } from "react-icons/fa";
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { ErrorService } from "@/services/error.service";
import { FirebaseError } from "firebase/app";
import axios from "axios";
import { toast } from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode } = useTheme();
  const forceLogin = searchParams.get("forceLogin") === "true";
  const returnUrl = searchParams.get("returnUrl") || "/";
  const errorType = searchParams.get("error");

  const {
    user,
    isAuthenticated,
    login,
    loginWithGoogle,
    signOut,
    checkSession,
  } = useAuth();

  // Hata mesajlarını göster
  useEffect(() => {
    if (errorType) {
      switch (errorType) {
        case "session_expired":
          setError("Oturumunuz sona erdi, lütfen tekrar giriş yapın.");
          break;
        case "auth_required":
          setError("Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.");
          break;
        case "unauthorized":
          setError("Bu işlemi yapmak için yetkiniz yok.");
          break;
        default:
          setError("Bir hata oluştu, lütfen tekrar giriş yapın.");
      }
    }
  }, [errorType]);

  // Oturum durumunu kontrol et
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Kullanıcı zaten giriş yapmışsa ve forceLogin parametresi yoksa
      if (isAuthenticated && user && !forceLogin) {
        try {
          // Oturum durumunu kontrol et (token geçerli mi?)
          const sessionValid = await checkSession();

          if (sessionValid) {
            // Kullanıcı bilgilerini göster ve seçenek sun
            setShowLoginOptions(true);
          } else {
            // Oturum geçersizse formu göster
            setShowLoginOptions(false);
          }
        } catch (error) {
          console.error("Oturum kontrolü hatası:", error);
          setShowLoginOptions(false);
        }
      }
    };

    checkAuthStatus();
  }, [isAuthenticated, user, forceLogin, checkSession]);

  // Auth durumunu kontrol et
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // URL'deki session_expired parametresini kontrol et
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sessionExpired = searchParams.get("session_expired");

    if (sessionExpired === "true") {
      toast(
        "Oturum süreniz dolduğu için güvenliğiniz için çıkış yapıldı. Lütfen tekrar giriş yapın.",
        {
          icon: "⚠️",
          duration: 5000,
        },
      );

      // Kullanıcı konfüzyonunu önlemek için parametreyi URL'den temizle
      const url = new URL(window.location.href);
      url.searchParams.delete("session_expired");
      window.history.replaceState({}, document.title, url.toString());
    }

    // Önceki sayfaya dönüş bilgisini kontrol et
    const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin");
    if (redirectAfterLogin) {
      // Bilgiyi sakla ve hemen silme (başarılı girişten sonra kullanılacak)
      setRedirectPath(redirectAfterLogin);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Temel validasyonlar
      if (!email.trim()) {
        throw new Error("E-posta adresi boş olamaz");
      }

      if (!password.trim()) {
        throw new Error("Şifre boş olamaz");
      }

      // Login işlemi
      await login(email, password);

      // Başarılı giriş sonrası yönlendirme
      if (redirectPath) {
        // Kaydedilmiş yönlendirme varsa oraya git ve sessionStorage'dan temizle
        router.push(redirectPath);
        sessionStorage.removeItem("redirectAfterLogin");
      } else {
        // Yoksa normal returnUrl'e git
        router.push(returnUrl);
      }
    } catch (err: unknown) {
      // Firebase veya API hatalarını daha detaylı işle
      let errorMessage: string;

      if (err instanceof FirebaseError) {
        console.error("Firebase giriş hatası:", err.code, err.message);

        // Özel hata mesajları
        switch (err.code) {
          case "auth/invalid-credential":
          case "auth/invalid-login-credentials":
            errorMessage =
              "E-posta adresi veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.";
            break;
          case "auth/user-not-found":
            errorMessage =
              "Bu e-posta adresine sahip bir kullanıcı bulunamadı.";
            break;
          case "auth/wrong-password":
            errorMessage = "Şifre hatalı. Lütfen tekrar deneyin.";
            break;
          case "auth/too-many-requests":
            errorMessage =
              "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin veya şifrenizi sıfırlayın.";
            break;
          case "auth/network-request-failed":
            errorMessage =
              "Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.";
            break;
          case "auth/user-disabled":
            errorMessage =
              "Bu hesap devre dışı bırakılmıştır. Destek ekibiyle iletişime geçin.";
            break;
          default:
            errorMessage =
              err.message ||
              "Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.";
        }
      } else if (axios.isAxiosError(err)) {
        // API hatalarını işle
        const statusCode = err.response?.status;
        console.error("API giriş hatası:", statusCode, err.response?.data);

        if (statusCode === 400) {
          errorMessage = "Geçersiz kimlik bilgileri";
        } else if (statusCode === 401) {
          errorMessage = "Oturum açma yetkiniz yok";
        } else if (statusCode === 500) {
          errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin";
        } else {
          errorMessage =
            err.response?.data?.message || "API hatası: Giriş yapılamadı";
        }
      } else {
        // Diğer hatalar
        console.error("Giriş hatası:", err);
        errorMessage =
          err instanceof Error
            ? err.message
            : "Giriş yapılırken bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.";
      }

      setError(errorMessage);
      ErrorService.showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const { isNewUser } = await loginWithGoogle();

      // Eğer yeni kullanıcıysa onboarding sayfasına, değilse istenen sayfaya yönlendir
      if (isNewUser) {
        router.push("/onboarding");
      } else if (redirectPath) {
        // Kaydedilmiş yönlendirme varsa oraya git ve sessionStorage'dan temizle
        router.push(redirectPath);
        sessionStorage.removeItem("redirectAfterLogin");
      } else {
        // Yoksa normal returnUrl'e git
        router.push(returnUrl);
      }
    } catch (err: unknown) {
      console.error("Google ile giriş hatası:", err);

      // Hata mesajını göster
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Google ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.";

      setError(errorMessage);
      ErrorService.showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithCurrentAccount = () => {
    // Kullanıcıyı istenen sayfaya yönlendir
    if (redirectPath) {
      // Kaydedilmiş yönlendirme varsa oraya git ve sessionStorage'dan temizle
      router.push(redirectPath);
      sessionStorage.removeItem("redirectAfterLogin");
    } else {
      // Yoksa normal returnUrl'e git
      router.push(returnUrl);
    }
  };

  const handleUseAnotherAccount = async () => {
    try {
      setIsLoading(true);
      await signOut(); // Mevcut hesaptan çıkış yap
      setShowLoginOptions(false); // Login formunu göster
    } catch (err: unknown) {
      console.error("Çıkış hatası:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Hesap değiştirme işlemi sırasında bir hata oluştu.";
      setError(errorMessage);
      ErrorService.showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı zaten giriş yapmışsa ve seçenekler gösteriliyorsa
  if (showLoginOptions) {
    return (
      <div
        className={`min-h-screen flex transition-all duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
            : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
        }`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl transition-all duration-500 ${
              isDarkMode ? "bg-blue-500" : "bg-blue-300"
            }`}
          ></div>
          <div
            className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl transition-all duration-500 ${
              isDarkMode ? "bg-purple-500" : "bg-purple-300"
            }`}
          ></div>
        </div>

        <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`p-8 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
                isDarkMode
                  ? "bg-slate-800/60 border-slate-700/50"
                  : "bg-white/80 border-gray-200/50"
              }`}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                    isDarkMode
                      ? "bg-gradient-to-r from-blue-500 to-purple-500"
                      : "bg-gradient-to-r from-blue-600 to-purple-600"
                  }`}
                >
                  <FiArrowRight className="w-8 h-8 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className={`text-3xl font-bold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Hoş Geldiniz
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className={`text-sm mb-8 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <span className="font-medium">{user?.email}</span> olarak
                  giriş yaptınız
                </motion.p>

                <div className="space-y-4">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinueWithCurrentAccount}
                    className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden ${
                      isDarkMode
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Bu hesapla devam et
                      <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUseAnotherAccount}
                    disabled={isLoading}
                    className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg border ${
                      isDarkMode
                        ? "bg-slate-700/60 hover:bg-slate-600/60 text-white border-slate-600/50"
                        : "bg-white/80 hover:bg-white/95 text-gray-700 border-gray-200/50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading
                      ? "İşlem yapılıyor..."
                      : "Başka hesapla giriş yap"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Right Side */}
        <div className="relative flex-1 hidden lg:block">
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              isDarkMode
                ? "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800"
                : "bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200"
            }`}
          >
            {/* Floating Elements */}
            <motion.div
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute top-1/4 right-1/4 w-32 h-32 rounded-full blur-2xl ${
                isDarkMode ? "bg-blue-500/20" : "bg-blue-400/30"
              }`}
            />
            <motion.div
              animate={{
                x: [0, -20, 0],
                y: [0, 20, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute bottom-1/4 left-1/4 w-24 h-24 rounded-full blur-xl ${
                isDarkMode ? "bg-purple-500/20" : "bg-purple-400/30"
              }`}
            />
          </div>
        </div>
      </div>
    );
  }

  // Normal login formu
  return (
    <div
      className={`min-h-screen flex transition-all duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl transition-all duration-500 ${
            isDarkMode ? "bg-blue-500" : "bg-blue-300"
          }`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl transition-all duration-500 ${
            isDarkMode ? "bg-purple-500" : "bg-purple-300"
          }`}
        ></div>
      </div>

      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-500 to-purple-500"
                  : "bg-gradient-to-r from-blue-600 to-purple-600"
              }`}
            >
              <FiLock className="w-8 h-8 text-white" />
            </motion.div>

            <h2
              className={`text-3xl font-bold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Hesabınıza Giriş Yapın
            </h2>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Veya{" "}
              <Link
                href="/auth/register"
                className={`font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                }`}
              >
                yeni bir hesap oluşturun
              </Link>
            </p>
          </motion.div>

          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`p-8 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
              isDarkMode
                ? "bg-slate-800/60 border-slate-700/50"
                : "bg-white/80 border-gray-200/50"
            }`}
          >
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-4 mb-6 rounded-xl border ${
                  isDarkMode
                    ? "bg-red-500/10 border-red-500/30 text-red-300"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  E-posta adresi
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <FiMail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isDarkMode
                        ? "bg-slate-700/60 border-slate-600/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                        : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                    } backdrop-blur-sm`}
                    placeholder="E-posta adresinizi girin"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Şifre
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-12 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isDarkMode
                        ? "bg-slate-700/60 border-slate-600/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                        : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                    } backdrop-blur-sm`}
                    placeholder="Şifrenizi girin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                      isDarkMode
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                    } transition-colors duration-200`}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className={`w-4 h-4 rounded border transition-colors duration-200 ${
                      isDarkMode
                        ? "text-blue-500 bg-slate-700 border-slate-600 focus:ring-blue-500/20"
                        : "text-blue-600 bg-white border-gray-300 focus:ring-blue-500/20"
                    }`}
                  />
                  <label
                    htmlFor="remember-me"
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Beni hatırla
                  </label>
                </div>

                <Link
                  href="/auth/forgot-password"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  Şifrenizi mi unuttunuz?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Giriş yapılıyor...
                      </>
                    ) : (
                      <>
                        Giriş yap
                        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-8"
            >
              <div className="relative">
                <div
                  className={`absolute inset-0 flex items-center ${
                    isDarkMode ? "text-slate-600" : "text-gray-300"
                  }`}
                >
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className={`px-4 ${
                      isDarkMode
                        ? "bg-slate-800 text-gray-400"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    Veya şununla devam edin
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Google Login Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-6"
            >
              <motion.button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg border disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? "bg-slate-700/60 hover:bg-slate-600/60 text-white border-slate-600/50"
                    : "bg-white/80 hover:bg-white/95 text-gray-700 border-gray-200/50"
                }`}
              >
                <FaGoogle className="w-5 h-5 text-red-500" />
                Google ile giriş yap
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Right Side */}
      <div className="relative flex-1 hidden lg:block">
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isDarkMode
              ? "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800"
              : "bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200"
          }`}
        >
          {/* Enhanced Floating Elements */}
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute top-1/4 right-1/4 w-32 h-32 rounded-full blur-2xl ${
              isDarkMode ? "bg-blue-500/20" : "bg-blue-400/30"
            }`}
          />
          <motion.div
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute bottom-1/4 left-1/4 w-24 h-24 rounded-full blur-xl ${
              isDarkMode ? "bg-purple-500/20" : "bg-purple-400/30"
            }`}
          />
          <motion.div
            animate={{
              x: [0, 15, 0],
              y: [0, -15, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-lg ${
              isDarkMode ? "bg-cyan-500/20" : "bg-cyan-400/30"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
