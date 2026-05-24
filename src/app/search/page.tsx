"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface SearchResult {
  _id: { toString: () => string };
  slug: string;
  coverImage?: string;
  title?: string;
  motiveCategory?: string;
  killerName?: string;
  yearOfCrime?: string | number;
  region?: string;
  summary?: string;
}

function HighlightedText({ text, highlight }: { text?: string, highlight: string }) {
  if (!highlight.trim() || !text) return <>{text || ""}</>;
  
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? 
          <strong key={i} className="text-[#8b0000] font-bold">{part}</strong> : 
          part
      )}
    </>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [activeSearch, setActiveSearch] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data.cases || []);
      setHasSearched(true);
      setActiveSearch(searchQuery);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount if URL has a query
  useEffect(() => {
    if (initialQuery) {
      fetchResults(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Update URL without full reload
    router.push(`/search?q=${encodeURIComponent(query)}`);
    fetchResults(query);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    router.push("/search");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20">
      
      {/* PAGE HEADER */}
      <section className="bg-[#111111] border-b border-[#2a2a2a] py-16 px-6 text-center">
        <h1 className="font-heading text-[#e8e8e8] text-4xl md:text-[48px] font-bold uppercase tracking-tight mb-4 drop-shadow-md">
          SEARCH THE ARCHIVES
        </h1>
        <p className="font-body text-[#888888] text-[16px] max-w-2xl mx-auto mb-10">
          Search across cases, killers, motives and psychological profiles
        </p>
        
        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="max-w-[700px] mx-auto flex shadow-2xl group">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the archives..."
            className="w-full bg-[#111111] border border-[#2a2a2a] border-r-0 text-[#e8e8e8] placeholder:text-[#555555] text-[18px] px-6 py-4 focus:outline-none group-focus-within:border-[#8b0000] font-body transition-colors"
          />
          <button type="submit" className="bg-[#111111] border border-[#2a2a2a] border-l-0 px-6 text-[#8b0000] group-focus-within:border-[#8b0000] hover:bg-[#8b0000] hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>
      </section>

      {/* RESULTS SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        
        {loading ? (
          <div className="text-center text-[#888888] font-body uppercase tracking-widest py-20">
            Scanning Archives...
          </div>
        ) : hasSearched ? (
          <>
            <div className="flex items-end justify-between mb-8 border-b border-[#2a2a2a] pb-4">
              <h2 className="font-body text-[#888888] text-[14px] uppercase tracking-[0.2em] font-bold">
                RESULTS FOR &apos;<span className="text-[#e8e8e8]">{activeSearch}</span>&apos;
              </h2>
              <span className="font-mono text-[#555555] text-[12px] uppercase tracking-widest">
                {results.length} cases found
              </span>
            </div>

            {results.length > 0 ? (
              <div className="flex flex-col gap-6">
                {results.map((c: SearchResult) => (
                  <Link href={`/cases/${c.slug}`} key={c._id.toString()} className="flex flex-col sm:flex-row bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#8b0000] transition-colors group overflow-hidden shadow-lg">
                    
                    {/* Thumbnail */}
                    <div className="w-full sm:w-[80px] h-[120px] sm:h-auto flex-shrink-0 bg-[#111111] border-b sm:border-b-0 sm:border-r border-[#2a2a2a]">
                      {c.coverImage ? (
                        <Image src={c.coverImage} alt={c.title || "Cover Image"} width={80} height={120} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#2a2a2a] group-hover:text-[#8b0000] transition-colors bg-[#111111]">
                          <svg className="w-6 h-6 opacity-30 group-hover:opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col justify-center flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <Link href={`/motives/${encodeURIComponent(c.motiveCategory || 'unknown')}`} onClick={(e) => e.stopPropagation()} className="font-body text-[#8b0000] hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em] font-bold">
                          {c.motiveCategory || "UNKNOWN"}
                        </Link>
                        <div className="font-mono text-[#555555] text-[12px] flex items-center gap-2 uppercase tracking-widest">
                          {c.yearOfCrime || "????"} {c.region && `// ${c.region}`}
                        </div>
                      </div>
                      
                      <h3 className="font-heading text-[#e8e8e8] text-[22px] group-hover:text-[#8b0000] transition-colors leading-snug mb-1">
                        <HighlightedText text={c.title} highlight={activeSearch} />
                      </h3>
                      
                      <Link href={`/killers/${encodeURIComponent(c.killerName || 'unknown')}`} onClick={(e) => e.stopPropagation()} className="inline-block font-body text-[#888888] hover:text-[#e8e8e8] transition-colors text-[13px] uppercase tracking-[0.15em] font-semibold mb-3 w-fit">
                        <HighlightedText text={c.killerName || "UNKNOWN SUBJECT"} highlight={activeSearch} />
                      </Link>
                      
                      <p className="font-body text-[#888888] text-[14px] leading-relaxed line-clamp-2">
                        <HighlightedText text={c.summary || "Case details currently unavailable."} highlight={activeSearch} />
                      </p>
                    </div>

                  </Link>
                ))}
              </div>
            ) : (
              /* EMPTY STATE */
              <div className="text-center py-24 bg-[#111111]/30 border border-dashed border-[#2a2a2a] flex flex-col items-center">
                <svg className="w-16 h-16 text-[#8b0000] mb-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 10h.01M15 10h.01M9 14h6" /></svg>
                <h3 className="font-heading text-[#e8e8e8] text-3xl mb-3">NO CASES FOUND</h3>
                <p className="font-body text-[#888888] text-[15px] mb-8">The archives have no record of this search.</p>
                <button 
                  onClick={clearSearch}
                  className="font-body text-[#8b0000] text-sm uppercase tracking-widest font-bold hover:text-white transition-colors"
                >
                  CLEAR SEARCH
                </button>
              </div>
            )}
          </>
        ) : null}

      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] pt-20 flex items-center justify-center">
        <div className="text-[#888888] font-body uppercase tracking-widest">Loading Archives...</div>
      </main>
    }>
      <SearchContent />
    </Suspense>
  );
}
