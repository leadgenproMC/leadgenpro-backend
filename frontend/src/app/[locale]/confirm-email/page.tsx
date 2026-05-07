"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

export default function ConfirmEmailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || "es";
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "resend">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  // Estado de diagnóstico visible
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(true);

  const addLog = (msg: string) => {
    setDiagnosticLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    console.log(msg);
  };

  const translations = {
    es: {
      loading: "Verificando tu email...",
      success: "¡Email confirmado correctamente!",
      error: "El enlace ha expirado o es inválido.",
      resend: "Reenviar email de confirmación",
      resendPlaceholder: "Tu email",
      resendButton: "Enviar",
      resendSuccess: "Email enviado. Revisa tu bandeja de entrada.",
      goLogin: "Ir a iniciar sesión",
      errorDefault: "Error al verificar el email"
    },
    en: {
      loading: "Verifying your email...",
      success: "Email confirmed successfully!",
      error: "The link has expired or is invalid.",
      resend: "Resend confirmation email",
      resendPlaceholder: "Your email",
      resendButton: "Send",
      resendSuccess: "Email sent. Check your inbox.",
      goLogin: "Go to login",
      errorDefault: "Error verifying email"
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.es;

  useEffect(() => {
    const pendingEmail = localStorage.getItem("leadgenpro_pending_email");
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
    
    addLog(`Página cargada. Token en URL: ${token ? 'SÍ' : 'NO'}`);
    
    if (token) {
      verifyToken();
    } else {
      setStatus("resend");
      addLog("No hay token - mostrando formulario de reenvío");
    }
  }, [token]);

  const verifyToken = async () => {
    addLog(`Token extraído: ${token?.substring(0, 20)}...`);
    
    if (!token) {
      addLog("ERROR: No hay token");
      setStatus("error");
      setMessage("No se encontró token en la URL");
      return;
    }
    
    try {
      addLog("Enviando petición al backend...");
      addLog(`URL: ${API_URL}/auth/verify-email`);
      
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      
      addLog(`Respuesta HTTP recibida: ${response.status}`);
      
      const responseText = await response.text();
      addLog(`Texto de respuesta: ${responseText.substring(0, 200)}`);
      
      let data;
      try {
        data = JSON.parse(responseText);
        addLog(`JSON parseado exitosamente`);
      } catch (e) {
        addLog(`ERROR parseando JSON: ${e}`);
        setStatus("error");
        setMessage("Error en respuesta del servidor");
        return;
      }
      
      addLog(`Respuesta del backend: success=${data.success}, message=${data.message}`);
      
      if (data.success) {
        addLog("✓ Verificación exitosa");
        setStatus("success");
        setMessage(data.message);
        localStorage.removeItem("leadgenpro_pending_email");
      } else {
        addLog(`✗ Error del backend: ${data.message}`);
        setStatus("error");
        setMessage(data.message || t.errorDefault);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`✗ ERROR DE CONEXIÓN: ${errorMsg}`);
      setStatus("error");
      setMessage(`${t.errorDefault} (Ver consola para detalles)`);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const response = await fetch(`${API_URL}/auth/send-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(t.resendSuccess);
        setEmail("");
      } else {
        setMessage(data.message || t.errorDefault);
      }
    } catch (error) {
      setMessage(t.errorDefault);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 backdrop-blur-lg">
        {status === "loading" && (
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-white">{t.loading}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">{t.success}</h2>
            <p className="mb-6 text-slate-300">{message}</p>
            <Link
              href={`/${locale}/login`}
              className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
            >
              {t.goLogin}
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">{t.error}</h2>
            <p className="mb-6 text-slate-300">{message}</p>
            
            <div className="rounded-lg bg-slate-800/50 p-4">
              <h3 className="mb-3 text-white">{t.resend}</h3>
              <form onSubmit={handleResend} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.resendPlaceholder}
                  className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                  {t.resendButton}
                </button>
              </form>
            </div>
            {message && message !== t.error && (
              <p className="mt-4 text-green-400">{message}</p>
            )}
          </div>
        )}

        {status === "resend" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20">
              <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-white">{t.resend}</h2>
            <form onSubmit={handleResend} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.resendPlaceholder}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 py-3 text-white hover:bg-indigo-700"
              >
                {t.resendButton}
              </button>
            </form>
            {message && (
              <p className={`mt-4 ${message.includes(t.errorDefault) ? "text-red-400" : "text-green-400"}`}>
                {message}
              </p>
            )}
          </div>
        )}
      </div>
      {/* Panel de diagnóstico */}
      {showDebug && (
        <div className="mt-6 w-full max-w-md rounded-lg border border-yellow-500/30 bg-slate-900/90 p-4 font-mono text-xs">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-bold text-yellow-400">Diagnóstico</h3>
            <button 
              onClick={() => setShowDebug(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {diagnosticLogs.map((log, i) => (
              <div key={i} className={`${
                log.includes('✗') ? 'text-red-400' : 
                log.includes('✓') ? 'text-green-400' : 
                'text-slate-300'
              }`}>
                {log}
              </div>
            ))}
          </div>
          {diagnosticLogs.length === 0 && (
            <div className="text-slate-500">Esperando...</div>
          )}
        </div>
      )}
      
      {!showDebug && (
        <button 
          onClick={() => setShowDebug(true)}
          className="mt-4 text-xs text-slate-500 hover:text-slate-300"
        >
          Mostrar diagnóstico
        </button>
      )}
    </div>
  );
}
