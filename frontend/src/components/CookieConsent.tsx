"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getString } from "@/lib/i18n";

interface CookiePreferences {
  essential: boolean;
  performance: boolean;
  personalization: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "es";
  
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    performance: false,
    personalization: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
      setHasConsent(false);
    } else {
      const parsed = JSON.parse(consent);
      setPreferences(parsed.preferences || preferences);
      setHasConsent(true);
    }
  }, []);

  const saveConsent = (status: "accepted" | "declined" | "customized", prefs?: CookiePreferences) => {
    const finalPrefs = prefs || preferences;
    localStorage.setItem("cookie-consent", JSON.stringify({
      status,
      preferences: finalPrefs,
      date: new Date().toISOString(),
    }));
    
    setPreferences(finalPrefs);
    setShowBanner(false);
    setShowPreferences(false);
    setHasConsent(true);
  };

  const handleAcceptAll = () => {
    const allPrefs = {
      essential: true,
      performance: true,
      personalization: true,
      marketing: true,
    };
    setPreferences(allPrefs);
    saveConsent("accepted", allPrefs);
  };

  const handleDecline = () => {
    const minPrefs = {
      essential: true,
      performance: false,
      personalization: false,
      marketing: false,
    };
    setPreferences(minPrefs);
    saveConsent("declined", minPrefs);
  };

  const handleSavePreferences = () => {
    saveConsent("customized", preferences);
  };

  const handleIconClick = () => {
    setShowPreferences(true);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Always visible floating icon */}
      <button
        onClick={handleIconClick}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 9999,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: hasConsent ? "#10b981" : "#0f172a",
          border: "2px solid #10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
        }}
        aria-label={getString(locale, "cookies.manage")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
          <path d="M8.5 8.5 12 12" />
          <path d="M15.5 8.5 12 12" />
          <path d="M12 15.5V12" />
        </svg>
        
        {/* Status indicator dot */}
        <span
          style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: hasConsent ? "#10b981" : "#f59e0b",
            border: "2px solid #ffffff",
          }}
        />
      </button>

      {/* Preferences Modal */}
      {showPreferences && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowPreferences(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111827" }}>
                {getString(locale, "cookies.preferences.title")}
              </h2>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#6b7280", lineHeight: 1.5 }}>
                {getString(locale, "cookies.preferences.desc")}
              </p>
            </div>

            {/* Cookie Categories */}
            <div style={{ padding: "16px 24px" }}>
              {/* Essential */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "#111827", fontSize: "14px" }}>
                    {getString(locale, "cookies.category.essential")}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
                    {getString(locale, "cookies.category.essential.desc")}
                  </p>
                </div>
                <div
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    backgroundColor: "#10b981",
                    position: "relative",
                    opacity: 0.6,
                    cursor: "not-allowed",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: "22px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              </div>

              {/* Performance */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "#111827", fontSize: "14px" }}>
                    {getString(locale, "cookies.category.performance")}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
                    {getString(locale, "cookies.category.performance.desc")}
                  </p>
                </div>
                <button
                  onClick={() => togglePreference("performance")}
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    backgroundColor: preferences.performance ? "#10b981" : "#d1d5db",
                    position: "relative",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: preferences.performance ? "22px" : "2px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </div>

              {/* Personalization */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "#111827", fontSize: "14px" }}>
                    {getString(locale, "cookies.category.personalization")}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
                    {getString(locale, "cookies.category.personalization.desc")}
                  </p>
                </div>
                <button
                  onClick={() => togglePreference("personalization")}
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    backgroundColor: preferences.personalization ? "#10b981" : "#d1d5db",
                    position: "relative",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: preferences.personalization ? "22px" : "2px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </div>

              {/* Marketing */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "#111827", fontSize: "14px" }}>
                    {getString(locale, "cookies.category.marketing")}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
                    {getString(locale, "cookies.category.marketing.desc")}
                  </p>
                </div>
                <button
                  onClick={() => togglePreference("marketing")}
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    backgroundColor: preferences.marketing ? "#10b981" : "#d1d5db",
                    position: "relative",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: preferences.marketing ? "22px" : "2px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px 24px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              {!hasConsent && (
                <button
                  onClick={handleDecline}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  {getString(locale, "cookies.decline")}
                </button>
              )}
              <button
                onClick={() => setShowPreferences(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
              >
                {getString(locale, "cookies.cancel")}
              </button>
              <button
                onClick={handleSavePreferences}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#10b981";
                }}
              >
                {getString(locale, "cookies.savePreferences")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Cookie Banner - Only on first visit */}
      {showBanner && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9998,
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "24px",
            boxShadow: "0 -20px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                    <path d="M8.5 8.5 12 12" />
                    <path d="M15.5 8.5 12 12" />
                    <path d="M12 15.5V12" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>
                  {getString(locale, "cookies.title")}
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  maxWidth: "800px",
                }}
              >
                {getString(locale, "cookies.description")}{" "}
                <a
                  href={`/${locale}/privacy`}
                  style={{
                    color: "#10b981",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = "underline";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = "none";
                  }}
                >
                  {getString(locale, "cookies.privacyLink")}
                </a>
              </p>
            </div>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <button
                onClick={handleDecline}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  backgroundColor: "transparent",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {getString(locale, "cookies.decline")}
              </button>

              <button
                onClick={() => {
                  setShowBanner(false);
                  setShowPreferences(true);
                }}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
                {getString(locale, "cookies.customize")}
              </button>

              <button
                onClick={handleAcceptAll}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#10b981",
                  color: "#0f172a",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#34d399";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#10b981";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {getString(locale, "cookies.accept")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
