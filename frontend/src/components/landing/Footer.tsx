"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getString } from "@/lib/i18n";

export default function Footer() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "es";

  const footerLinks = [
    { href: "#terms", key: "footer.terms" },
    { href: "#privacy", key: "footer.privacy" },
    { href: "#cookies", key: "footer.cookies" },
    { href: "#security", key: "footer.security" },
    { href: "#status", key: "footer.status" },
  ];

  return (
    <footer className="border-t border-gray-100 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              LeadGenPro
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                {getString(locale, link.key)}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {getString(locale, "footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
