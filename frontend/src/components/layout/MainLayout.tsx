"use client";

import { ReactNode, memo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import UserControls from "./UserControls";
import { usePathname } from "next/navigation";
import PrefetchLinks, { CRITICAL_ROUTES, SECONDARY_ROUTES } from "@/components/optimization/PrefetchLinks";


const LoadingPlaceholder = () => (
  <div className="animate-pulse h-full">
    <div 
      className="h-full w-64 bg-gray-100 dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-60 border-r border-gray-200 dark:border-gray-800 rounded-r-md"
      style={{ transform: 'translateZ(0)' }}
    ></div> 
  </div>
);

const Sidebar = dynamic<SidebarProps>(
  () => import("@/components/layout/Sidebar"),
  { 
    loading: () => <LoadingPlaceholder />,
    ssr: false
  }
);

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayoutBase({ children }: MainLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Optimize mounting with immediate state update
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    if (isHomePage) {
      document.body.classList.add('no-scroll');
      return () => {
        document.body.classList.remove('no-scroll');
      };
    }
  }, [isHomePage]);

  // Early return with loading state - no spinner to improve perceived performance
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-primary text-primary flex">
        <div className="w-64 bg-elevated border-r border-primary"></div>
        <div className="flex-1">
          <div className="h-14 bg-elevated border-b border-primary"></div>
          <main className="p-6">{children}</main>
        </div>
      </div>
    );
  }

  const layoutStructure = (
   
      <div className="min-h-screen bg-primary text-primary transition-all duration-300 ease-in-out">
        {/* Aggressive prefetching for instant navigation */}
        <PrefetchLinks links={CRITICAL_ROUTES} />
        <PrefetchLinks links={SECONDARY_ROUTES} />
        
        <div className="flex w-full relative">
          {isMounted && (
            <div 
              className={`fixed top-0 left-0 h-full z-docked transition-all duration-300 ease-in-out ${
                isSidebarCollapsed ? 'w-16' : 'w-64'
              }`}
            >
              <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />
              
              {/* Toggle Sidebar Button - Positioned in top-right of sidebar */}
  
            </div>
          )}

          <main 
            className={`flex-1 w-full min-h-screen transition-all duration-300 ease-in-out ${
              isMounted ? (isSidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'
            }`}
            style={{
              paddingLeft: '1rem',
              paddingRight: '1rem',
              position: 'relative',
            }}
          >


            {/* User Controls - Only on Home Page */}
            {isHomePage && (
              <div className="fixed top-4 right-6 z-40">
                <UserControls />
              </div>
            )}
            <div className="max-w-7xl mx-auto w-full pt-2">
              {children}
            </div>
          </main>
        </div>
      </div>
    
  );

  return layoutStructure;
}


const MainLayout = memo(MainLayoutBase);
export default MainLayout;
