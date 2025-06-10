"use client";

import { useState, useEffect } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/auth/useAuth";
import { useTheme } from "@/context/ThemeProvider";

export default function RegisterPage() {
  const { register } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "ok" | "error"
  >("checking");

  // Component mount olduğunda backend kontrolü yap
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        console.log(
          `🌐 [RegisterPage] Backend kontrolü yapılıyor: ${apiBaseUrl}/health`,
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(`${apiBaseUrl}/health`, {
            method: "GET",
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            console.log("✅ [RegisterPage] Backend erişilebilir!");
            setBackendStatus("ok");
          } else {
            console.error(
              `❌ [RegisterPage] Backend yanıt verdi ama başarısız durum kodu: ${response.status}`,
            );
            setBackendStatus("error");
          }
        } catch (error: unknown) {
          console.error("❌ [RegisterPage] Backend erişim hatası:", error);
          setBackendStatus("error");
        }
      } catch (error: unknown) {
        console.error("❌ [RegisterPage] Backend kontrol hatası:", error);
        setBackendStatus("error");
      }
    };

    checkBackendStatus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFirstStep = () => {
    if (!formData.firstName || !formData.lastName) {
      setError("Ad ve soyad alanları zorunludur.");
      return false;
    }
    return true;
  };

  const validateSecondStep = () => {
    if (!formData.email) {
      setError("Email alanı zorunludur.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Geçerli bir email adresi giriniz.");
      return false;
    }

    if (!formData.password) {
      setError("Şifre alanı zorunludur.");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return false;
    }

    return true;
  };

  const nextStep = () => {
    setError("");
    if (step === 1 && validateFirstStep()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setError("");
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateSecondStep()) {
      return;
    }

    setIsLoading(true);

    try {
      // Email ve şifre kontrolü
      console.log("🔄 [RegisterPage] Kayıt bilgileri kontrol ediliyor:", {
        email: formData.email,
        password: formData.password ? "Şifre girilmiş" : "Şifre eksik",
        passwordLength: formData.password.length,
      });

      // Firebase kullanarak kayıt işlemini gerçekleştir

      // register çağrısında email, password ve userData parametrelerini doğru sırayla ve formatta gönder
      await register(formData.email, formData.password, { 
        firstName: formData.firstName, 
        lastName: formData.lastName 
      });

      // Başarılı kayıt sonrası router üzerinden yönlendirme yapılacak
    } catch (error: unknown) {
      console.error("Kayıt hatası:", error);

      // Ağ hatası kontrolü
      if (
        error instanceof Error &&
        (error.message.includes("Network Error") ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("Backend sunucusuna") ||
          error.message.includes("net::ERR"))
      ) {
        setError(
          "Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin ve sunucunun çalışır durumda olduğundan emin olun.",
        );
      } else {
        // Firebase hata kodları kontrolü
        const firebaseError = error as { code?: string; message?: string };

        if (
          firebaseError.code === "auth/email-already-in-use" ||
          (firebaseError.message &&
            firebaseError.message.includes("email-already-in-use"))
        ) {
          setError("Bu email adresi zaten kullanılıyor.");
        } else if (
          firebaseError.code === "auth/invalid-email" ||
          (firebaseError.message &&
            firebaseError.message.includes("invalid-email"))
        ) {
          setError("Geçersiz email adresi.");
        } else if (
          firebaseError.code === "auth/weak-password" ||
          (firebaseError.message &&
            firebaseError.message.includes("weak-password"))
        ) {
          setError("Şifre çok zayıf. Lütfen daha güçlü bir şifre seçin.");
        } else if (
          firebaseError.code === "auth/missing-password" ||
          (firebaseError.message &&
            firebaseError.message.includes("missing-password"))
        ) {
          setError("Şifre boş olamaz. Lütfen bir şifre girin.");
        } else if (
          firebaseError.code === "auth/network-request-failed" ||
          (firebaseError.message &&
            firebaseError.message.includes("network-request-failed"))
        ) {
          setError("Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.");
        } else {
          setError("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden flex items-center justify-center ${
      isDarkMode
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute top-10 left-10 w-32 h-32 rounded-full ${
            isDarkMode
              ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20'
              : 'bg-gradient-to-r from-blue-200/40 to-indigo-200/40'
          } blur-xl`}
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute bottom-10 right-10 w-40 h-40 rounded-full ${
            isDarkMode
              ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20'
              : 'bg-gradient-to-r from-purple-200/40 to-pink-200/40'
          } blur-xl`}
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute top-1/2 left-1/4 w-24 h-24 rounded-full ${
            isDarkMode
              ? 'bg-gradient-to-r from-green-600/20 to-teal-600/20'
              : 'bg-gradient-to-r from-green-200/40 to-teal-200/40'
          } blur-lg`}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 max-w-md w-full mx-auto p-8 ${
          isDarkMode
            ? 'bg-slate-800/90 border border-slate-700/50'
            : 'bg-white/90 border border-white/20'
        } rounded-2xl shadow-2xl backdrop-blur-xl`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            className={`text-4xl font-bold mb-2 bg-gradient-to-r ${
              isDarkMode
                ? 'from-blue-400 to-indigo-400'
                : 'from-blue-600 to-indigo-600'
            } bg-clip-text text-transparent`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            quiz
          </motion.h1>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            Akıllı Öğrenme Platformu
          </p>
        </div>

        <h2 className={`text-2xl font-semibold mb-6 ${
          isDarkMode ? 'text-slate-100' : 'text-gray-800'
        }`}>
          Hesap Oluştur
        </h2>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="flex-1">
              <div
                className={`w-full h-2 ${
                  step >= 1
                    ? isDarkMode
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600"
                    : isDarkMode
                    ? "bg-slate-700"
                    : "bg-gray-200"
                } rounded-l-full transition-all duration-300`}
              />
            </div>
            <motion.div
              animate={{ scale: step >= 1 ? 1.1 : 1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1
                  ? isDarkMode
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25"
                  : isDarkMode
                  ? "bg-slate-700 text-slate-400"
                  : "bg-gray-200 text-gray-700"
              } transition-all duration-300`}
            >
              1
            </motion.div>
            <div className="flex-1">
              <div
                className={`w-full h-2 ${
                  step >= 2
                    ? isDarkMode
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600"
                    : isDarkMode
                    ? "bg-slate-700"
                    : "bg-gray-200"
                } transition-all duration-300`}
              />
            </div>
            <motion.div
              animate={{ scale: step >= 2 ? 1.1 : 1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2
                  ? isDarkMode
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25"
                  : isDarkMode
                  ? "bg-slate-700 text-slate-400"
                  : "bg-gray-200 text-gray-700"
              } transition-all duration-300`}
            >
              2
            </motion.div>
            <div className="flex-1">
              <div
                className={`w-full h-2 ${
                  step >= 3
                    ? isDarkMode
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600"
                    : isDarkMode
                    ? "bg-slate-700"
                    : "bg-gray-200"
                } rounded-r-full transition-all duration-300`}
              />
            </div>
          </div>
          <div className="flex justify-between mt-3 text-xs">
            <span className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Kişisel Bilgiler
            </span>
            <span className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Hesap Bilgileri
            </span>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              isDarkMode
                ? 'bg-red-900/20 border border-red-700/30 text-red-300'
                : 'bg-red-50 border border-red-200 text-red-700'
            } p-4 rounded-lg mb-4 backdrop-blur-sm`}
          >
            {error}
          </motion.div>
        )}

        {backendStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              isDarkMode
                ? 'bg-orange-900/20 border-l-4 border-orange-500 text-orange-300'
                : 'bg-orange-50 border-l-4 border-orange-500 text-orange-700'
            } p-4 rounded-lg mb-4 backdrop-blur-sm`}
          >
            <div className="flex items-center">
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Uyarı:</span>
            </div>
            <p className="mt-1">
              Backend sunucusuna bağlanılamıyor. Lütfen sunucunun çalıştığından
              emin olun. Kayıt işlemi şu anda çalışmayabilir.
            </p>
          </motion.div>
        )}

        <form
          onSubmit={
            step === 2
              ? handleSubmit
              : (e) => {
                  e.preventDefault();
                  nextStep();
                }
          }
        >
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-200' : 'text-gray-700'
                  }`}
                  htmlFor="firstName"
                >
                  Adınız
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className={`${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-blue-500/30 focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500/30 focus:border-blue-500'
                    }`}
                    placeholder="Adınız"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-200' : 'text-gray-700'
                  }`}
                  htmlFor="lastName"
                >
                  Soyadınız
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className={`${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-blue-500/30 focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500/30 focus:border-blue-500'
                    }`}
                    placeholder="Soyadınız"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <motion.button
                type="button"
                onClick={nextStep}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25'
                }`}
              >
                İlerle
                <FiArrowRight className="text-lg" />
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-200' : 'text-gray-700'
                  }`}
                  htmlFor="email"
                >
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className={`${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-blue-500/30 focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500/30 focus:border-blue-500'
                    }`}
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-200' : 'text-gray-700'
                  }`}
                  htmlFor="password"
                >
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className={`${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-blue-500/30 focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500/30 focus:border-blue-500'
                    }`}
                    placeholder="Şifreniz (en az 6 karakter)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className={`${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                    ) : (
                      <FiEye className={`${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-200' : 'text-gray-700'
                  }`}
                  htmlFor="confirmPassword"
                >
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className={`${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-blue-500/30 focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500/30 focus:border-blue-500'
                    }`}
                    placeholder="Şifrenizi tekrar girin"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                  }`}
                >
                  Geri
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      Kayıt Ol
                      <FiArrowRight className="text-lg" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </form>

        <div className="mt-8 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Zaten bir hesabınız var mı?{" "}
            <Link
              href="/auth/login"
              className={`font-medium transition-colors ${
                isDarkMode
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              Giriş Yap
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
