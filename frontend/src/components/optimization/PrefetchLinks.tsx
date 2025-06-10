"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PrefetchLinksProps {
  links: string[];
}

/**
 * Aggressive prefetching for instant navigation
 * Prefetches critical routes immediately
 */
export default function PrefetchLinks({ links }: PrefetchLinksProps) {
  const router = useRouter();

  useEffect(() => {
    // Immediately prefetch all critical routes
    const prefetchPromises = links.map((link) => {
      try {
        router.prefetch(link);
        return Promise.resolve();
      } catch (error) {
        console.warn(`Failed to prefetch ${link}:`, error);
        return Promise.resolve();
      }
    });

    // Wait for all prefetches to complete
    Promise.all(prefetchPromises).then(() => {
      console.log("All critical routes prefetched");
    });
  }, [router, links]);

  return null; // This component doesn't render anything
}

// Common routes to prefetch for instant navigation
export const CRITICAL_ROUTES = [
  "/",
  "/courses",
  "/exams",
  "/performance",
  "/learning-goals",
  "/auth/login",
];

// Secondary routes to prefetch after critical ones
export const SECONDARY_ROUTES = [
  "/courses/create",
  "/learning-goals/dashboard",
  "/settings",
];
