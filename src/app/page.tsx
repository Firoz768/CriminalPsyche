import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CriminalPsyche | The Criminal Mind Archive",
  description:
    "An interactive, classified database documenting the psychology, motives, and case files of the world's most disturbing criminal minds.",
};

export const revalidate = 60;

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default async function Home() {
  const baseUrl = getBaseUrl();

  // Fetch Stats
  const statsRes = await fetch(`${baseUrl}/api/stats`, {
    next: { revalidate: 60, tags: ["stats"] },
  }).catch(() => null);
  const stats = statsRes?.ok ? await statsRes.json() : null;

  // Fetch Featured Cases
  const featuredRes = await fetch(`${baseUrl}/api/cases/featured`, {
    next: { revalidate: 60, tags: ["featured"] },
  }).catch(() => null);
  const featuredData = featuredRes?.ok
    ? await featuredRes.json()
    : { cases: [] };
  const featuredCases = featuredData?.cases || [];

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* HERO SECTION */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Faint red radial gradient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[rgba(139,0,0,0.15)] rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 text-center px-4 w-full">
          <h1 className="font-heading font-bold text-[#e8e8e8] text-5xl md:text-[72px] leading-tight tracking-tight mb-4 drop-shadow-lg">
            INSIDE THE CRIMINAL MIND
          </h1>
          <p className="font-body text-[#888888] text-lg md:text-[18px] mb-12 max-w-2xl mx-auto">
            Documented cases. Psychological profiles. Unsolved patterns.
          </p>

          <div className="flex flex-col items-center">
            <Link
              href="/cases"
              className="inline-block bg-[#8b0000] text-white font-body text-sm font-bold tracking-widest uppercase px-[32px] py-[14px] hover:bg-[#a00000] transition-colors"
            >
              EXPLORE CASES
            </Link>
            {/* Thin horizontal red divider line */}
            <div className="w-16 h-[1px] bg-[#8b0000] mt-10"></div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#111111] py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 text-center">
          <div className="flex flex-col items-center">
            <span className="font-heading font-bold text-[#8b0000] text-4xl mb-1">
              {stats?.totalCases ?? "—"}
            </span>
            <span className="font-body text-[#888888] text-xs uppercase tracking-widest font-semibold">
              Documented Cases
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-heading font-bold text-[#8b0000] text-4xl mb-1">
              {stats?.psychologyProfiles ?? "—"}
            </span>
            <span className="font-body text-[#888888] text-xs uppercase tracking-widest font-semibold">
              Psychological Profiles
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-heading font-bold text-[#8b0000] text-4xl mb-1">
              {stats?.unsolvedPatterns ?? "—"}
            </span>
            <span className="font-body text-[#888888] text-xs uppercase tracking-widest font-semibold">
              Unsolved Patterns
            </span>
          </div>
        </div>
      </section>

      {/* FEATURED CASES SECTION */}
      {featuredCases.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-1 h-10 bg-[#8b0000]"></div>
            <h2 className="font-heading text-[#e8e8e8] text-[36px] tracking-wide m-0">
              FEATURED CASES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCases.map((c: { slug: string; coverImage?: string; motiveCategory?: string; title?: string; killerName?: string; summary?: string }) => (
              <div
                key={c.slug}
                className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 group hover:border-[#8b0000] transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,0,0,0.15)] flex flex-col h-full cursor-pointer relative overflow-hidden"
              >
                {/* Optional dark background image if coverImage exists */}
                {c.coverImage && (
                  <div
                    className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none bg-cover bg-center"
                    style={{ backgroundImage: `url(${c.coverImage})` }}
                  ></div>
                )}

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex">
                    <span className="bg-[#8b0000] text-white font-body text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                      {c.motiveCategory}
                    </span>
                  </div>
                  <h3 className="font-heading text-white text-[20px] mb-1 group-hover:text-[#8b0000] transition-colors">
                    {c.title}
                  </h3>
                  <p className="font-mono text-[#888888] text-[11px] uppercase tracking-wider mb-4">
                    AKA: {c.killerName}
                  </p>

                  <p className="font-body text-[#888888] text-[14px] leading-relaxed mb-8 flex-grow line-clamp-2">
                    {c.summary}
                  </p>
                  <Link
                    href={`/cases/${c.slug}`}
                    className="font-body font-bold text-[#8b0000] text-sm uppercase tracking-wider hover:text-white transition-colors mt-auto inline-flex items-center gap-2"
                  >
                    READ CASE <span className="text-lg">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
