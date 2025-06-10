"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthUser, useAuthIsAuthenticated, useAuthIsLoading } from "@/store/auth.store";
import { useTheme } from "@/context/ThemeProvider";
import { getLogger, getFlowTracker, trackFlow } from "@/lib/logger.utils";
import { FlowCategory } from "@/constants/logging.constants";
import { motion } from "framer-motion";

// Logger ve flowTracker nesnelerini elde et
const logger = getLogger();
const flowTracker = getFlowTracker();

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[]; // Erişim için gerekli roller
  redirectUrl?: string; // Yetki yoksa yönlendirilecek sayfa
  loadingComponent?: ReactNode; // Yükleme durumunda gösterilecek bileşen
}

/**
 * Sadece oturumu açık kullanıcıların erişebileceği sayfalar için koruma sağlar
 * Roller, yönlendirme ve yükleme durumu konfigüre edilebilir
 */
export default function ProtectedRoute({
  children,
  requiredRoles = [],
  redirectUrl = "/auth/login",
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { checkSession } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Zustand selektörleri
  const user = useAuthUser();
  const isAuthenticated = useAuthIsAuthenticated();
  const isLoading = useAuthIsLoading();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  // Kullanıcı durumunu izle
  useEffect(() => {
    const verifyAuth = async () => {
      const authVerifyId = flowTracker.startSequence('AuthVerification');
      
      logger.debug(
        `Korumalı sayfa erişimi kontrol ediliyor: ${pathname}`,
        'ProtectedRoute.verifyAuth',
        'ProtectedRoute.tsx',
        40
      );
      
      // İlk render'da isLoading true olduğundan bekle
      if (isLoading) {
        logger.debug(
          'Kullanıcı durumu yükleniyor',
          'ProtectedRoute.verifyAuth',
          'ProtectedRoute.tsx',
          47
        );
        return;
      }
      
      setIsVerifying(true);
      
      try {
        // 1. Zaten oturum açılmış mı kontrol et
        if (isAuthenticated && user) {
          logger.debug(
            `Kullanıcı zaten oturum açmış: ${user.email}`,
            'ProtectedRoute.verifyAuth',
            'ProtectedRoute.tsx',
            60,
            { userId: user.id }
          );
          
          // 2. Rol kontrolü yap (eğer requiredRoles belirtilmişse)
          if (requiredRoles.length > 0) {
            const hasRequiredRole = user.role && requiredRoles.includes(user.role);
            
            if (!hasRequiredRole) {
              logger.warn(
                `Yetkisiz erişim girişimi: ${pathname}`,
                'ProtectedRoute.verifyAuth',
                'ProtectedRoute.tsx',
                71,
                { 
                  userId: user.id, 
                  userRole: user.role, 
                  requiredRoles 
                }
              );
              
              trackFlow(
                'Rol yetkisi reddedildi', 
                'ProtectedRoute.verifyAuth',
                FlowCategory.Auth,
                { 
                  path: pathname,
                  requiredRoles, 
                  userRole: user.role 
                }
              );
              
              setHasAccess(false);
              flowTracker.endSequence(authVerifyId);
              
              // Ana sayfaya yönlendir
              router.push("/");
              return;
            }
            
            logger.debug(
              `Rol yetkisi onaylandı: ${user.role}`,
              'ProtectedRoute.verifyAuth',
              'ProtectedRoute.tsx',
              98,
              { 
                userId: user.id,
                requiredRoles 
              }
            );
          }
          
          // Erişime izin ver
          setHasAccess(true);
          flowTracker.endSequence(authVerifyId);
          return;
        }
        
        logger.debug(
          'Kullanıcı oturumu açık değil, kontrol yapılıyor',
          'ProtectedRoute.verifyAuth',
          'ProtectedRoute.tsx',
          113
        );
        
        // 3. Aktif oturum kontrolü yap
        const isSessionValid = await checkSession();
        
        if (isSessionValid) {
          logger.debug(
            'Oturum kontrolü başarılı, erişim onaylandı',
            'ProtectedRoute.verifyAuth',
            'ProtectedRoute.tsx',
            122
          );
          
          trackFlow(
            'Oturum kontrolü başarılı', 
            'ProtectedRoute.verifyAuth',
            FlowCategory.Auth
          );
          
          // Zustand store'u auth context tarafından zaten güncellendi
          setHasAccess(true);
        } else {
          logger.warn(
            `Oturumsuz erişim girişimi: ${pathname}`,
            'ProtectedRoute.verifyAuth',
            'ProtectedRoute.tsx',
            136
          );
          
          trackFlow(
            'Oturum kontrolü başarısız, yönlendiriliyor', 
            'ProtectedRoute.verifyAuth',
            FlowCategory.Auth,
            { redirectTo: redirectUrl }
          );
          
          // Giriş sayfasına yönlendir ve mevcut sayfayı kaydet
          router.push(`${redirectUrl}?returnUrl=${encodeURIComponent(pathname)}`);
          setHasAccess(false);
        }
      } catch (error) {
        logger.error(
          'Oturum kontrolü sırasında hata oluştu',
          'ProtectedRoute.verifyAuth',
          'ProtectedRoute.tsx',
          154,
          { error, pathname }
        );
        
        // Hata durumunda giriş sayfasına yönlendir
        router.push(redirectUrl);
        setHasAccess(false);
      } finally {
        setIsVerifying(false);
        flowTracker.endSequence(authVerifyId);
      }
    };

    verifyAuth();
  }, [
    isLoading, 
    isAuthenticated, 
    user, 
    pathname, 
    router, 
    checkSession, 
    redirectUrl, 
    requiredRoles
  ]);
  // Doğrulama durumunda yükleme ekranını göster
  if (isVerifying || isLoading) {
    // Özel yükleme bileşeni veya varsayılan
    return (
      <>
        {loadingComponent || (
          <div className={`flex items-center justify-center min-h-screen ${
            isDarkMode
              ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
              : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
          }`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Loading Spinner */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={`w-16 h-16 mx-auto mb-4 border-4 rounded-full ${
                  isDarkMode
                    ? 'border-slate-700 border-t-blue-500'
                    : 'border-gray-200 border-t-blue-600'
                }`}
              />
              
              {/* Loading Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-lg font-medium ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-600'
                }`}
              >
                Yetkilendiriliyor...
              </motion.p>
              
              {/* Animated dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-1 mt-2"
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                    className={`w-2 h-2 rounded-full ${
                      isDarkMode ? 'bg-blue-500' : 'bg-blue-600'
                    }`}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        )}
      </>
    );
  }

  // Erişimi varsa içeriği göster
  return hasAccess ? <>{children}</> : null;
}
