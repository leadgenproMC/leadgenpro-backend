"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { getString } from "@/lib/i18n";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatBot() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "es";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: locale === "es" 
        ? "¡Hola! Soy tu asesor de LeadGenPro. ¿En qué puedo ayudarte hoy?"
        : "Hello! I'm your LeadGenPro advisor. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generar user_id único
  const getUserId = () => {
    let userId = localStorage.getItem("chat_user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("chat_user_id", userId);
    }
    return userId;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Añadir mensaje del usuario
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ]);

    try {
      console.log("Sending message to:", "http://localhost:8000/chat/");
      console.log("Request body:", {
        user_id: getUserId(),
        session_id: "default",
        message: userMessage,
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004"}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: getUserId(),
          session_id: "default",
          message: userMessage,
          locale: locale,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      // Añadir respuesta del bot
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, timestamp: new Date() },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error type:", typeof error);
      console.error("Error string:", String(error));
      
      let errorMessage = locale === "es"
        ? "Lo siento, estoy teniendo problemas técnicos. ¿Podemos intentarlo de nuevo?"
        : "Sorry, I'm having technical issues. Can we try again?";
      
      if (error instanceof Error) {
        errorMessage += ` (${error.message})`;
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Botón flotante del chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "100px",
          right: "20px",
          zIndex: 9998,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 30px rgba(16, 185, 129, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.4)";
        }}
      >
        {isOpen ? (
          // Icono X para cerrar
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          // Icono de Bot estilo asistente
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="9" cy="11" r="1.5" fill="white" />
            <circle cx="15" cy="11" r="1.5" fill="white" />
            <path d="M9 15c1.5 1 3.5 1 5 0" strokeLinecap="round" />
            <path d="M12 3v3" />
            <circle cx="12" cy="2" r="1.5" fill="white" />
          </svg>
        )}
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "170px",
            right: "20px",
            zIndex: 9998,
            width: "360px",
            maxWidth: "calc(100vw - 40px)",
            height: "500px",
            maxHeight: "calc(100vh - 200px)",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </div>
            <div>
              <h3
                style={{
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                LeadGenPro Bot
              </h3>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                {locale === "es" ? "Asesor de ventas IA" : "AI Sales Advisor"}
              </p>
            </div>
          </div>

          {/* Mensajes */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              backgroundColor: "#f8fafc",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    backgroundColor: msg.role === "user" ? "#10b981" : "#ffffff",
                    color: msg.role === "user" ? "#ffffff" : "#1f2937",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "16px 16px 16px 4px",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                      animation: "bounce 1.4s infinite ease-in-out both",
                    }}
                  />
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                      animation: "bounce 1.4s infinite ease-in-out both 0.2s",
                    }}
                  />
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                      animation: "bounce 1.4s infinite ease-in-out both 0.4s",
                    }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#ffffff",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={locale === "es" ? "Escribe tu mensaje..." : "Type your message..."}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "24px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#10b981";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: input.trim() && !isLoading ? "#10b981" : "#e5e7eb",
                border: "none",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Animación CSS */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.6);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
