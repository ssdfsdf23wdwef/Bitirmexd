"use client";

import { useState } from "react";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/auth/useAuth";
import { useTheme } from "@/context/ThemeProvider";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // useAuth hook ile şifre sıfırlama
      await resetPassword(email);

      // Başarılı sonuç
      setIsSubmitted(true);
    } catch (error: unknown) {
      // Firebase hata kodlarına göre kullanıcı dostu mesajlar
      const firebaseError = error as { code?: string; message?: string };

      if (firebaseError.code === "auth/user-not-found") {
        setError("Bu email adresiyle ilişkili bir hesap bulunamadı.");
      } else if (firebaseError.code === "auth/invalid-email") {
        setError("Geçersiz email adresi.");
      } else if (firebaseError.code === "auth/too-many-requests") {
        setError(
          "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.",
        );
      } else if (firebaseError.code === "auth/missing-email") {
        setError("Lütfen bir email adresi girin.");
      } else {
        setError(
          "Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex items-center justify-center ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
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
              ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20"
              : "bg-gradient-to-r from-blue-200/40 to-indigo-200/40"
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
              ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20"
              : "bg-gradient-to-r from-purple-200/40 to-pink-200/40"
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
              ? "bg-gradient-to-r from-green-600/20 to-teal-600/20"
              : "bg-gradient-to-r from-green-200/40 to-teal-200/40"
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
            ? "bg-slate-800/90 border border-slate-700/50"
            : "bg-white/90 border border-white/20"
        } rounded-2xl shadow-2xl backdrop-blur-xl`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            className={`text-4xl font-bold mb-2 bg-gradient-to-r ${
              isDarkMode
                ? "from-blue-400 to-indigo-400"
                : "from-blue-600 to-indigo-600"
            } bg-clip-text text-transparent`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            quiz
          </motion.h1>
          <p className={`${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
            Akıllı Öğrenme Platformu
          </p>
        </div>

        {!isSubmitted ? (
          <>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center mb-6"
            >
              <Link
                href="/auth/login"
                className={`flex items-center gap-2 font-medium transition-colors ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                <FiArrowLeft />
                Giriş sayfasına dön
              </Link>
            </motion.div>

            <h2
              className={`text-2xl font-semibold mb-4 ${
                isDarkMode ? "text-slate-100" : "text-gray-800"
              }`}
            >
              Şifremi Unuttum
            </h2>
            <p
              className={`mb-6 ${
                isDarkMode ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Hesabınıza bağlı e-posta adresinizi girin. Size şifrenizi
              sıfırlamanız için bir bağlantı göndereceğiz.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${
                  isDarkMode
                    ? "bg-red-900/20 border border-red-700/30 text-red-300"
                    : "bg-red-50 border border-red-200 text-red-700"
                } p-4 rounded-lg mb-4 backdrop-blur-sm`}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-200" : "text-gray-700"
                  }`}
                  htmlFor="email"
                >
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail
                      className={`${isDarkMode ? "text-slate-400" : "text-gray-400"}`}
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-blue-500/30 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500/30 focus:border-blue-500"
                    }`}
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25"
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Gönderiliyor...
                  </>
                ) : (
                  "Sıfırlama Bağlantısı Gönder"
                )}
              </motion.button>
            </form>
          </>
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
                isDarkMode
                  ? "bg-green-900/30 border border-green-700/30"
                  : "bg-green-100 border border-green-200"
              }`}
            >
              <FiCheckCircle
                className={`text-3xl ${
                  isDarkMode ? "text-green-400" : "text-green-600"
                }`}
              />
            </motion.div>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                isDarkMode ? "text-slate-100" : "text-gray-800"
              }`}
            >
              Bağlantı Gönderildi
            </h2>
            <p
              className={`mb-6 ${
                isDarkMode ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Şifre sıfırlama bağlantısı{" "}
              <strong
                className={isDarkMode ? "text-blue-400" : "text-blue-600"}
              >
                {email}
              </strong>{" "}
              adresine gönderildi. Lütfen e-postanızı kontrol edin ve şifrenizi
              sıfırlamak için bağlantıya tıklayın.
            </p>
            <Link
              href="/auth/login"
              className={`font-medium transition-colors ${
                isDarkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-800"
              }`}
            >
              Giriş sayfasına dön
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
