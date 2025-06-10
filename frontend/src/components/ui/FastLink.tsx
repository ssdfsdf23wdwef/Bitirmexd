"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, MouseEvent } from "react";

interface FastLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any;
}

/**
 * Optimize edilmiş Link bileşeni
 * - Hızlı navigasyon
 * - Prefetch optimizasyonu
 * - Hardware acceleration
 */
export default function FastLink({
  href,
  children,
  className = "",
  prefetch = true,
  replace = false,
  scroll = false,
  shallow = false,
  onClick,
  ...props
}: FastLinkProps) {
  const router = useRouter();
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    // External links için normal davranış
    if (href.startsWith("http") || href.startsWith("mailto:")) {
      return;
    }

    // Same page navigation check
    if (href === window.location.pathname) {
      e.preventDefault();
      return;
    }

    // INSTANT navigation için optimize edilmiş yönlendirme
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();

      // Immediate visual feedback
      const target = e.currentTarget;
      target.style.transform = "scale(0.98)";

      // Super fast navigation with minimal delay
      requestAnimationFrame(() => {
        if (replace) {
          router.replace(href, { scroll });
        } else {
          router.push(href, { scroll });
        }

        // Reset visual feedback
        setTimeout(() => {
          target.style.transform = "";
        }, 50);
      });
    }
  };

  return (
    <Link
      href={href}
      className={className}
      prefetch={prefetch}
      onClick={handleClick}
      style={{
        // Hardware acceleration
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
