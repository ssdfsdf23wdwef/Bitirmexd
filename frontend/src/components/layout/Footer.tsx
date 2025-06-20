import React from "react";
import Link from "next/link";
import { FiGithub, FiMail, FiHelpCircle } from "react-icons/fi";

export interface FooterProps {
  /** Telif hakkı yılı */
  copyrightYear?: number;
  /** Proje veya şirket ismi */
  companyName?: string;
}

/**
 * Tüm sayfalarda kullanılan alt bilgi bileşeni
 */
export const Footer: React.FC<FooterProps> = ({
  copyrightYear = new Date().getFullYear(),
  companyName = "EduAI",
}) => {
  const footerLinks = [
    { href: "/about", label: "Hakkımızda" },
    { href: "/privacy", label: "Gizlilik Politikası" },
    { href: "/terms", label: "Kullanım Koşulları" },
    { href: "/help", label: "Yardım" },
  ];

  const socialLinks = [
    {
      href: "https://github.com/yourusername/eduai",
      label: "GitHub",
      icon: <FiGithub />,
    },
    { href: "mailto:contact@example.com", label: "E-posta", icon: <FiMail /> },
    { href: "/support", label: "Destek", icon: <FiHelpCircle /> },
  ];

  return (
    <footer className="bg-elevated border-t border-primary mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sol kısım - Logo ve Açıklama */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-xl font-bold text-brand-primary">
                {companyName}
              </span>
            </div>
            <p className="text-sm text-secondary max-w-md">
              Kişiselleştirilmiş öğrenme deneyimi sunan yapay zeka destekli
              eğitim platformu. Hedeflerinize ulaşmanıza yardımcı oluyoruz.
            </p>
          </div>

          {/* Orta kısım - Hızlı Linkler */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-4">
              Hızlı Linkler
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary hover:text-brand-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sağ kısım - Sosyal Medya ve İletişim */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-4">
              Bize Ulaşın
            </h3>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary hover:text-brand-primary flex items-center space-x-2 transition-colors"
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    <span className="text-brand-accent">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Alt kısım - Telif hakkı */}
        <div className="border-t border-primary mt-8 pt-6 text-center">
          <p className="text-xs text-tertiary">
            &copy; {copyrightYear} {companyName}. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
