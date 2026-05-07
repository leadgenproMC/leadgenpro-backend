"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { getString } from "@/lib/i18n";

const navLinks = [
  { href: "#features", key: "nav.features" },
  { href: "#pricing", key: "nav.pricing" },
  { href: "#cases", key: "nav.cases" },
  { href: "#api", key: "nav.api" },
];

export default function Header() {
  const params = useParams<{ locale: string }>();
  const pathname = usePathname();
  const locale = params?.locale || "en";
  const [langOpen, setLangOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    return newPath || `/${newLocale}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">
            Lead<span className="text-blue-600">Gen</span>Pro
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {getString(locale, link.key)}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons + Language Selector */}
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/login`}
            className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:block"
          >
            {getString(locale, "nav.login")}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
          >
            {getString(locale, "nav.getStarted")}
          </Link>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 rounded-lg p-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Select language"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="uppercase">{locale}</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                <Link
                  href={switchLocale("en")}
                  className={`block px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                    locale === "en" ? "font-medium text-blue-600" : "text-gray-700"
                  }`}
                  onClick={() => setLangOpen(false)}
                >
                  🇺🇸 English
                </Link>
                <Link
                  href={switchLocale("es")}
                  className={`block px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                    locale === "es" ? "font-medium text-blue-600" : "text-gray-700"
                  }`}
                  onClick={() => setLangOpen(false)}
                >
                  🇪🇸 Español
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
