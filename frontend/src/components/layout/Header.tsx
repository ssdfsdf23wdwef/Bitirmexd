"use client";

import React, { memo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiLogIn,
  FiUser,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/auth/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/context/ThemeProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  userName?: string;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

/**
 * Tüm sayfalarda kullanılan ana header bileşeni
 */
const HeaderComponent: React.FC<HeaderProps> = () => {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.email ||
      "Kullanıcı"
    : "Kullanıcı";

  const getInitials = () => {
    if (!user) return "K";
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (user.email) {
      return user.email[0].toUpperCase();
    } else {
      return "K";
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  // Dropdown dışına tıklandığında dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b transition-all duration-500 ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-700/30 shadow-2xl shadow-slate-900/20' 
          : 'bg-white/80 border-gray-200/30 shadow-2xl shadow-gray-900/10'
      }`}
    >
      {/* Gradient overlay for depth */}
      <div className={`absolute inset-0 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90' 
          : 'bg-gradient-to-r from-white/90 via-gray-50/80 to-white/90'
      }`} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 h-16 flex items-center justify-end relative">
          <div className="flex items-center space-x-4">
            {/* Enhanced Theme Toggle */}
            <div>
              <ThemeToggle size="sm" />
            </div>

            {/* User Authentication Section */}
            {isLoading ? (
              <div 
                className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full backdrop-blur-sm animate-pulse ${
                  isDarkMode ? 'bg-slate-700/60' : 'bg-gray-200/60'
                }`}
              />
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white text-base font-bold flex items-center justify-center shadow-lg border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                      isDarkMode 
                        ? 'border-slate-600/30 focus:ring-blue-500/50 focus:ring-offset-slate-900' 
                        : 'border-white/30 focus:ring-blue-500/50 focus:ring-offset-white'
                    }`}
                    style={{ 
                      boxShadow: isDarkMode 
                        ? '0 4px 20px rgba(59, 130, 246, 0.3)' 
                        : '0 4px 20px rgba(59, 130, 246, 0.2)' 
                    }}
                  >
                    {getInitials()}
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div
                      className={`absolute right-0 mt-3 w-64 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-dropdown border transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-slate-800/95 border-slate-700/50 shadow-black/20' 
                          : 'bg-white/95 border-gray-200/50 shadow-gray-900/10'
                      }`}
                      style={{
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)'
                      }}
                    >
                      <div className={`px-4 py-3 border-b transition-colors duration-300 ${
                        isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'
                      }`}>
                        <p className={`text-sm font-medium truncate transition-colors duration-300 ${
                          isDarkMode ? 'text-slate-100' : 'text-gray-800'
                        }`}>
                          {displayName}
                        </p>
                        {user?.email && (
                          <p className={`text-xs truncate transition-colors duration-300 ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>
                            {user.email}
                          </p>
                        )}
                      </div>
                      <nav className="py-1">
                        <Link href="/profile" prefetch={true}>
                          <div className={`flex items-center px-4 py-2.5 text-sm cursor-pointer transition-colors duration-300 ${
                            isDarkMode 
                              ? 'text-gray-200 hover:bg-slate-700/50' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            <FiUser className={`mr-3 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            Profil
                          </div>
                        </Link>
                        <Link href="/theme-settings" prefetch={true}>
                          <div className={`flex items-center px-4 py-2.5 text-sm cursor-pointer transition-colors duration-300 ${
                            isDarkMode 
                              ? 'text-gray-200 hover:bg-slate-700/50' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            <FiSettings className={`mr-3 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            Tema Ayarları
                          </div>
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className={`w-full flex items-center px-4 py-2.5 text-sm cursor-pointer transition-colors duration-300 ${
                            isDarkMode 
                              ? 'text-red-400 hover:bg-red-900/20' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <FiLogOut className={`mr-3 transition-colors duration-300 ${
                            isDarkMode ? 'text-red-400' : 'text-red-600'
                          }`} />
                          Çıkış Yap
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login" prefetch={true}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-interactive-hover focus:ring-brand-primary flex items-center px-4 py-2 rounded-full"
                  >
                    <FiLogIn className="mr-2 h-4 w-4" />
                    Giriş Yap
                  </Button>
                </Link>
              </div>
            )}
          </div>
      </div>
    </header>
  );
};

// Memo ile header bileşenini sarmak - gereksiz yeniden render'ları önler
export const Header = memo(function Header() {
  // Theme context'ten değerleri al
  const { isDarkMode, toggleTheme } = useTheme();
  
  return <HeaderComponent 
    isDarkMode={isDarkMode} 
    onToggleTheme={toggleTheme} 
  />;
});
