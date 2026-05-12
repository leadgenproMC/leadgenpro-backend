"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { getString } from "@/lib/i18n";

export default function VerifyEmailPage() {
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const locale = params?.locale || "es";
  const token = searchParams.get("token");
  const email = typeof window !== "undefined" ? localStorage.getItem("leadgenpro_pending_email") : null;
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    } else if (email) {
      setMessage("Por favor, revisa tu email y haz clic en el enlace de verificación.");
    } else {
      setMessage("No se encontró token de verificación. Por favor, solicita un nuevo enlace.");
    }
  }, [token, email]);

  const verifyEmailToken = async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationToken }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVerificationStatus("success");
        setMessage("¡Email verificado correctamente! Ya puedes iniciar sesión.");
        // Limpiar email pendiente
        localStorage.removeItem("leadgenpro_pending_email");
      } else {
        setVerificationStatus("error");
        setMessage(data.message || "Error verificando el email. El enlace puede haber expirado.");
      }
    } catch (error) {
      setVerificationStatus("error");
      setMessage("Error de conexión con el servidor");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage("No se encontró email para reenviar. Por favor, regístrate nuevamente.");
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage("¡Email de verificación reenviado! Revisa tu bandeja de entrada.");
      } else {
        setMessage(data.message || "Error reenviando el email");
      }
    } catch (error) {
      setMessage("Error de conexión con el servidor");
    } finally {
      setIsResending(false);
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
              Verifica tu Email
            </h1>
            <p className="mt-6 text-lg text-slate-400">
              Completa tu registro verificando tu dirección de email
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20">
              <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Seguridad Garantizada</h3>
              <p className="text-sm text-slate-400">Tu email está protegido</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20">
              <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Email Verificado</h3>
              <p className="text-sm text-slate-400">Acceso completo a todas las funciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Verification Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Logo Mobile */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <svg className="h-8 w-8 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xl font-bold text-slate-900">
                Lead<span className="text-emerald-600">Gen</span>Pro
              </span>
            </Link>
          </div>

          {/* Verification Content */}
          <div className="text-center">
            {/* Status Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              {isVerifying ? (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
              ) : verificationStatus === "success" ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-8 w-8 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : verificationStatus === "error" ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="mb-4 text-3xl font-bold text-slate-900">
              {verificationStatus === "success" ? "¡Email Verificado!" : 
               verificationStatus === "error" ? "Error de Verificación" : 
               "Verifica tu Email"}
            </h2>

            {/* Message */}
            <p className="mb-8 text-slate-600">{message}</p>

            {/* Actions */}
            <div className="space-y-4">
              {verificationStatus === "success" && (
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Iniciar Sesión
                </Link>
              )}

              {verificationStatus === "error" && email && (
                <div className="space-y-3">
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isResending ? "Enviando..." : "Reenviar Email"}
                  </button>
                  
                  <Link
                    href={`/${locale}/login`}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Volver al Login
                  </Link>
                </div>
              )}

              {verificationStatus === "pending" && email && (
                <div className="space-y-3">
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isResending ? "Enviando..." : "Reenviar Email"}
                  </button>
                  
                  <Link
                    href={`/${locale}/login`}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Volver al Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
