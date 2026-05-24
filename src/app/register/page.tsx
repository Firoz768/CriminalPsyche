"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md border border-border bg-surface p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-background via-secondary to-background"></div>
        
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl text-text-primary uppercase tracking-widest font-bold">
            New<span className="text-secondary">Agent</span>
          </h1>
          <p className="font-mono text-xs text-text-muted mt-2 uppercase tracking-widest">
            Authorization Request
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 border border-secondary bg-secondary/10 text-secondary font-mono text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-xs text-text-muted mb-2 uppercase" htmlFor="name">
              Agent Alias (Name)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-background border border-border text-text-primary p-3 font-mono focus:outline-none focus:border-secondary transition-colors focus:shadow-[0_0_10px_rgba(192,57,43,0.2)]"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-text-muted mb-2 uppercase" htmlFor="email">
              Identifier (Email)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-background border border-border text-text-primary p-3 font-mono focus:outline-none focus:border-secondary transition-colors focus:shadow-[0_0_10px_rgba(192,57,43,0.2)]"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-text-muted mb-2 uppercase" htmlFor="password">
              Secure Passcode
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-background border border-border text-text-primary p-3 font-mono focus:outline-none focus:border-secondary transition-colors focus:shadow-[0_0_10px_rgba(192,57,43,0.2)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8b0000] hover:bg-[#a00000] text-white font-body text-sm font-bold uppercase tracking-widest py-4 transition-colors mt-6 shadow-[0_0_15px_rgba(139,0,0,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center h-14"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "REGISTER CLEARANCE"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="font-mono text-xs text-text-muted">
            Already authorized? <Link href="/login" className="text-secondary hover:text-primary underline decoration-secondary/50 underline-offset-4">Return to Login</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
