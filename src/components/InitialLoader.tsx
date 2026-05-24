"use client";

import { useState, useEffect } from "react";

export default function InitialLoader() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate initial page load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center transition-opacity duration-700 pointer-events-none ${loading ? "opacity-100" : "opacity-0"}`}
      aria-hidden="true"
    >
      <h1 className="font-heading font-bold text-[#8b0000] text-4xl md:text-6xl tracking-[0.3em] uppercase drop-shadow-[0_0_20px_rgba(139,0,0,0.6)]">
        CriminalPsyche
      </h1>
    </div>
  );
}
