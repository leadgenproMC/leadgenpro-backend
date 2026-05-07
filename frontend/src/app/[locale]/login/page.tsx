"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { getString } from "@/lib/i18n";

export default function LoginPage() {
  const params = useParams<{ locale: string }>();
  const pathname = usePathname();
  const locale = params?.locale || "es";
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    return newPath || `/${newLocale}`;
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        if (rememberMe) {
          localStorage.setItem("leadgenpro_token", data.token);
          localStorage.setItem("leadgenpro_user", JSON.stringify(data.user));
        } else {
          sessionStorage.setItem("leadgenpro_token", data.token);
          sessionStorage.setItem("leadgenpro_user", JSON.stringify(data.user));
        }
        setMessage({ type: "success", text: `¡Bienvenido ${data.user.name}! Redirigiendo...` });
        setTimeout(() => { window.location.href = `/${locale}/dashboard`; }, 1000);
      } else if (data.error === "EMAIL_NOT_CONFIRMED") {
        // Email no verificado - redirigir a verificación
        localStorage.setItem("leadgenpro_pending_email", email);
        setMessage({ type: "error", text: "Debes verificar tu email primero. Redirigiendo..." });
        setTimeout(() => { window.location.href = `/${locale}/verify-otp`; }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Error al iniciar sesión" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión con el servidor" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!agreedToTerms) {
      setMessage({ type: "error", text: "Debes aceptar las Condiciones de Uso para crear la cuenta" });
      return;
    }
    setIsLoading(true);
    try {
      console.log("[Register] Enviando petición a:", `${API_URL}/auth/register`);
      console.log("[Register] Datos:", { email, password: "***", name, company, agreed_to_terms: agreedToTerms });
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, company, agreed_to_terms: agreedToTerms }),
      });
      
      console.log("[Register] Status response:", response.status);
      
      const data = await response.json();
      console.log("[Register] Data recibida:", data);
      console.log("[Register] data.success:", data.success);
      console.log("[Register] data.error:", data.error);
      
      if (data.success) {
        if (data.token) {
          // Login directo (usuario ya verificado)
          localStorage.setItem("leadgenpro_token", data.token);
          localStorage.setItem("leadgenpro_user", JSON.stringify(data.user));
          setMessage({ type: "success", text: "¡Cuenta creada exitosamente! Redirigiendo..." });
          setTimeout(() => { window.location.href = `/${locale}/dashboard`; }, 1500);
        } else if (data.otp_code) {
          // Mostrar código OTP y redirigir a verificación
          console.log("[REGISTRO] Código OTP recibido:", data.otp_code);
          localStorage.setItem("leadgenpro_pending_email", email);
          setMessage({ 
            type: "success", 
            text: `¡Cuenta creada! Tu código de verificación es: ${data.otp_code}. Redirigiendo...` 
          });
          setTimeout(() => { window.location.href = `/${locale}/verify-otp`; }, 3000);
        } else {
          setMessage({ type: "error", text: "Error: No se recibió código de verificación" });
        }
      } else {
        console.error("[Register] Error del backend:", data.error);
        setMessage({ type: "error", text: data.error || "Error al crear la cuenta" });
      }
    } catch (error) {
      console.error("[Register] Error de conexión:", error);
      setMessage({ type: "error", text: "Error de conexión con el servidor" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Dark Blue Background */}
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 lg:flex">
        <div>
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <svg className="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold text-white">
              Lead<span className="text-emerald-400">Gen</span>Pro
            </span>
          </Link>

          {/* Hero Text */}
          <div className="mt-16">
            <h1 className="text-5xl font-bold leading-tight text-white">
              {getString(locale, "login.hero.title")}
            </h1>
            <p className="mt-6 text-lg text-slate-400">
              {getString(locale, "login.hero.subtitle")}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="rounded-xl bg-slate-800/50 p-6">
            <div className="text-3xl font-bold text-emerald-400">45k+</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">
              {getString(locale, "login.stats.leads")}
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-6">
            <div className="text-3xl font-bold text-white">98.2%</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">
              {getString(locale, "login.stats.rate")}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full flex-col justify-center bg-gray-50 p-8 lg:w-1/2 lg:p-16">
        <div className="mx-auto w-full max-w-md">
          {/* Language Selector - Top Right */}
          <div className="flex justify-end mb-4">
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
                <div className="absolute right-0 mt-2 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
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

          {/* Header */}
          <h2 className="text-3xl font-bold text-gray-900">{getString(locale, "login.form.title")}</h2>
          <p className="mt-2 text-gray-600">
            {getString(locale, "login.form.subtitle")}
          </p>

          {/* Tabs */}
          <div className="mt-8 flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("login")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {getString(locale, "login.tab.login")}
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`ml-8 pb-3 text-sm font-medium transition-colors ${
                activeTab === "register"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {getString(locale, "login.tab.register")}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 rounded-lg p-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={activeTab === "login" ? handleLogin : handleRegister} className="mt-8 space-y-6">
            {/* Name field - solo registro */}
            {activeTab === "register" && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  {getString(locale, "login.name.label")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={getString(locale, "login.name.placeholder")}
                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required={activeTab === "register"}
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                {getString(locale, "login.email.label")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={getString(locale, "login.email.placeholder")}
                  className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  {getString(locale, "login.password.label")}
                </label>
                {activeTab === "login" && (
                  <Link href={`/${locale}/forgot-password`} className="text-xs text-blue-600 hover:text-blue-700">
                    {getString(locale, "login.password.forgot")}
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={getString(locale, "login.password.placeholder")}
                  className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-12 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator - solo en registro */}
            {activeTab === "register" && password.length > 0 && (
              <div className="-mt-2">
                <div className="flex h-2 w-full gap-1">
                  {(() => {
                    // Calcular fuerza de contraseña
                    let strength = 0;
                    if (password.length >= 8) strength++;
                    if (/[A-Z]/.test(password)) strength++;
                    if (/[0-9]/.test(password)) strength++;
                    if (/[^A-Za-z0-9]/.test(password)) strength++;
                    
                    const getColor = (index: number) => {
                      if (index >= strength) return "bg-gray-200";
                      if (strength <= 1) return "bg-red-500";
                      if (strength === 2) return "bg-yellow-500";
                      if (strength === 3) return "bg-blue-500";
                      return "bg-green-500";
                    };
                    
                    const getLabel = () => {
                      if (strength <= 1) return locale === "es" ? "Débil" : "Weak";
                      if (strength === 2) return locale === "es" ? "Media" : "Medium";
                      if (strength === 3) return locale === "es" ? "Buena" : "Good";
                      return locale === "es" ? "Fuerte" : "Strong";
                    };
                    
                    const getTextColor = () => {
                      if (strength <= 1) return "text-red-500";
                      if (strength === 2) return "text-yellow-600";
                      if (strength === 3) return "text-blue-600";
                      return "text-green-600";
                    };
                    
                    return (
                      <>
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${getColor(i)}`}
                          />
                        ))}
                      </>
                    );
                  })()}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {locale === "es" ? "Seguridad:" : "Security:"}
                  </span>
                  {(() => {
                    let strength = 0;
                    if (password.length >= 8) strength++;
                    if (/[A-Z]/.test(password)) strength++;
                    if (/[0-9]/.test(password)) strength++;
                    if (/[^A-Za-z0-9]/.test(password)) strength++;
                    
                    const getLabel = () => {
                      if (strength <= 1) return locale === "es" ? "Débil" : "Weak";
                      if (strength === 2) return locale === "es" ? "Media" : "Medium";
                      if (strength === 3) return locale === "es" ? "Buena" : "Good";
                      return locale === "es" ? "Fuerte" : "Strong";
                    };
                    
                    const getColor = () => {
                      if (strength <= 1) return "text-red-500";
                      if (strength === 2) return "text-yellow-600";
                      if (strength === 3) return "text-blue-600";
                      return "text-green-600";
                    };
                    
                    return (
                      <span className={`font-medium ${getColor()}`}>
                        {getLabel()}
                      </span>
                    );
                  })()}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {locale === "es" 
                    ? "Mínimo 8 caracteres, mayúsculas, números y símbolos" 
                    : "Min 8 chars, uppercase, numbers & symbols"}
                </p>
              </div>
            )}

            {/* Company field - solo registro */}
            {activeTab === "register" && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  {getString(locale, "login.company.label")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={getString(locale, "login.company.placeholder")}
                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Divider */}
            {/* Social Login - SOLO en Login, no en Registro */}
            {activeTab === "login" && (
              <>
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    {getString(locale, "login.divider")}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {getString(locale, "login.social.google")}
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#00A4EF">
                      <path d="M11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4zM11.4 24H0V12.6h11.4V24zm12.6 0H12.6V12.6H24V24z"/>
                    </svg>
                    {getString(locale, "login.social.microsoft")}
                  </button>
                </div>
              </>
            )}

            {/* Remember Me - DEBAJO de Social Login */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                {getString(locale, "login.remember")}
              </label>
            </div>

            {/* Agreed to Terms - ENCIMA del botón, solo registro */}
            {activeTab === "register" && (
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreed-terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <label htmlFor="agreed-terms" className="ml-2 text-sm text-gray-700">
                  {getString(locale, "login.terms.agree")}{" "}
                  <Link href="#" className="text-blue-600 underline hover:text-blue-700">
                    {getString(locale, "login.terms.service")}
                  </Link>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-4 text-base font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>{activeTab === "login" ? "Accediendo..." : "Creando cuenta..."}</span>
              ) : (
                <>
                  {activeTab === "login" ? getString(locale, "login.submit") : getString(locale, "login.submit.register")}
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Terms text below form */}
          <p className="mt-8 text-center text-xs text-gray-500">
            {getString(locale, "login.terms")}{" "}
            <Link href="#" className="text-gray-700 underline hover:text-gray-900">
              {getString(locale, "login.terms.service")}
            </Link>{" "}
            {getString(locale, "login.terms.and")}{" "}
            <Link href="#" className="text-gray-700 underline hover:text-gray-900">
              {getString(locale, "login.terms.privacy")}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
