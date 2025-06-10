"use client";

import { usePathname } from "next/navigation";
import {
  FiHome,
  FiBook,
  FiFileText,
  FiTarget,
  FiSettings,
  FiBarChart2,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiBox,
  FiAward
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeProvider";
import FastLink from "@/components/ui/FastLink";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleToggle = () => {
    onToggleCollapse();
  };

  // Don't render sidebar on login page
  if (pathname === "/auth/login") {
    return null;
  }

  // Main menu items
  const menuItems = [
    {
      href: "/",
      label: "Ana Sayfa",
      icon: <FiHome size={16} />,
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      href: "/courses", 
      label: "Derslerim", 
      icon: <FiBook size={16} />,
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      href: "/exams",
      label: "Sınavlarım",
      icon: <FiFileText size={16} />,
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      href: "/learning-goals",
      label: "Öğrenme Hedeflerim",
      icon: <FiTarget size={16} />,
      gradient: "from-amber-500 to-orange-500"
    },
    { 
      href: "/performance", 
      label: "Performans Analizi", 
      icon: <FiBarChart2 size={16} />,
      gradient: "from-green-500 to-emerald-600"
    },
    { 
      href: "/achievements", 
      label: "Başarılarım", 
      icon: <FiAward size={16} />,
      gradient: "from-rose-500 to-pink-600"
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? "68px" : "280px" }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={`sidebar-fixed border-r backdrop-blur-xl flex flex-col overflow-hidden ${
        isDarkMode 
          ? 'border-slate-700/50 bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95 shadow-2xl shadow-slate-900/20' 
          : 'border-gray-200/80 bg-gradient-to-b from-white/95 via-gray-50/95 to-white/95 shadow-2xl shadow-gray-900/10'
      }`}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        height: '100dvh',
        zIndex: 999,
        transform: 'translateZ(0)', // Hardware acceleration
        backfaceVisibility: 'hidden',
        willChange: 'width', // Optimize for width changes
        // Kesin scroll izolasyonu için
        contain: 'strict',
        isolation: 'isolate',
        // Browser'ın kendi optimization'larını devre dışı bırak
        overscrollBehavior: 'none'
      }}
    >
      {/* Enhanced Modern Toggle Button with glassmorphism */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`absolute top-4 right-2 w-8 h-8 flex items-center justify-center rounded-xl backdrop-blur-xl border shadow-lg transition-all duration-300 z-10 group ${
          isDarkMode 
            ? 'bg-slate-700/60 border-slate-600/30 text-slate-300 hover:bg-slate-600/70 hover:text-slate-100' 
            : 'bg-white/60 border-gray-200/30 text-gray-500 hover:bg-white/80 hover:text-gray-700'
        }`}
        aria-label={isCollapsed ? "Sidebar'ı Aç" : "Sidebar'ı Kapat"}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
        >
          <FiChevronLeft size={16} className="stroke-[2px] group-hover:stroke-[2.5px] transition-all duration-300" />
        </motion.div>
        
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' 
            : 'bg-gradient-to-r from-blue-400/20 to-purple-400/20'
        }`} />
      </motion.button>

      {/* Enhanced Sidebar Header with modern gradient and glass effect */}
      <div className={`h-16 px-4 border-b backdrop-blur-xl flex items-center relative ${
        isDarkMode 
          ? 'border-slate-700/30 bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80' 
          : 'border-gray-200/50 bg-gradient-to-r from-white/80 via-gray-50/60 to-white/80'
      }`}>
        {/* Animated background glow */}
        <div className={`absolute inset-0 opacity-30 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-blue-600/10' 
            : 'bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-blue-500/10'
        }`} />
        
        <motion.div
          initial={false}
          animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden flex items-center relative z-10"
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FiTarget size={16} className="text-white drop-shadow-sm" />
              </motion.div>
              <div>
                <h2 className={`text-lg font-bold tracking-wide bg-gradient-to-r ${
                  isDarkMode 
                    ? 'from-blue-400 via-purple-400 to-indigo-400' 
                    : 'from-blue-600 via-purple-600 to-indigo-600'
                } bg-clip-text text-transparent`}>
                  QuizMaster
                </h2>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} -mt-1`}>
                  AI Learning Platform
                </p>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Collapsed state icon */}
        {isCollapsed && (
          <motion.div 
            className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <FiTarget size={16} className="text-white drop-shadow-sm" />
          </motion.div>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        {isInitializing ? (
          // Loading placeholder with light theme styling
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-10 ${isDarkMode ? 'bg-gray-800/70' : 'bg-gray-100/90'} rounded-lg animate-pulse`}
              ></div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-modern scrollbar-modern-dark">
              {/* Enhanced Main menu items with modern glassmorphism and micro-interactions */}
              <nav className="py-4 px-3 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <FastLink
                      href={item.href}
                      prefetch={true}
                      scroll={false}
                      className={`group flex items-center py-3 px-4 rounded-2xl fast-interactive hw-accelerated relative transition-all duration-300 ${isCollapsed ? "justify-center" : ""}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {/* Enhanced Background with multiple layers */}
                      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${isActive(item.href) 
                        ? `bg-gradient-to-r ${item.gradient} opacity-20 shadow-lg backdrop-blur-sm ${isDarkMode ? 'shadow-black/10' : 'shadow-gray-500/10'}` 
                        : `${isDarkMode ? 'group-hover:bg-slate-700/40' : 'group-hover:bg-gray-100/80'} opacity-0 group-hover:opacity-100`
                      }`} />
                      
                      {/* Glow effect for active items */}
                      {isActive(item.href) && (
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.gradient} opacity-5 blur-md`} />
                      )}
                      
                      {/* Enhanced Icon container with better styling */}
                      <motion.div 
                        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${isActive(item.href)
                          ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg backdrop-blur-sm` 
                          : `${isDarkMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-gray-500 group-hover:text-gray-700'} ${isDarkMode ? 'group-hover:bg-slate-600/30' : 'group-hover:bg-white/60'}`
                        }`}
                        whileHover={{ scale: isActive(item.href) ? 1.05 : 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.icon}
                      </motion.div>
                      
                      <motion.div 
                        initial={false}
                        animate={{ 
                          opacity: isCollapsed ? 0 : 1,
                          width: isCollapsed ? 0 : "auto",
                          marginLeft: isCollapsed ? 0 : "0.875rem"
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {!isCollapsed && (
                          <span className={`text-sm font-medium relative z-10 transition-colors duration-300 ${isActive(item.href) 
                            ? `${isDarkMode ? 'text-white' : 'text-slate-700'}` 
                            : `${isDarkMode ? 'text-slate-300 group-hover:text-slate-100' : 'text-gray-600 group-hover:text-gray-800'}`
                          }`}>
                            {item.label}
                          </span>
                        )}
                      </motion.div>
                      
                      {/* Enhanced Active indicator with animation */}
                      {isActive(item.href) && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`ml-auto mr-1 relative z-10 ${isCollapsed ? 'absolute right-2 top-2' : ''}`}
                        >
                          <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                        </motion.div>
                      )}
                      
                      {/* Hover indicator for non-active items */}
                      {!isActive(item.href) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          className={`ml-auto mr-1 relative z-10 ${isCollapsed ? 'absolute right-2 top-2' : ''}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-gray-400'} opacity-60`} />
                        </motion.div>
                      )}
                    </FastLink>
                  </motion.div>
                ))}
              </nav>
            </div>
            
            {/* Enhanced Settings Section with modern design */}
            <div className={`border-t backdrop-blur-xl ${
              isDarkMode 
                ? 'border-slate-700/30 bg-gradient-to-b from-slate-800/60 via-slate-900/80 to-slate-900/95' 
                : 'border-gray-200/40 bg-gradient-to-b from-gray-50/60 via-white/80 to-white/95'
            }`}>
              <div className="py-4 px-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <FastLink
                    href="/settings"
                    prefetch={true}
                    scroll={false}
                    className={`group flex items-center py-3 px-4 rounded-2xl transition-all duration-300 relative ${isCollapsed ? "justify-center" : ""}`}
                    title={isCollapsed ? "Ayarlar" : undefined}
                  >
                    {/* Background effect with enhanced styling */}
                    <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${isActive("/settings") 
                      ? `bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 shadow-lg backdrop-blur-sm ${isDarkMode ? 'shadow-black/10' : 'shadow-blue-500/10'}` 
                      : `${isDarkMode ? 'group-hover:bg-slate-700/40' : 'group-hover:bg-gray-100/80'} opacity-0 group-hover:opacity-100`
                    }`} />
                    
                    {/* Glow effect for active state */}
                    {isActive("/settings") && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-5 blur-md" />
                    )}
                    
                    {/* Enhanced icon with better styling */}
                    <motion.div 
                      className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${isActive("/settings")
                        ? `bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg backdrop-blur-sm` 
                        : `${isDarkMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-gray-500 group-hover:text-gray-700'} ${isDarkMode ? 'group-hover:bg-slate-600/30' : 'group-hover:bg-white/60'}`
                      }`}
                      whileHover={{ scale: isActive("/settings") ? 1.05 : 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <FiSettings size={18} />
                    </motion.div>
                    
                    <motion.div 
                      initial={false}
                      animate={{ 
                        opacity: isCollapsed ? 0 : 1,
                        width: isCollapsed ? 0 : "auto",
                        marginLeft: isCollapsed ? 0 : "0.875rem"
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {!isCollapsed && (
                        <span className={`text-sm font-medium relative z-10 transition-colors duration-300 ${isActive("/settings") 
                          ? `${isDarkMode ? 'text-white' : 'text-slate-700'}` 
                          : `${isDarkMode ? 'text-slate-300 group-hover:text-slate-100' : 'text-gray-600 group-hover:text-gray-800'}`
                        }`}>
                          Ayarlar
                        </span>
                      )}
                    </motion.div>
                    
                    {/* Enhanced Active indicator */}
                    {isActive("/settings") && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`ml-auto mr-1 relative z-10 ${isCollapsed ? 'absolute right-2 top-2' : ''}`}
                      >
                        <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                      </motion.div>
                    )}
                    
                    {/* Hover indicator for non-active state */}
                    {!isActive("/settings") && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className={`ml-auto mr-1 relative z-10 ${isCollapsed ? 'absolute right-2 top-2' : ''}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-slate-400' : 'bg-gray-400'} opacity-60`} />
                      </motion.div>
                    )}
                  </FastLink>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Bottom decorative element */}
      <div className={`h-2 w-full ${isDarkMode ? 'bg-gradient-to-r from-gray-900 via-blue-900/20 to-gray-900' : 'bg-gradient-to-r from-white via-blue-100/20 to-white'}`}></div>
    </motion.div>
  );
}
