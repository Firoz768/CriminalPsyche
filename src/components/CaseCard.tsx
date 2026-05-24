import Link from "next/link";
import Image from "next/image";

export default function CaseCard({ c }: { c: {
  slug?: string;
  coverImage?: string;
  title?: string;
  motiveCategory?: string;
  killerName?: string;
  summary?: string;
  yearOfCrime?: number | string;
} }) {
  return (
    <div className="group block h-full bg-[#1a1a1a] border border-[#2a2a2a] flex flex-col transition-all duration-300 hover:border-[#8b0000] hover:shadow-[0_0_20px_rgba(139,0,0,0.2)] relative overflow-hidden">
      
      {/* Top section: cover image */}
      <Link href={`/cases/${c.slug}`} className="block relative h-56 w-full bg-[#111111] border-b border-[#2a2a2a] overflow-hidden">
        {c.coverImage ? (
          <Image src={c.coverImage} alt={c.title} unoptimized fill loading="lazy" className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#2a2a2a] bg-[#111111] group-hover:text-[#8b0000] transition-colors duration-500">
            <svg className="w-20 h-20 opacity-30 group-hover:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
      </Link>
      
      {/* Motive tag bottom-left - Absolute positioned over the image */}
      <div className="absolute top-[200px] left-0 z-10">
        <Link 
          href={`/motives/${encodeURIComponent((c.motiveCategory || "unknown").toLowerCase())}`} 
          className="block bg-[#8b0000] text-white uppercase font-body text-[11px] font-bold px-3 py-1.5 tracking-widest shadow-[2px_-2px_10px_rgba(0,0,0,0.5)] hover:bg-[#a00000] transition-colors"
        >
          {c.motiveCategory || "UNKNOWN"}
        </Link>
      </div>

      {/* Card body */}
      <div className="p-6 flex flex-col flex-grow relative z-10 pt-8">
        <Link 
          href={`/killers/${encodeURIComponent(c.killerName || "unknown")}`} 
          className="font-body text-[#888888] hover:text-[#e8e8e8] transition-colors text-[12px] uppercase tracking-[0.2em] font-semibold mb-2 line-clamp-1 block w-fit"
        >
          {c.killerName || "UNKNOWN SUBJECT"}
        </Link>
        <Link href={`/cases/${c.slug}`} className="block mb-3 flex-grow">
          <h3 className="font-heading text-[#e8e8e8] text-[20px] font-bold group-hover:text-[#8b0000] transition-colors leading-snug mb-3">
            {c.title}
          </h3>
          <p className="font-body text-[#888888] text-[14px] leading-relaxed line-clamp-2">
            {c.summary || "Case details are currently redacted or unavailable in the public archive."}
          </p>
        </Link>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2a2a2a]/50">
          <span className="font-mono text-[#555555] text-[12px] font-bold tracking-widest">
            {c.yearOfCrime || "----"}
          </span>
          <Link href={`/cases/${c.slug}`} className="font-body text-[#8b0000] text-[12px] uppercase font-bold tracking-widest group-hover:text-white transition-colors flex items-center gap-1">
            READ CASE <span className="text-[16px] leading-none mb-[2px]">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
