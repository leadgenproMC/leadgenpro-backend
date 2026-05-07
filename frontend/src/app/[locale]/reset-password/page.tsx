"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

export default function ResetPasswordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "es";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) setToken(t);
  }, [searchParams]);

  const getString = (locale: string, key: string): string => {
    const strings: Record<string, Record<string, string>> = {
      es: {
        "reset.title": "Restablecer contraseña",
        "reset.subtitle": "Introduce tu nueva contraseña",
        "reset.password.label": "Nueva contraseña",
        "reset.password.placeholder": "••••••••",
        "reset.confirm.label": "Confirmar contraseña",
        "reset.confirm.placeholder": "••••••••",
        "reset.submit": "Cambiar contraseña",
        "reset.changing": "Cambiando...",
        "reset.success": "¡Contraseña cambiada correctamente! Redirigiendo al login...",
        "reset.error": "Error al cambiar la contraseña",
        "reset.samePassword": "No puedes usar la misma contraseña anterior",
        "reset.passwordMismatch": "Las contraseñas no coinciden",
        "reset.invalidToken": "Token inválido o expirado",
        "reset.back": "Volver al inicio de sesión",
        "reset.requirements": "La contraseña debe tener al menos 6 caracteres",
      },
      en: {
        "reset.title": "Reset password",
        "reset.subtitle": "Enter your new password",
        "reset.password.label": "New password",
        "reset.password.placeholder": "••••••••",
        "reset.confirm.label": "Confirm password",
        "reset.confirm.placeholder": "••••••••",
        "reset.submit": "Change password",
        "reset.changing": "Changing...",
        "reset.success": "Password changed successfully! Redirecting to login...",
        "reset.error": "Error changing password",
        "reset.samePassword": "You cannot use the same password as before",
        "reset.passwordMismatch": "Passwords do not match",
        "reset.invalidToken": "Invalid or expired token",
        "reset.back": "Back to login",
        "reset.requirements": "Password must be at least 6 characters",
      },
    };
    return strings[locale]?.[key] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validaciones
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: getString(locale, "reset.passwordMismatch") });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: getString(locale, "reset.requirements") });
      return;
    }

    if (!token) {
      setMessage({ type: "error", text: getString(locale, "reset.invalidToken") });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: getString(locale, "reset.success") });
        setTimeout(() => {
          window.location.href = `/${locale}/login`;
        }, 2000);
      } else {
        const errorMsg = data.error === "SAME_PASSWORD" 
          ? getString(locale, "reset.samePassword")
          : data.error || getString(locale, "reset.error");
        setMessage({ type: "error", text: errorMsg });
      }
    } catch (error) {
      setMessage({ type: "error", text: getString(locale, "reset.error") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2">
            <svg className="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold text-gray-900">
              Lead<span className="text-emerald-400">Gen</span>Pro
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {getString(locale, "reset.title")}
          </h1>
          <p className="mb-6 text-gray-600">
            {getString(locale, "reset.subtitle")}
          </p>

          {/* Message */}
          {message && (
            <div className={`mb-4 rounded-lg p-4 text-sm ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {getString(locale, "reset.password.label")}
              </label>
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
                  placeholder={getString(locale, "reset.password.placeholder")}
                  className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-12 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                  minLength={6}
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

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {getString(locale, "reset.confirm.label")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={getString(locale, "reset.confirm.placeholder")}
                  className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <span>{getString(locale, "reset.changing")}</span>
              ) : (
                <>
                  {getString(locale, "reset.submit")}
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link 
              href={`/${locale}/login`}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {getString(locale, "reset.back")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
