import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import Link from "next/link";
import Image from "next/image";
import ReadingProgressBar from "./ReadingProgressBar";

import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  await dbConnect();
  const caseFile = await Case.findOne({
    slug: params.slug,
    status: "published",
  }).lean();
  if (!caseFile) return { title: "Case Not Found - CriminalPsyche" };

  return {
    title: `${caseFile.title} — CriminalPsyche`,
    description:
      caseFile.summary ||
      "Classified case file details and psychological profile.",
    openGraph: {
      images: caseFile.coverImage ? [caseFile.coverImage] : [],
    },
  };
}

export default async function CaseSinglePage({
  params,
}: {
  params: { slug: string };
}) {
  await dbConnect();

  const caseFile = await Case.findOne({
    slug: params.slug,
    status: "published",
  }).lean();

  if (!caseFile) {
    notFound();
  }

  // Related cases logic
  const relatedCases = await Case.find({
    _id: { $ne: caseFile._id },
    status: "published",
    $or: [
      { motiveCategory: caseFile.motiveCategory },
      { tags: { $in: caseFile.tags || [] } },
    ],
  })
    .limit(3)
    .lean();

  const tags = caseFile.tags || [];
  const isUnsolved = tags
    .map((t: string) => t.toLowerCase())
    .includes("unsolved");

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20 relative z-10">
      <ReadingProgressBar />

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16">
        {/* LEFT COLUMN - 65% on desktop */}
        <div className="w-full lg:w-[65%]">
          {/* HEADER */}
          <header className="mb-14">
            <Link
              href={`/motives/${encodeURIComponent((caseFile.motiveCategory || "unknown").toLowerCase())}`}
              className="inline-block bg-[#8b0000] text-white uppercase font-body text-xs font-bold px-3 py-1 tracking-widest mb-6 hover:bg-[#a00000] transition-colors"
            >
              {caseFile.motiveCategory || "UNKNOWN MOTIVE"}
            </Link>
            <h1 className="font-heading text-[#e8e8e8] text-4xl md:text-[52px] font-bold leading-tight mb-4 drop-shadow-md">
              {caseFile.title}
            </h1>
            <Link
              href={`/killers/${encodeURIComponent(caseFile.killerName || "unknown")}`}
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
              <div
                className="font-body text-[#cccccc] text-[16px] leading-[1.9] prose prose-invert prose-p:mb-6 prose-a:text-[#8b0000] prose-a:no-underline hover:prose-a:underline max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    caseFile.body ||
                    caseFile.summary ||
                    "<p>Body data missing or fully redacted.</p>",
                }}
              ></div>
            </section>

            <div className="w-full h-[1px] bg-[#2a2a2a]"></div>

            {/* PSYCHOLOGICAL PROFILE */}
            <section>
              <div className="font-body text-[#8b0000] text-[12px] uppercase tracking-[0.25em] font-bold mb-4 flex items-center gap-3">
                <span className="w-6 h-[1px] bg-[#8b0000]"></span> PSYCHOLOGICAL
                PROFILE
              </div>
              <h2 className="font-heading text-[#e8e8e8] text-[24px] mb-6">
                Mind of the Subject
              </h2>
              <div className="font-body text-[#cccccc] text-[16px] leading-[1.9] whitespace-pre-wrap">
                {caseFile.psychologyProfile ||
                  "Psychological analysis is currently incomplete or pending review from behavioral science unit."}
              </div>
            </section>

            <div className="w-full h-[1px] bg-[#2a2a2a]"></div>

            {/* MOTIVE ANALYSIS */}
            <section>
              <div className="font-body text-[#8b0000] text-[12px] uppercase tracking-[0.25em] font-bold mb-4 flex items-center gap-3">
                <span className="w-6 h-[1px] bg-[#8b0000]"></span> MOTIVE
                ANALYSIS
              </div>
              <h2 className="font-heading text-[#e8e8e8] text-[24px] mb-6 capitalize">
                {caseFile.motiveCategory || "Unknown"} Drive
              </h2>
              <div className="font-body text-[#cccccc] text-[16px] leading-[1.9] whitespace-pre-wrap">
                {caseFile.motiveSummary ||
                  `Analysis indicates the primary operational driver was ${caseFile.motiveCategory || "unknown factors"}.`}
              </div>
            </section>

            <div className="w-full h-[1px] bg-[#2a2a2a]"></div>

            {/* BEHAVIORAL PATTERNS */}
            <section>
              <div className="font-body text-[#8b0000] text-[12px] uppercase tracking-[0.25em] font-bold mb-4 flex items-center gap-3">
                <span className="w-6 h-[1px] bg-[#8b0000]"></span> BEHAVIORAL
                PATTERNS
              </div>
              <h2 className="font-heading text-[#e8e8e8] text-[24px] mb-6">
                Modus Operandi
              </h2>
              <div className="font-body text-[#cccccc] text-[16px] leading-[1.9] whitespace-pre-wrap">
                {caseFile.behavioralPatterns ||
                  "No clear behavioral patterns have been established at this time."}
              </div>
            </section>
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
                  <Link
                    href={`/killers/${encodeURIComponent(caseFile.killerName || "unknown")}`}
                    className="text-[#e8e8e8] hover:text-[#8b0000] transition-colors font-mono tracking-tight text-right w-1/2 line-clamp-1"
                  >
                    {caseFile.killerName || "UNKNOWN"}
                  </Link>
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
                  <span className="text-[#e8e8e8] font-mono text-right w-1/2 line-clamp-1">
                    {caseFile.region || "REDACTED"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-[#1f1f1f]">
                  <span className="text-[#888888] uppercase tracking-wider text-[11px] font-bold">
                    Motive
                  </span>
                  <Link
                    href={`/motives/${encodeURIComponent((caseFile.motiveCategory || "unknown").toLowerCase())}`}
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

            {/* RELATED CASES */}
            {relatedCases.length > 0 && (
              <div>
                <h3 className="font-heading text-[#e8e8e8] text-[24px] mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#8b0000]"></div>
                  RELATED CASES
                </h3>
                <div className="space-y-4">
                  {relatedCases.map((rc: {
                    _id: { toString: () => string };
                    slug: string;
                    coverImage?: string;
                    title?: string;
                    motiveCategory?: string;
                    killerName?: string;
                  }) => (
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
  );
}
