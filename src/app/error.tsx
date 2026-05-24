"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#111111] border border-[#2a2a2a] p-12 max-w-lg w-full shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#8b0000]"></div>
        <svg className="w-16 h-16 text-[#8b0000] mx-auto mb-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h1 className="font-heading text-[#e8e8e8] text-3xl font-bold uppercase tracking-widest mb-4">
          SOMETHING WENT WRONG
        </h1>
        <p className="font-body text-[#888888] text-[15px] mb-8">
          A critical error occurred while attempting to access this archive file.
        </p>
        <button
          onClick={() => reset()}
          className="bg-[#8b0000] hover:bg-[#a00000] text-white font-body text-sm font-bold uppercase tracking-widest px-8 py-3 transition-colors shadow-[0_0_15px_rgba(139,0,0,0.4)]"
        >
          TRY AGAIN
        </button>
      </div>
    </main>
  );
}
