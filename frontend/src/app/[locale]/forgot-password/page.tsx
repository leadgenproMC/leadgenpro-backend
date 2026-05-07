"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "es";
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getString = (locale: string, key: string): string => {
    const strings: Record<string, Record<string, string>> = {
      es: {
        "forgot.title": "¿Olvidaste tu contraseña?",
        "forgot.subtitle": "Introduce tu email y te enviaremos un enlace para restablecerla",
        "forgot.email.label": "Email",
        "forgot.email.placeholder": "nombre@empresa.com",
        "forgot.submit": "Enviar enlace",
        "forgot.sending": "Enviando...",
        "forgot.success": "¡Revisa tu email! Hemos enviado un enlace para restablecer tu contraseña.",
        "forgot.error": "Error al enviar el email. Verifica que el email sea correcto.",
        "forgot.back": "Volver al inicio de sesión",
        "forgot.noAccount": "¿No tienes cuenta?",
        "forgot.register": "Crear cuenta",
      },
      en: {
        "forgot.title": "Forgot your password?",
        "forgot.subtitle": "Enter your email and we'll send you a link to reset it",
        "forgot.email.label": "Email",
        "forgot.email.placeholder": "name@company.com",
        "forgot.submit": "Send link",
        "forgot.sending": "Sending...",
        "forgot.success": "Check your email! We've sent you a link to reset your password.",
        "forgot.error": "Error sending email. Please verify the email is correct.",
        "forgot.back": "Back to login",
        "forgot.noAccount": "Don't have an account?",
        "forgot.register": "Create account",
      },
    };
    return strings[locale]?.[key] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: getString(locale, "forgot.success") });
        setEmail("");
      } else {
        setMessage({ type: "error", text: data.error || getString(locale, "forgot.error") });
      }
    } catch (error) {
      setMessage({ type: "error", text: getString(locale, "forgot.error") });
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
            {getString(locale, "forgot.title")}
          </h1>
          <p className="mb-6 text-gray-600">
            {getString(locale, "forgot.subtitle")}
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
                {getString(locale, "forgot.email.label")}
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
                  placeholder={getString(locale, "forgot.email.placeholder")}
                  className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <span>{getString(locale, "forgot.sending")}</span>
              ) : (
                <>
                  {getString(locale, "forgot.submit")}
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-3 text-center text-sm">
            <Link 
              href={`/${locale}/login`}
              className="block text-blue-600 hover:text-blue-700"
            >
              {getString(locale, "forgot.back")}
            </Link>
            <p className="text-gray-500">
              {getString(locale, "forgot.noAccount")}{" "}
              <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-700">
                {getString(locale, "forgot.register")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
