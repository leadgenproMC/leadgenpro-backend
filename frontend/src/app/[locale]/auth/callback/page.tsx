"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "es";
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  const getString = (locale: string, key: string): string => {
    const strings: Record<string, Record<string, string>> = {
      es: {
        "callback.verifying": "Verificando tu cuenta...",
        "callback.success": "¡Cuenta verificada correctamente!",
        "callback.error": "Error al verificar la cuenta",
        "callback.expired": "El enlace ha expirado o es inválido",
        "callback.redirecting": "Redirigiendo...",
        "callback.login": "Iniciar sesión",
        "callback.dashboard": "Ir al Dashboard",
        "callback.error.message": "Por favor, intenta registrarte de nuevo o contacta soporte.",
      },
      en: {
        "callback.verifying": "Verifying your account...",
        "callback.success": "Account verified successfully!",
        "callback.error": "Error verifying account",
        "callback.expired": "The link has expired or is invalid",
        "callback.redirecting": "Redirecting...",
        "callback.login": "Sign in",
        "callback.dashboard": "Go to Dashboard",
        "callback.error.message": "Please try registering again or contact support.",
      },
    };
    return strings[locale]?.[key] || key;
  };

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Supabase envía los tokens en el hash de la URL (#access_token=...)
        const hash = window.location.hash;
        const queryString = window.location.search;
        
        console.log("Hash:", hash);
        console.log("Query:", queryString);
        
        // Extraer tokens del hash si existen
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");
        
        // Extraer code del query si existe (PKCE flow)
        const queryParams = new URLSearchParams(queryString);
        const code = queryParams.get("code");
        
        // Si hay access_token o code, la confirmación fue exitosa
        if (accessToken || code) {
          setStatus("success");
          setMessage(getString(locale, "callback.success"));
          
          setTimeout(() => {
            window.location.href = `/${locale}/login`;
          }, 2000);
        } else {
          setStatus("error");
          setMessage(getString(locale, "callback.expired"));
        }
        
      } catch (error) {
        console.error("Error en callback:", error);
        setStatus("error");
        setMessage(getString(locale, "callback.error"));
      }
    };

    processCallback();
  }, [locale]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        {/* Icono según estado */}
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
          status === "loading" ? "bg-blue-100" : 
          status === "success" ? "bg-green-100" : "bg-red-100"
        }`}>
          {status === "loading" && (
            <svg className="h-10 w-10 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {status === "success" && (
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === "error" && (
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Título */}
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {status === "loading" && getString(locale, "callback.verifying")}
          {status === "success" && getString(locale, "callback.success")}
          {status === "error" && getString(locale, "callback.error")}
        </h1>

        {/* Mensaje */}
        <p className="mb-6 text-gray-600">
          {message || getString(locale, "callback.redirecting")}
        </p>

        {/* Botones según estado */}
        {status === "success" && (
          <Link
            href={`/${locale}/login`}
            className="block w-full rounded-full bg-blue-600 py-3 font-medium text-white transition-all hover:bg-blue-700"
          >
            {getString(locale, "callback.login")}
          </Link>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              {getString(locale, "callback.error.message")}
            </p>
            <Link
              href={`/${locale}/login`}
              className="block w-full rounded-full bg-blue-600 py-3 font-medium text-white transition-all hover:bg-blue-700"
            >
              {getString(locale, "callback.login")}
            </Link>
          </div>
        )}

        {/* Logo */}
        <div className="mt-12">
          <Link href={`/${locale}`} className="flex items-center justify-center gap-2">
            <svg className="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-lg font-bold text-gray-900">
              Lead<span className="text-emerald-400">Gen</span>Pro
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
