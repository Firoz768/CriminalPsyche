"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pre-fill form when session loads
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Update the client-side session context with the new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.user.name,
          email: data.user.email,
        }
      });

      showToast("Profile credentials updated successfully");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 md:p-12 max-w-7xl mx-auto w-full min-h-screen">
      <header className="mb-14">
        <h1 className="font-heading text-[#e8e8e8] text-4xl md:text-[36px] font-bold tracking-tight mb-3 uppercase">
          SYSTEM SETTINGS
        </h1>
        <p className="font-body text-[#888888] text-sm uppercase tracking-widest font-semibold">
          Manage your administrator profile and credentials
        </p>
      </header>

      <div className="bg-[#111111] border border-[#2a2a2a] p-8 max-w-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle decorative accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#8b0000]"></div>
        
        <h3 className="font-heading text-[#e8e8e8] text-2xl uppercase tracking-widest mb-8">
          Profile Information
        </h3>

        {error && (
          <div className="mb-6 p-4 bg-[#8b0000]/20 border border-[#8b0000] text-[#e8e8e8] text-sm font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-body text-[#888888] text-[12px] uppercase tracking-wide mb-2">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] focus:outline-none focus:border-[#8b0000] px-4 py-3 font-body text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block font-body text-[#888888] text-[12px] uppercase tracking-wide mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] focus:outline-none focus:border-[#8b0000] px-4 py-3 font-mono text-sm transition-colors"
            />
          </div>

          <div className="pt-6 border-t border-[#2a2a2a]">
            <button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-[#8b0000] hover:bg-[#a00000] text-white font-body text-xs font-bold uppercase tracking-widest px-10 py-4 transition-colors shadow-[0_0_15px_rgba(139,0,0,0.3)] disabled:opacity-50 flex items-center justify-center min-w-[200px]"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                "UPDATE CREDENTIALS"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CUSTOM RED TOAST */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-[#8b0000] border border-[#a00000] text-white font-body text-[13px] font-bold uppercase tracking-widest px-6 py-4 shadow-[0_0_20px_rgba(139,0,0,0.4)] z-[9999] animate-[slideIn_0.3s_ease-out]">
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}} />
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {toastMessage}
          </div>
        </div>
      )}
    </main>
  );
}
