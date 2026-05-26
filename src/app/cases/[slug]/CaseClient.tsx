"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ReadingProgressBar from "./ReadingProgressBar";
import CaseComments from "./CaseComments";

interface CaseClientProps {
  caseFile: Record<string, unknown> & {
    title?: string;
    killerName?: string;
    motiveCategory?: string;
    coverImage?: string;
    body?: string;
    summary?: string;
    psychologyProfile?: string;
    motiveSummary?: string;
    behavioralPatterns?: string;
    yearOfCrime?: string | number;
    region?: string;
    timelineEvents?: Array<Record<string, unknown> & { id: string; date: string; title: string; description: string; type: string }>;
    evidenceItems?: Array<Record<string, unknown>>;
  };
  relatedCases: Array<Record<string, unknown> & { _id: { toString: () => string }; slug: string; motiveCategory: string; title: string; killerName: string; coverImage: string; }>;
  tags: string[];
  isUnsolved: boolean;
  isAdmin: boolean;
  slug: string;
}

const typeColors: Record<string, string> = {
  murder: '#8b0000',
  investigation: '#888888',
  suspect: '#8b4500',
  arrest: '#1a7a1a',
  evidence: '#1a3a7a',
  communication: '#6a1a7a',
  outcome: '#555555'
};

const TimelineCard = ({ event, dotColor }: { event: Record<string, unknown> & { date: string; title: string; description: string; type?: string; }, dotColor: string }) => (
  <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-5 rounded-sm relative w-full">
    <div className="font-body text-[11px] uppercase tracking-wide mb-2" style={{ color: dotColor }}>
      {event.date}
    </div>
    <h4 className="font-heading text-[#e8e8e8] text-[16px] font-bold mb-2">
      {event.title}
    </h4>
    <p className="font-body text-[#888888] text-[14px] leading-[1.8]">
      {event.description}
    </p>
  </div>
);

export default function CaseClient({
  caseFile,
  relatedCases,
  tags,
  isUnsolved,
  isAdmin,
  slug,
}: CaseClientProps) {
  const [mounted, setMounted] = useState(false);
  const [isClassified, setIsClassified] = useState(!isAdmin);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAdmin) {
      const status = localStorage.getItem(`declassified_case_${slug}`);
      if (status === "true") {
        setIsClassified(false);
      }
    }
  }, [isAdmin, slug]);

  const playClickSound = () => {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const handleDeclassify = () => {
    if (!isClassified || isAnimating) return;
    playClickSound();
    setIsAnimating(true);

    setTimeout(() => {
      setIsClassified(false);
      setIsAnimating(false);
      localStorage.setItem(`declassified_case_${slug}`, "true");
    }, 800);
  };

  // Helper for generating redaction bars based on content length
  const renderRedactionBars = () => {
    return (
      <div
        className={`flex flex-col gap-2 ${
          isAnimating ? "animate-redact-fade-out" : ""
        }`}
      >
        <div className="h-5 bg-[#0a0a0a] w-[95%] rounded-sm relative overflow-hidden"><div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div></div>
        <div className="h-5 bg-[#0a0a0a] w-[85%] rounded-sm relative overflow-hidden"><div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div></div>
        <div className="h-5 bg-[#0a0a0a] w-[90%] rounded-sm relative overflow-hidden"><div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div></div>
        <div className="h-5 bg-[#0a0a0a] w-[60%] rounded-sm relative overflow-hidden"><div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div></div>
        <div className="h-5 bg-[#0a0a0a] w-[88%] rounded-sm relative overflow-hidden"><div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div></div>
      </div>
    );
  };

  // Prevent flash of unstyled content during hydration
  const showClassified = mounted ? isClassified : !isAdmin;

  return (
    <>
      {showClassified && (
        <div className="fixed top-[64px] md:top-[80px] left-0 w-full z-40 bg-[#1a0000] border-b border-[#8b0000] text-[#8b0000] font-body text-[11px] uppercase text-center py-1.5 tracking-wider shadow-[0_2px_10px_rgba(139,0,0,0.2)]">
          ⚠ THIS CASE FILE CONTAINS CLASSIFIED INFORMATION — AUTHORIZED PERSONNEL ONLY
        </div>
      )}

      <main className="min-h-screen bg-[#0a0a0a] pt-20 relative z-10">
        <ReadingProgressBar />

        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16">
          {/* LEFT COLUMN - 65% on desktop */}
          <div className="w-full lg:w-[65%]">
            {/* HEADER */}
            <header className="mb-14">
              <Link
                href={`/motives/${encodeURIComponent(
                  (caseFile.motiveCategory || "unknown").toLowerCase()
                )}`}
                className="inline-block bg-[#8b0000] text-white uppercase font-body text-xs font-bold px-3 py-1 tracking-widest mb-6 hover:bg-[#a00000] transition-colors"
              >
                {caseFile.motiveCategory || "UNKNOWN MOTIVE"}
              </Link>
              <h1 className="font-heading text-[#e8e8e8] text-4xl md:text-[52px] font-bold leading-tight mb-4 drop-shadow-md">
                {caseFile.title}
              </h1>
              <Link
                href={`/killers/${encodeURIComponent(
                  caseFile.killerName || "unknown"
                )}`}
                className="block font-body text-[#888888] hover:text-[#e8e8e8] transition-colors text-sm md:text-base uppercase tracking-[0.3em] font-semibold mb-8 w-fit"
              >
                {caseFile.killerName || "UNKNOWN SUBJECT"}
              </Link>
              <div className="w-full h-[1px] bg-[#8b0000] mb-10"></div>

              <div className="relative w-full h-[300px] md:h-[450px] border border-[#2a2a2a] bg-[#111111] overflow-hidden">
                {caseFile.coverImage ? (
                  <>
                    <Image
                      src={caseFile.coverImage}
                      alt={caseFile.title || "Cover image"}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[#8b0000]/30 mix-blend-multiply pointer-events-none"></div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#2a2a2a]">
                    <svg
                      className="w-24 h-24 opacity-20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-mono text-xs uppercase tracking-widest mt-4 opacity-50">
                      IMAGE REDACTED
                    </span>
                  </div>
                )}
              </div>
            </header>

            {/* ARTICLE SECTIONS */}
            <article className="space-y-14">
              {/* OVERVIEW */}
              <section>
                <div className="font-body text-[#8b0000] text-[12px] uppercase tracking-[0.25em] font-bold mb-4 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-[#8b0000]"></span> OVERVIEW
                </div>
                <h2 className="font-heading text-[#e8e8e8] text-[24px] mb-6">
                  The Case File
                </h2>
                <div className="prose prose-invert max-w-none prose-custom">
                  <div dangerouslySetInnerHTML={{
                    __html:
                      caseFile.body ||
                      caseFile.summary ||
                      "<p>Body data missing or fully redacted.</p>",
                  }} />
                </div>
              </section>

              <div className="w-full h-[1px] bg-[#2a2a2a]"></div>

              {/* PSYCHOLOGICAL PROFILE */}
              <section className="relative">
                <div className="font-body text-[#8b0000] text-[12px] uppercase tracking-[0.25em] font-bold mb-4 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-[#8b0000]"></span> PSYCHOLOGICAL PROFILE
                </div>
                <h2 className="font-heading text-[#e8e8e8] text-[24px] mb-6">
                  Mind of the Subject
                </h2>
                
                {showClassified ? (
                  <div className="relative">
                    {renderRedactionBars()}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[3px] border-[#8b0000] text-[#8b0000] font-body text-[14px] uppercase tracking-widest px-4 py-2 font-bold pointer-events-none -rotate-[15deg] bg-[#0a0a0a]/80 backdrop-blur-sm ${isAnimating ? "animate-stamp-fade-out" : "opacity-85"}`}>
                      CLASSIFIED — LEVEL 5 CLEARANCE REQUIRED
                    </div>
                  </div>
                ) : (
                  <div className={`prose prose-invert max-w-none prose-custom whitespace-pre-wrap ${isAnimating ? "opacity-0" : "animate-text-fade-in"}`}>
                    {caseFile.psychologyProfile ||
                      "Psychological analysis is currently incomplete or pending review from behavioral science unit."}
                  </div>
                )}
              </section>

              <div className="w-full h-[1px] bg-[#2a2a2a]"></div>

              {/* MOTIVE ANALYSIS */}
              <section>
                <div className="font-body text-[#8b0000] text-[12px] uppercase tracking-[0.25em] font-bold mb-4 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-[#8b0000]"></span> MOTIVE ANALYSIS
                </div>
                <h2 className="font-heading text-[#e8e8e8] text-[24px] mb-6 capitalize">
                  {caseFile.motiveCategory || "Unknown"} Drive
                </h2>
                <div className="prose prose-invert max-w-none prose-custom whitespace-pre-wrap">
                  {caseFile.motiveSummary ||
                    `Analysis indicates the primary operational driver was ${
                      caseFile.motiveCategory || "unknown factors"
                    }.`}
                </div>
              </section>

              <div className="w-full h-[1px] bg-[#2a2a2a]"></div>

              {/* BEHAVIORAL PATTERNS */}
              <section className="relative">
                <div className="font-body text-[#8b0000] text-[12px] uppercase tracking-[0.25em] font-bold mb-4 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-[#8b0000]"></span> BEHAVIORAL PATTERNS
                </div>
                <h2 className="font-heading text-[#e8e8e8] text-[24px] mb-6">
                  Modus Operandi
                </h2>
                
                {showClassified ? (
                  <div className="relative">
                    {renderRedactionBars()}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[3px] border-[#8b0000] text-[#8b0000] font-body text-[14px] uppercase tracking-widest px-4 py-2 font-bold pointer-events-none -rotate-[15deg] bg-[#0a0a0a]/80 backdrop-blur-sm ${isAnimating ? "animate-stamp-fade-out" : "opacity-85"}`}>
                      RESTRICTED — LAW ENFORCEMENT ONLY
                    </div>
                  </div>
                ) : (
                  <div className={`prose prose-invert max-w-none prose-custom whitespace-pre-wrap ${isAnimating ? "opacity-0" : "animate-text-fade-in"}`}>
                    {caseFile.behavioralPatterns ||
                      "No clear behavioral patterns have been established at this time."}
                  </div>
                )}
              </section>

              {caseFile.timelineEvents && caseFile.timelineEvents.length > 0 && (
                <>
                  <div className="w-full h-[1px] bg-[#2a2a2a]"></div>
                  <section>
                    <div className="font-body text-[#8b0000] text-[12px] uppercase tracking-[0.25em] font-bold mb-4 flex items-center gap-3">
                      <span className="w-6 h-[1px] bg-[#8b0000]"></span> CASE TIMELINE
                    </div>
                    <h2 className="font-heading text-[#e8e8e8] text-[28px] mb-12">
                      Chronological Record
                    </h2>
                    
                    <div className="relative">
                      {/* The center line */}
                      <div className="absolute left-[8px] md:left-1/2 top-0 bottom-0 w-[2px] bg-[#8b0000] -translate-x-1/2 md:-translate-x-1/2"></div>
                      
                      <div className="space-y-8">
                        {caseFile.timelineEvents.map((event: Record<string, unknown> & { id: string; date: string; title: string; description: string; type: string }, index: number) => {
                          const isEven = index % 2 === 0;
                          const dotColor = typeColors[event.type] || '#555555';
                          
                          return (
                            <div key={event.id || index} className="relative flex md:justify-between items-start w-full">
                              
                              {/* Left side content (even on desktop) */}
                              <div className="hidden md:flex w-5/12 justify-end relative">
                                {isEven && (
                                  <>
                                    <TimelineCard event={event} dotColor={dotColor} />
                                    {/* Desktop Connector for left side */}
                                    <div className="absolute top-[32px] -right-[20%] w-[20%] h-[1px] bg-[#2a2a2a]"></div>
                                  </>
                                )}
                              </div>
                              
                              {/* The dot */}
                              <div 
                                className="absolute left-[8px] md:left-1/2 top-[32px] w-[14px] h-[14px] rounded-full z-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-[#0a0a0a]"
                                style={{ 
                                  borderColor: dotColor, 
                                  borderWidth: '2px', 
                                  borderStyle: 'solid',
                                  boxShadow: `0 0 6px ${dotColor}99`
                                }}
                              ></div>
                              
                              {/* Right side content (odd) and mobile content (all) */}
                              <div className="w-[calc(100%-24px)] ml-[24px] md:ml-0 md:flex md:w-5/12 justify-start relative">
                                <div className={`w-full ${isEven ? 'block md:hidden' : 'block'}`}>
                                  <TimelineCard event={event} dotColor={dotColor} />
                                  {/* Mobile Connector */}
                                  <div className="absolute top-[32px] -left-[24px] w-[24px] h-[1px] bg-[#2a2a2a] md:hidden"></div>
                                  {/* Desktop Connector for right side */}
                                  {!isEven && <div className="hidden md:block absolute top-[32px] -left-[20%] w-[20%] h-[1px] bg-[#2a2a2a]"></div>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                </>
              )}
              <CaseComments slug={slug} />
            </article>
          </div>

          {/* RIGHT COLUMN - 35% on desktop */}
          <aside className="w-full lg:w-[35%] space-y-12">
            <div className="sticky top-28 space-y-12">
              {/* CASE FILE CARD */}
              <div className="bg-[#111111] border border-[#2a2a2a] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <h3 className="font-body text-[#8b0000] text-sm uppercase tracking-[0.2em] font-bold mb-8 flex items-center gap-3">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  CASE FILE
                </h3>

                <div className="flex flex-col font-body text-sm">
                  <div className="flex justify-between items-center py-4 border-b border-[#1f1f1f]">
                    <span className="text-[#888888] uppercase tracking-wider text-[11px] font-bold">
                      Subject
                    </span>
                    {showClassified ? (
                       <span className={`text-[#8b0000] font-mono tracking-tight text-right w-1/2 line-clamp-1 bg-[#1a0a0a] px-1 ${isAnimating ? "animate-text-flash" : ""}`}>
                         [REDACTED]
                       </span>
                    ) : (
                      <Link
                        href={`/killers/${encodeURIComponent(
                          caseFile.killerName || "unknown"
                        )}`}
                        className={`text-[#e8e8e8] hover:text-[#8b0000] transition-colors font-mono tracking-tight text-right w-1/2 line-clamp-1 ${mounted && !isClassified && !isAdmin ? "animate-text-flash" : ""}`}
                      >
                        {caseFile.killerName || "UNKNOWN"}
                      </Link>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-[#1f1f1f]">
                    <span className="text-[#888888] uppercase tracking-wider text-[11px] font-bold">
                      Year
                    </span>
                    <span className="text-[#e8e8e8] font-mono">
                      {caseFile.yearOfCrime || "????"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-[#1f1f1f]">
                    <span className="text-[#888888] uppercase tracking-wider text-[11px] font-bold">
                      Region
                    </span>
                    {showClassified ? (
                      <span className={`text-[#8b0000] font-mono text-right w-1/2 line-clamp-1 bg-[#1a0a0a] px-1 ${isAnimating ? "animate-text-flash" : ""}`}>
                        [REDACTED]
                      </span>
                    ) : (
                      <span className={`text-[#e8e8e8] font-mono text-right w-1/2 line-clamp-1 ${mounted && !isClassified && !isAdmin ? "animate-text-flash" : ""}`}>
                        {caseFile.region || "UNKNOWN"}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-[#1f1f1f]">
                    <span className="text-[#888888] uppercase tracking-wider text-[11px] font-bold">
                      Motive
                    </span>
                    <Link
                      href={`/motives/${encodeURIComponent(
                        (caseFile.motiveCategory || "unknown").toLowerCase()
                      )}`}
                      className="text-[#e8e8e8] hover:text-[#8b0000] transition-colors uppercase text-[12px] tracking-widest"
                    >
                      {caseFile.motiveCategory || "UNKNOWN"}
                    </Link>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-[#1f1f1f]">
                    <span className="text-[#888888] uppercase tracking-wider text-[11px] font-bold">
                      Status
                    </span>
                    {isUnsolved ? (
                      <span className="bg-[#8b0000] text-white text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-[0_0_10px_rgba(139,0,0,0.4)]">
                        UNSOLVED
                      </span>
                    ) : (
                      <span className="bg-green-950/40 text-green-500 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm border border-green-900/60">
                        CLOSED
                      </span>
                    )}
                  </div>
                </div>

                {/* TAGS */}
                {tags.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-[#1f1f1f]">
                    <h4 className="font-body text-[#8b0000] text-[11px] uppercase tracking-[0.2em] font-bold mb-4">
                      TAGS
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string) => (
                        <Link
                          href={`/tags/${encodeURIComponent(tag)}`}
                          key={tag}
                          className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#888888] text-[10px] uppercase tracking-widest px-3 py-1.5 hover:border-[#8b0000] hover:text-[#e8e8e8] transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* EVIDENCE BOARD LINK */}
              {caseFile.evidenceItems && caseFile.evidenceItems.length > 0 && (
                <Link
                  href={`/cases/${slug}/evidence`}
                  className="block w-full bg-[#111111] border border-[#8b0000] text-[#8b0000] hover:bg-[#8b0000] hover:text-white transition-colors font-body text-[12px] font-bold uppercase tracking-widest text-center py-4 shadow-[0_0_15px_rgba(139,0,0,0.1)] hover:shadow-[0_0_20px_rgba(139,0,0,0.3)]"
                >
                  VIEW EVIDENCE BOARD →
                </Link>
              )}

              {/* RELATED CASES */}
              {relatedCases.length > 0 && (
                <div>
                  <h3 className="font-heading text-[#e8e8e8] text-[24px] mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#8b0000]"></div>
                    RELATED CASES
                  </h3>
                  <div className="space-y-4">
                    {relatedCases.map((rc: Record<string, unknown> & { _id: { toString: () => string }; slug: string; motiveCategory: string; title: string; killerName: string; coverImage: string; }) => (
                      <Link
                        href={`/cases/${rc.slug}`}
                        key={rc._id.toString()}
                        className="block bg-[#111111] border border-[#2a2a2a] p-3 hover:border-[#8b0000] transition-all duration-300 group flex items-center gap-4 hover:shadow-[0_0_15px_rgba(139,0,0,0.1)]"
                      >
                        <div className="w-[56px] h-[72px] bg-[#1a1a1a] border border-[#2a2a2a] flex-shrink-0 overflow-hidden relative">
                          {rc.coverImage ? (
                            <Image
                              src={rc.coverImage}
                              alt={rc.title || "Related case cover"}
                              fill
                              unoptimized
                              className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#2a2a2a] group-hover:text-[#8b0000] transition-colors">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-body text-[#8b0000] text-[9px] uppercase tracking-widest font-bold mb-1">
                            {rc.motiveCategory}
                          </div>
                          <h4 className="font-heading text-[#e8e8e8] text-[15px] group-hover:text-white transition-colors leading-tight mb-1">
                            {rc.title}
                          </h4>
                          <div className="font-body text-[#888888] text-[11px] uppercase tracking-wider">
                            {rc.killerName || "UNKNOWN"}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* DECLASSIFY BUTTON */}
      {!isAdmin && mounted && (
        <button
          onClick={handleDeclassify}
          disabled={!isClassified || isAnimating}
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 uppercase font-body text-sm font-bold tracking-widest transition-all duration-300 ${
            !isClassified
              ? "bg-[#111111] text-[#888888] border border-[#2a2a2a] cursor-default"
              : "bg-[#8b0000] text-white hover:bg-[#a00000] shadow-[0_0_20px_rgba(139,0,0,0.4)] hover:scale-105 active:scale-95 animate-pulse-red"
          }`}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {isClassified ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              DECLASSIFY CASE FILE
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              CASE DECLASSIFIED
            </>
          )}
        </button>
      )}

      {/* Global styles for custom animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 20px rgba(139,0,0,0.4); }
          50% { box-shadow: 0 0 35px rgba(139,0,0,0.7); }
        }
        .animate-pulse-red {
          animation: pulse-red 2s infinite;
        }
        
        @keyframes redact-fade-out {
          0% { opacity: 1; }
          25% { opacity: 0; }
          50% { opacity: 0.8; }
          75% { opacity: 0; }
          100% { opacity: 0; }
        }
        .animate-redact-fade-out {
          animation: redact-fade-out 0.8s forwards;
        }
        
        @keyframes stamp-fade-out {
          0% { opacity: 0.85; transform: translate(-50%, -50%) rotate(-15deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(-30deg) scale(1.2); }
        }
        .animate-stamp-fade-out {
          animation: stamp-fade-out 0.8s forwards;
        }
        
        @keyframes text-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-text-fade-in {
          animation: text-fade-in 0.6s 0.8s both;
        }

        @keyframes text-flash {
          0% { color: #8b0000; text-shadow: 0 0 10px #8b0000; }
          100% { color: inherit; text-shadow: none; }
        }
        .animate-text-flash {
          animation: text-flash 0.6s 0.8s both;
        }
      `}} />
    </>
  );
}
