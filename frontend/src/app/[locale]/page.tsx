"use client";

import { Header, Hero, CTASection, Footer } from "@/components/landing";
import ChatBot from "@/components/ChatBot";

// Deploy timestamp: 2026-05-07 20:42 - API connection enabled
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <CTASection />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}
