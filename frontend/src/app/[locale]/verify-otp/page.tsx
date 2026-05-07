"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

export default function VerifyOtpPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "es";
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const translations = {
    es: {
      title: "Verifica tu email",
      subtitle: "Ingresa el código de 6 dígitos que recibiste",
      emailLabel: "Email",
      codeLabel: "Código de verificación",
      verifyButton: "Verificar",
      resendButton: "Reenviar código",
      resending: "Enviando...",
      verifying: "Verificando...",
      success: "¡Email verificado correctamente!",
      error: "Código inválido o expirado",
      goToLogin: "Ir a iniciar sesión",
      codeResent: "Nuevo código enviado",
      emailNotFound: "No se encontró email. Regístrate primero."
    },
    en: {
      title: "Verify your email",
      subtitle: "Enter the 6-digit code you received",
      emailLabel: "Email",
      codeLabel: "Verification code",
      verifyButton: "Verify",
      resendButton: "Resend code",
      resending: "Sending...",
      verifying: "Verifying...",
      success: "Email verified successfully!",
      error: "Invalid or expired code",
      goToLogin: "Go to login",
      codeResent: "New code sent",
      emailNotFound: "Email not found. Please register first."
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.es;

  useEffect(() => {
    // Recuperar email del localStorage
    const pendingEmail = localStorage.getItem("leadgenpro_pending_email");
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      setStatus("error");
      setMessage(t.emailNotFound);
    }
  }, [t.emailNotFound]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !code) {
      setStatus("error");
      setMessage("Email y código son requeridos");
      return;
    }

    setStatus("loading");
    
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        localStorage.removeItem("leadgenpro_pending_email");
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.message || t.error);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Error de conexión. Intenta de nuevo.");
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    setResendLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(t.codeResent);
        // Mostrar código en consola para debugging
        if (data.debug_code) {
          console.log("[DEBUG] Nuevo código OTP:", data.debug_code);
        }
      } else {
        setMessage(data.message || "Error al reenviar código");
      }
    } catch (error) {
      setMessage("Error de conexión");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 shadow-xl">
        {status === "success" ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t.success}</h1>
            <p className="text-slate-400">{message}</p>
            <Link
              href={`/${locale}/login`}
              className="mt-6 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {t.goToLogin}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-2 text-center">{t.title}</h1>
            <p className="text-slate-400 text-center mb-6">{t.subtitle}</p>
            
            {status === "error" && message && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {message}
              </div>
            )}
            
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                  readOnly={!!localStorage.getItem("leadgenpro_pending_email")}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t.codeLabel}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={status === "loading" || code.length !== 6}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {status === "loading" ? t.verifying : t.verifyButton}
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full py-2 px-4 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                {resendLoading ? t.resending : t.resendButton}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
