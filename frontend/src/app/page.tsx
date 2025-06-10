"use client";

import { useState, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { QuizPreferences } from "@/types/quiz.type";
import { Quiz } from "@/types";
import {
  FiTarget,
  FiUser,
  FiClock,
  FiZap,
  FiStar,
  FiTrendingUp,
  FiBook,
  FiAward
} from "react-icons/fi";
import PageTransition from "@/components/transitions/PageTransition";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider";
import QuickQuizWizard from "@/components/home/ExamCreationWizard.quick-quiz";
import PersonalizedQuizWizard from "@/components/home/ExamCreationWizard.personalized-quiz";
import { usePagePerformance } from "@/hooks/usePagePerformance";

// ULTRA FAST gradient animations - reduced complexity
const gradientVariants = {
  hidden: {
    backgroundPosition: "0% 50%",
  },
  visible: {
    backgroundPosition: "100% 50%",
    transition: {
      repeat: Infinity,
      repeatType: "mirror" as const,
      duration: 15, // Reduced from 20 for faster animation
      ease: "easeInOut",
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.15,
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
};

const buttonHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.03,
    y: -2,
    boxShadow: "0 12px 25px -4px rgba(88, 28, 235, 0.5)",
    transition: { duration: 0.3, ease: "easeOut" }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeIn" }
  }
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isAuthenticated, isInitializing: isAuthInitializing } = useAuth();
  const { isDarkMode, theme } = useTheme();
  const [showExamCreationWizard, setShowExamCreationWizard] = useState(false);
  const [currentQuizType, setCurrentQuizType] = useState<'quick' | 'personalized'>('quick');

  // Performans izleme
  usePagePerformance('home');

  // Handle URL parameters on initial load
  useEffect(() => {
    const type = searchParams?.get('wizard');
    if (type === 'quick' || type === 'personalized') {
      setCurrentQuizType(type);
      setShowExamCreationWizard(true);
    }
  }, [searchParams]);

  // Update URL when wizard state changes
  const updateWizardState = (show: boolean, type: 'quick' | 'personalized') => {
    const params = new URLSearchParams(searchParams?.toString());
    
    if (show) {
      params.set('wizard', type);
    } else {
      params.delete('wizard');
    }
    
    // Update URL without causing a page refresh
    const newUrl = `${pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
    
    setCurrentQuizType(type);
    setShowExamCreationWizard(show);
  };


  const handleStartPersonalizedQuiz = () => {
    if (!isAuthenticated && !isAuthInitializing) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent('/?wizard=personalized')}`, { scroll: false });
      return;
    }
    if (isAuthenticated && !isAuthInitializing) {
      updateWizardState(true, 'personalized');
    }
  };
  
  const handleExamCreationComplete = (result: {
    file: File | null;
    quizType: "quick" | "personalized";
    personalizedQuizType?: "weakTopicFocused" | "newTopicFocused" | "comprehensive" | "learningObjectiveFocused";
    preferences: QuizPreferences;
    topicNameMap?: Record<string, string>;
    quiz?: Quiz;
    quizId?: string;
    documentId?: string;
    status?: 'success' | 'error';
    error?: Error;
  }) => {
    try {
      const params = new URLSearchParams();
      params.set("type", result.quizType);
      
      if (result.personalizedQuizType) {
        params.set("personalizedType", result.personalizedQuizType);
      }
      
      if (result.file) {
        params.set("fileName", encodeURIComponent(result.file.name));
      }

      if (result.quizId) {
        params.set("quizId", result.quizId);
      }

      if (result.documentId) {
        params.set("documentId", result.documentId);
      }
      
      console.log("Ana sayfada ExamCreationWizard tamamlandı, doğrudan quiz oluşturma API çağrısı yapılacak");
      
      if (result.quizId) {
        console.log(`Quiz ID mevcut (${result.quizId}), doğrudan sınav sayfasına yönlendiriliyor`);
        router.push(`/exams/${result.quizId}?mode=attempt`, { scroll: false });
        return;
      }
      
      const url = `/exams/create?${params.toString()}&startQuiz=true`;
      router.push(url, { scroll: false });
    } catch (error) {
      console.error("ExamCreationWizard tamamlama hatası:", error);
      const url = `/exams/create?type=${result.quizType}`;
      router.push(url, { scroll: false });
    }
  };
  
  if (isAuthInitializing) {
    return (
      <div className={`flex items-center justify-center h-screen transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <Spinner size="lg" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`mt-4 text-lg font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Platform hazırlanıyor...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className={`w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-2 py-8 md:py-16 relative overflow-hidden transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        {/* Enhanced Background Pattern with Multiple Layers */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary floating orbs */}
          <motion.div 
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className={`absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-500 ${
              isDarkMode ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-blue-300 to-indigo-400'
            }`}
          />
          <motion.div 
            animate={{
              x: [0, -80, 0],
              y: [0, 100, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl transition-all duration-500 ${
              isDarkMode ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-purple-300 to-pink-400'
            }`}
          />
          
          {/* Secondary floating elements */}
          <motion.div 
            animate={{
              x: [0, 60, 0],
              y: [0, -80, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute top-1/4 right-1/4 w-32 h-32 rounded-full opacity-15 blur-2xl transition-all duration-500 ${
              isDarkMode ? 'bg-gradient-to-br from-green-500 to-teal-600' : 'bg-gradient-to-br from-green-300 to-teal-400'
            }`}
          />
          <motion.div 
            animate={{
              x: [0, -40, 0],
              y: [0, 60, 0],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute bottom-1/4 left-1/4 w-24 h-24 rounded-full opacity-15 blur-2xl transition-all duration-500 ${
              isDarkMode ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gradient-to-br from-orange-300 to-red-400'
            }`}
          />
          
          {/* Central glow effect */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px] transition-all duration-500 ${
            isDarkMode ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600' : 'bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200'
          }`} />
          
          {/* Grid overlay for depth */}
          <div className={`absolute inset-0 opacity-5 ${
            isDarkMode ? 'bg-slate-900' : 'bg-gray-100'
          }`} 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? 'rgb(148 163 184)' : 'rgb(75 85 99)'} 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto">
          {showExamCreationWizard ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`rounded-3xl shadow-2xl backdrop-blur-xl border transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-slate-800/40 border-slate-700/50' 
                  : 'bg-white/60 border-gray-200/50'
              }`}
            >
              <div className="relative z-10 p-6 md:p-8">
                <Suspense
                  fallback={
                    <div className="flex justify-center my-8">
                      <Spinner size="lg" color="primary" />
                    </div>
                  }
                >
                  {currentQuizType === 'quick' ? (
                    <QuickQuizWizard 
                      quizType={currentQuizType} 
                      onComplete={handleExamCreationComplete} 
                    />
                  ) : (
                    <PersonalizedQuizWizard 
                      quizType={currentQuizType} 
                      onComplete={handleExamCreationComplete} 
                    />
                  )}
                </Suspense>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div
                className={`relative overflow-hidden rounded-3xl shadow-2xl border backdrop-blur-xl transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-800/90 via-slate-700/80 to-slate-800/90 border-slate-600/30 shadow-black/20' 
                    : 'bg-gradient-to-br from-white/90 via-blue-50/80 to-white/90 border-gray-200/30 shadow-gray-900/10'
                }`}
                variants={gradientVariants}
                initial="hidden"
                animate="visible"
                style={{ backgroundSize: "300% 300%" }}
              >
                {/* Enhanced Glass Effect Layers */}
                <div className={`absolute inset-0 transition-all duration-500 ${
                  isDarkMode ? 'bg-gradient-to-br from-slate-800/20 to-slate-900/40' : 'bg-gradient-to-br from-white/40 to-blue-50/60'
                }`} />
                
                {/* Animated grid overlay */}
                <motion.div 
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute inset-0 bg-grid-white/[0.08] bg-[length:24px_24px] ${
                    isDarkMode ? 'opacity-20' : 'opacity-10'
                  }`} 
                />
                
                {/* Glowing border effects */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent ${
                  isDarkMode ? 'opacity-80' : 'opacity-50'
                }`} />
                <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent ${
                  isDarkMode ? 'opacity-80' : 'opacity-50'
                }`} />
                
                {/* Enhanced backdrop with subtle animations */}
                <motion.div 
                  animate={{ 
                    background: isDarkMode 
                      ? ['linear-gradient(to bottom, transparent, rgba(0,0,0,0.1))', 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.2))', 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.1))']
                      : ['linear-gradient(to bottom, transparent, rgba(255,255,255,0.1))', 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2))', 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1))']
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute inset-0 backdrop-blur-[2px] transition-all duration-500`} 
                />
                
                {/* Top highlight */}
                <div className={`absolute top-0 left-0 right-0 h-32 transition-all duration-500 ${
                  isDarkMode ? 'bg-gradient-to-b from-blue-400/10 via-purple-400/5 to-transparent' : 'bg-gradient-to-b from-blue-300/20 via-purple-300/10 to-transparent'
                }`} />
                
                {/* Enhanced Floating Elements */}
                <motion.div
                  className={`absolute w-60 h-60 rounded-full blur-[80px] transition-all duration-500 ${
                    isDarkMode ? 'bg-blue-500/20' : 'bg-blue-400/30'
                  }`}
                  animate={{ x: [0, 30, 0], y: [0, -30, 0], opacity: [0.5, 0.7, 0.5], scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  style={{ top: "-10%", left: "10%" }}
                />
                <motion.div
                  className={`absolute w-48 h-48 rounded-full blur-[60px] transition-all duration-500 ${
                    isDarkMode ? 'bg-purple-500/25' : 'bg-purple-400/35'
                  }`}
                  animate={{ x: [0, -40, 0], y: [0, 20, 0], opacity: [0.3, 0.6, 0.3], scale: [1, 0.9, 1] }}
                  transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                  style={{ bottom: "5%", right: "15%" }}
                />
                <motion.div
                  className={`absolute w-40 h-40 rounded-full blur-[70px] transition-all duration-500 ${
                    isDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-400/30'
                  }`}
                  animate={{ x: [0, 40, 0], y: [0, 40, 0], opacity: [0.2, 0.5, 0.2], scale: [1.1, 0.95, 1.1] }}
                  transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                  style={{ bottom: "15%", left: "25%" }}
                />
                <motion.div
                  className={`absolute w-32 h-32 rounded-full blur-[50px] transition-all duration-500 ${
                    isDarkMode ? 'bg-emerald-500/15' : 'bg-emerald-400/25'
                  }`}
                  animate={{ x: [-15, 20, -15], y: [15, -15, 15], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                  style={{ top: "25%", right: "25%" }}
                />
                <div className="relative py-12 md:py-16 px-4 md:px-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                      {/* Enhanced Badge */}
                      <motion.div
                        custom={0.5}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="mb-6 inline-block"
                      >
                        <span className={`px-4 py-2 rounded-full backdrop-blur-xl text-xs font-medium border shadow-lg inline-flex items-center gap-2 transition-all duration-500 ${
                          isDarkMode 
                            ? 'bg-slate-700/60 text-slate-200 border-slate-600/50' 
                            : 'bg-white/80 text-gray-700 border-gray-200/50'
                        }`}>
                          <motion.span 
                            className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <FiStar className="w-3 h-3" />
                          AI Quiz - Yapay Zeka Destekli Öğrenme Platformu
                        </span>
                      </motion.div>

                      {/* Enhanced Title */}
                      <motion.h1
                        custom={1}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className={`text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight transition-all duration-500 ${
                          isDarkMode 
                            ? 'text-white [text-shadow:0_2px_15px_rgba(0,0,0,0.6)]' 
                            : 'text-gray-900 [text-shadow:0_2px_15px_rgba(255,255,255,0.6)]'
                        }`}
                      >
                        <span className={`bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 ${
                          isDarkMode 
                            ? 'from-blue-300 via-purple-300 to-cyan-300' 
                            : 'from-blue-600 via-purple-600 to-cyan-600'
                        }`}>
                          AI Quiz
                        </span>
                        <br />
                        Yapay Zeka Destekli Öğrenme Platformu
                      </motion.h1>

                      {/* Enhanced Description */}
                      <motion.p
                        custom={2}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className={`text-base md:text-xl mb-8 max-w-2xl mx-auto font-light leading-relaxed transition-all duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Bilgi seviyenizi ölçün, eksiklerinizi tespit edin ve öğrenme sürecinizi 
                        <span className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                          {' '}kişiselleştirilmiş bir deneyimle{' '}
                        </span>
                        optimize edin.
                      </motion.p>

                      {/* Enhanced Stats Section */}
                      <motion.div
                        custom={2.5}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-3 gap-4 md:gap-8 mb-10 max-w-2xl mx-auto"
                      >
                        {[
                          { icon: FiBook, label: "Quiz Türü", value: "10+" },
                          { icon: FiTrendingUp, label: "Başarı Oranı", value: "95%" },
                          { icon: FiAward, label: "Aktif Kullanıcı", value: "1K+" }
                        ].map((stat, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className={`p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 ${
                              isDarkMode 
                                ? 'bg-slate-700/40 border-slate-600/30 hover:bg-slate-600/40' 
                                : 'bg-white/60 border-gray-200/30 hover:bg-white/80'
                            }`}
                          >
                            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${
                              isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            }`} />
                            <div className={`text-2xl font-bold mb-1 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {stat.value}
                            </div>
                            <div className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {stat.label}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                      {/* Enhanced Card Grid */}
                      <motion.div
                        custom={3}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
                      >
                        {/* Enhanced Quick Quiz Card */}
                        <motion.div 
                          whileHover={{ scale: 1.03, y: -8 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => updateWizardState(true, 'quick')}
                          className={`group relative overflow-hidden rounded-3xl p-8 border transition-all duration-500 backdrop-blur-xl shadow-xl hover:shadow-2xl cursor-pointer ${
                            isDarkMode 
                              ? 'bg-gradient-to-br from-slate-700/70 via-slate-600/60 to-slate-700/70 border-slate-500/30 hover:border-blue-400/50' 
                              : 'bg-gradient-to-br from-white/90 via-blue-50/80 to-white/90 border-gray-200/40 hover:border-blue-300/60'
                          }`}
                        >
                          {/* Enhanced Multi-layer Background Effects */}
                          <div className={`absolute inset-0 bg-gradient-to-br opacity-20 transition-all duration-700 ${
                            isDarkMode ? 'from-blue-500/30 via-indigo-500/20 to-transparent' : 'from-blue-400/20 via-indigo-400/15 to-transparent'
                          }`} />
                          <motion.div 
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.1, 0.3, 0.1],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className={`absolute -top-20 -right-20 w-40 h-40 blur-3xl rounded-full transition-all duration-700 ${
                              isDarkMode 
                                ? 'bg-gradient-to-br from-blue-400/30 to-cyan-400/20' 
                                : 'bg-gradient-to-br from-blue-400/40 to-cyan-400/30'
                            }`} 
                          />
                          
                          {/* Glowing border effect */}
                          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className={`absolute inset-0 rounded-3xl ${
                              isDarkMode 
                                ? 'bg-gradient-to-r from-blue-400/20 via-cyan-400/10 to-blue-400/20' 
                                : 'bg-gradient-to-r from-blue-300/30 via-cyan-300/20 to-blue-300/30'
                            } blur-sm`} />
                          </div>
                          
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                              <motion.div 
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className={`p-4 rounded-2xl shadow-lg border backdrop-blur-sm transition-all duration-300 ${
                                  isDarkMode 
                                    ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border-blue-400/30' 
                                    : 'bg-gradient-to-br from-blue-100/90 to-cyan-100/80 border-blue-200/60'
                                }`}
                              >
                                <FiClock className={`text-2xl ${
                                  isDarkMode ? 'text-blue-300' : 'text-blue-600'
                                }`} />
                              </motion.div>
                              <span className={`text-xs px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md font-medium transition-all duration-300 ${
                                  isDarkMode 
                                    ? 'bg-slate-600/60 border-slate-500/30 text-slate-200' 
                                    : 'bg-white/80 border-gray-200/50 text-gray-700'
                                }`}>
                                  Üyelik Gerektirmez
                              </span>
                            </div>
                            
                            <h3 className={`text-2xl font-bold mb-4 transition-all duration-300 group-hover:translate-x-1 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Hızlı Sınav
                            </h3>
                            
                            <p className={`mb-8 text-sm leading-relaxed transition-all duration-300 ${
                              isDarkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}>
                              Üyelik gerektirmeden istediğiniz konuda bilgi seviyenizi hemen test edin. 
                              Seçtiğiniz alanda temel bilgilerinizi ölçmek için ideal.
                            </p>
                            
                            <motion.div
                              variants={buttonHover}
                              whileHover="hover"
                              whileTap="tap"
                              className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-2xl font-semibold text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg border group relative overflow-hidden ${
                                isDarkMode 
                                  ? 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 hover:from-blue-500/90 hover:to-cyan-500/90 text-white border-blue-400/30 focus:ring-blue-500/50' 
                                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-blue-300/50 focus:ring-blue-500/50'
                              }`}
                            >
                              <motion.div 
                                className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                  isDarkMode 
                                    ? 'from-blue-400/30 to-cyan-400/30' 
                                    : 'from-blue-500/20 to-cyan-500/20'
                                }`}
                                animate={{
                                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                style={{ backgroundSize: '200% 200%' }}
                              />
                              <FiZap className="w-5 h-5 mr-3 relative z-10" />
                              <span className="relative z-10">Hızlı Sınav Oluştur</span>
                            </motion.div>
                          </div>
                        </motion.div>

                        {/* Enhanced Personalized Quiz Card */}
                        <motion.div 
                          whileHover={{ scale: 1.03, y: -8 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleStartPersonalizedQuiz}
                          className={`group relative overflow-hidden rounded-3xl p-8 border transition-all duration-500 backdrop-blur-xl shadow-xl hover:shadow-2xl cursor-pointer ${
                            isDarkMode 
                              ? 'bg-gradient-to-br from-slate-700/70 via-purple-900/30 to-slate-700/70 border-slate-500/30 hover:border-purple-400/50' 
                              : 'bg-gradient-to-br from-white/90 via-purple-50/80 to-white/90 border-gray-200/40 hover:border-purple-300/60'
                          }`}
                        >
                          {/* Enhanced Multi-layer Background Effects */}
                          <div className={`absolute inset-0 bg-gradient-to-br opacity-20 transition-all duration-700 ${
                            isDarkMode ? 'from-purple-500/30 via-pink-500/20 to-transparent' : 'from-purple-400/20 via-pink-400/15 to-transparent'
                          }`} />
                          <motion.div 
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.1, 0.3, 0.1],
                            }}
                            transition={{
                              duration: 5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className={`absolute -top-24 -left-24 w-48 h-48 blur-3xl rounded-full transition-all duration-500 ${
                              isDarkMode 
                                ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/20' 
                                : 'bg-gradient-to-br from-purple-400/40 to-pink-400/30'
                            }`} 
                          />
                          
                          {/* Glowing border effect */}
                          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className={`absolute inset-0 rounded-3xl ${
                              isDarkMode 
                                ? 'bg-gradient-to-r from-purple-400/20 via-pink-400/10 to-purple-400/20' 
                                : 'bg-gradient-to-r from-purple-300/30 via-pink-300/20 to-purple-300/30'
                            } blur-sm`} />
                          </div>
                          
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                              <motion.div 
                                whileHover={{ scale: 1.1, rotate: -10 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className={`p-4 rounded-2xl shadow-lg border backdrop-blur-sm transition-all duration-300 ${
                                  isDarkMode 
                                    ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/20 border-purple-400/30'
                                    : 'bg-gradient-to-br from-purple-100/90 to-pink-100/80 border-purple-200/60'
                                }`}
                              >
                                <FiUser className={`text-2xl ${
                                  isDarkMode ? 'text-purple-300' : 'text-purple-600'
                                }`} />
                              </motion.div>
                              <span className={`text-xs px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md font-medium transition-all duration-300 ${
                                isDarkMode 
                                  ? 'bg-slate-600/60 border-slate-500/30 text-slate-200' 
                                  : 'bg-white/80 border-gray-200/50 text-gray-700'
                                }`}>
                                  {isAuthenticated ? "Premium Özellik" : "Giriş Gerektirir"}
                              </span>
                            </div>
                            
                            <h3 className={`text-2xl font-bold mb-4 transition-all duration-300 group-hover:translate-x-1 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Kişiselleştirilmiş Sınav
                            </h3>
                            
                            <p className={`mb-8 text-sm leading-relaxed transition-all duration-300 ${
                              isDarkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}>
                              Öğrenme geçmişiniz, performansınız ve hedeflerinize göre tamamen size özel sınavlar oluşturun 
                              ve ilerlemenizi takip edin.
                            </p>
                            
                            <motion.div
                              variants={buttonHover}
                              initial="rest"
                              whileHover="hover"
                              whileTap="tap"
                              className={`w-full flex items-center justify-center gap-3 font-semibold rounded-2xl px-6 py-4 text-base transition-all duration-300 shadow-lg border relative overflow-hidden group ${
                                isDarkMode 
                                  ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500/90 hover:to-pink-500/90 text-white border-purple-400/30' 
                                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-purple-300/50'
                              }`}
                            >
                              <motion.div 
                                className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                  isDarkMode 
                                    ? 'from-purple-400/30 to-pink-400/30' 
                                    : 'from-purple-500/20 to-pink-500/20'
                                }`}
                                animate={{
                                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                style={{ backgroundSize: '200% 200%' }}
                              />
                              <FiTarget className="text-lg relative z-10" />
                              <span className="relative z-10">
                                {isAuthenticated ? "Kişiselleştirilmiş Sınav Oluştur" : "Giriş Yap ve Başla"}
                              </span>
                            </motion.div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}