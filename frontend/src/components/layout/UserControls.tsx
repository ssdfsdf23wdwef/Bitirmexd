"use client";

import { useAuthStore } from "@/store/auth.store";
import { useAuth as useAuthHook } from "@/hooks/auth/useAuth";
import { useTheme } from "@/context/ThemeProvider";
import { useState, useRef, useEffect } from "react";
import { FiUser, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import { Button } from "@nextui-org/react";

export default function UserControls() {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuthHook();
  const { isDarkMode, toggleTheme } = useTheme();
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
    <div className="flex items-center gap-4">
      {/* Profil butonu */}
      {isAuthenticated ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border-2 border-white/30 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl hover:scale-105"
            aria-label="Profil menüsünü aç"
          >
            <span className="text-sm font-bold text-white drop-shadow-md">
              {getInitials()}
            </span>
          </button>

          {isDropdownOpen && (
            <div 
              className={`absolute right-0 mt-2 w-64 rounded-xl backdrop-blur-md border shadow-2xl z-50 overflow-hidden transform transition-all duration-200 origin-top-right ${
                isDarkMode 
                  ? 'bg-gray-800/95 border-gray-700/50' 
                  : 'bg-white/95 border-gray-200/50'
              }`}
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <div className={`px-4 py-3 bg-gradient-to-r from-blue-500/10 to-transparent border-b transition-colors duration-300 ${
                isDarkMode ? 'border-gray-700/50' : 'border-gray-100/50'
              }`}>
                <p className={`text-sm font-semibold truncate transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  {displayName}
                </p>
                {user?.email && (
                  <p className={`text-xs truncate transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {user.email}
                  </p>
                )}
              </div>
              <nav className="py-1">
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm cursor-pointer transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-gray-200 hover:bg-gray-700/50' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {isDarkMode ? (
                    <FiSun className={`mr-3 transition-colors duration-300 ${
                      isDarkMode ? 'text-yellow-400' : 'text-yellow-500'
                    }`} />
                  ) : (
                    <FiMoon className={`mr-3 transition-colors duration-300 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                  )}
                  {isDarkMode ? 'Açık Tema' : 'Koyu Tema'}
                </button>
                <div className={`border-t mx-4 transition-colors duration-300 ${
                  isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                }`}></div>
                <a
                  href="/profile"
                  className={`flex items-center px-4 py-3 text-sm cursor-pointer transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-gray-200 hover:bg-gray-700/50' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiUser className={`mr-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                  Profil
                </a>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center px-4 py-3 text-sm cursor-pointer transition-colors duration-300 ${
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
      ) : (
        <a
          href="/auth/login"
          className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Giriş Yap
        </a>
      )}
    </div>
  );
}
