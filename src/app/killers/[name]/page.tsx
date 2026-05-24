import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import CaseCard from "@/components/CaseCard";

export const dynamic = "force-dynamic";

export default async function KillerProfilePage({ params }: { params: { name: string } }) {
  await dbConnect();
  
  const decodedName = decodeURIComponent(params.name);
  
  const cases = await Case.find({
    status: "published",
    killerName: { $regex: new RegExp(`^${decodedName}$`, "i") }
  }).sort({ createdAt: -1 }).lean();

  const mostRecentCase = cases[0];

  // Extract unique behavioral pattern bullet points
  const patternsSet = new Set<string>();
  cases.forEach((c: any) => {
    if (c.behavioralPatterns) {
      const lines = c.behavioralPatterns.split('\n').filter((l: string) => l.trim().length > 0);
      lines.forEach((line: string) => patternsSet.add(line.trim()));
    }
  });
  const behavioralPatterns = Array.from(patternsSet);

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20 pb-24">
      {/* HEADER */}
      <section className="bg-[#111111] border-b border-[#2a2a2a] py-16 px-6 text-center relative z-10">
        <span className="inline-block font-body text-[#8b0000] text-[12px] uppercase tracking-[0.25em] font-bold mb-4">
          KILLER PROFILE
        </span>
        <h1 className="font-heading text-[#e8e8e8] text-4xl md:text-[56px] font-bold uppercase tracking-tight mb-6 drop-shadow-md">
          {decodedName}
        </h1>
        <div className="w-24 h-[1px] bg-[#8b0000] mx-auto mb-6"></div>
        <p className="font-mono text-[#888888] text-[14px] uppercase tracking-widest mx-auto">
          {cases.length} documented {cases.length === 1 ? 'case' : 'cases'}
        </p>
      </section>

      {cases.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pt-16 mb-16">
          <div className="bg-[#111111] border border-[#2a2a2a] p-8 shadow-2xl relative overflow-hidden">
            
            {/* Background Accent */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#8b0000]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row gap-10 relative z-10">
              <div className="md:w-2/3">
                <h3 className="font-body text-[#8b0000] text-[12px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-[#8b0000]"></span> PSYCHOLOGICAL PROFILE
                </h3>
                <div className="font-body text-[#cccccc] text-[15px] leading-relaxed whitespace-pre-wrap mb-8">
                  {mostRecentCase.psychologyProfile || "Psychological analysis is currently unavailable for this subject."}
                </div>

                {behavioralPatterns.length > 0 && (
                  <div>
                    <h3 className="font-body text-[#8b0000] text-[12px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-[#8b0000]"></span> BEHAVIORAL PATTERNS
                    </h3>
                    <ul className="space-y-3">
                      {behavioralPatterns.map((pattern, idx) => (
                        <li key={idx} className="flex gap-3 text-[#cccccc] font-body text-[14px] leading-relaxed">
                          <span className="text-[#8b0000] mt-1.5 text-[10px]">■</span>
                          <span>{pattern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-[#2a2a2a] pt-6 md:pt-0 md:pl-8 flex flex-col items-start">
                <h3 className="font-body text-[#888888] text-[11px] uppercase tracking-[0.2em] font-bold mb-3">
                  PRIMARY MOTIVE
                </h3>
                <Link href={`/motives/${encodeURIComponent(mostRecentCase.motiveCategory || 'unknown')}`} className="inline-block bg-[#8b0000] text-white uppercase font-body text-[14px] font-bold px-4 py-2 tracking-widest shadow-[0_0_15px_rgba(139,0,0,0.4)] hover:bg-[#a00000] transition-colors mb-8">
                  {mostRecentCase.motiveCategory || "UNKNOWN"}
                </Link>

                <h3 className="font-body text-[#888888] text-[11px] uppercase tracking-[0.2em] font-bold mb-3">
                  ACTIVE REGIONS
                </h3>
                <div className="font-mono text-[#e8e8e8] text-[13px] uppercase">
                  {[...new Set(cases.map((c: any) => c.region).filter(Boolean))].join(", ") || "UNKNOWN"}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CASES GRID */}
      <section className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1.5 h-6 bg-[#8b0000]"></div>
          <h2 className="font-heading text-[#e8e8e8] text-[24px] uppercase tracking-wider m-0">DOCUMENTED CASES</h2>
        </div>
        
        {cases.length === 0 ? (
          <div className="text-center py-20 bg-[#111111]/30 border border-dashed border-[#2a2a2a]">
            <h3 className="font-heading text-[#888888] text-2xl">No Cases Found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((c: any) => (
              <CaseCard key={c._id.toString()} c={c} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
