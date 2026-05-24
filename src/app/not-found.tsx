import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl w-full border border-dashed border-[#2a2a2a] bg-[#111111]/30 p-16">
        <h1 className="font-heading text-[#e8e8e8] text-5xl md:text-[64px] font-bold tracking-tight mb-4 uppercase drop-shadow-md">
          CASE NOT FOUND
        </h1>
        <div className="w-16 h-[2px] bg-[#8b0000] mx-auto mb-6"></div>
        <p className="font-body text-[#888888] text-[16px] md:text-[18px] mb-10">
          This file has been classified or does not exist
        </p>
        <Link
          href="/cases"
          className="inline-block bg-[#8b0000] hover:bg-[#a00000] text-white font-body text-sm font-bold uppercase tracking-widest px-8 py-3 transition-colors shadow-[0_0_15px_rgba(139,0,0,0.4)]"
        >
          RETURN TO ARCHIVES
        </Link>
      </div>
    </main>
  );
}
