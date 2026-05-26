"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("ACCESS DENIED. Invalid credentials.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 pt-24 pb-12 relative z-10">
      <div className="w-full max-w-md border border-border bg-surface p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-background via-primary to-background"></div>
        
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl text-text-primary uppercase tracking-widest font-bold">
            Auth<span className="text-primary">Required</span>
          </h1>
          <p className="font-mono text-xs text-text-muted mt-2 uppercase tracking-widest">
            Level 5 Clearance Only
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 border border-secondary bg-secondary/10 text-secondary font-mono text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-xs text-text-muted mb-2 uppercase" htmlFor="email">
              Agent ID (Email)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-background border border-border text-text-primary p-3 font-mono focus:outline-none focus:border-primary transition-colors focus:shadow-[0_0_10px_rgba(139,0,0,0.2)]"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-text-muted mb-2 uppercase" htmlFor="password">
              Passcode
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-background border border-border text-text-primary p-3 font-mono focus:outline-none focus:border-primary transition-colors focus:shadow-[0_0_10px_rgba(139,0,0,0.2)]"
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
              "ACCESS ARCHIVES"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="font-mono text-xs text-text-muted">
            New agent? <Link href="/register" className="text-primary hover:text-secondary underline decoration-primary/50 underline-offset-4">Register Authorization</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
