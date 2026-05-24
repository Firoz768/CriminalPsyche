import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import CaseCard from "@/components/CaseCard";

export const dynamic = "force-dynamic";

const MOTIVE_DESCRIPTIONS: Record<string, string> = {
  power: "Crimes driven by the desire for dominance and control over others",
  greed: "Financially motivated crimes with calculated and premeditated execution",
  rage: "Emotionally triggered crimes characterized by intense uncontrolled violence",
  ideology: "Crimes committed in service of a belief system political or religious",
  psychosis: "Crimes rooted in detachment from reality and severe mental illness",
  unknown: "Cases where the true motive remains undetermined or disputed"
};

export default async function MotivePage({ params }: { params: { motive: string } }) {
  await dbConnect();
  
  const decodedMotive = decodeURIComponent(params.motive).toLowerCase();
  const description = MOTIVE_DESCRIPTIONS[decodedMotive] || MOTIVE_DESCRIPTIONS.unknown;
  
  const cases = await Case.find({
    status: "published",
    motiveCategory: decodedMotive
  }).sort({ createdAt: -1 }).lean();

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20 pb-24">
      {/* HEADER */}
      <section className="bg-[#111111] border-b border-[#2a2a2a] py-20 px-6 text-center relative z-10 overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8b0000]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <h1 className="font-heading text-[#8b0000] text-4xl md:text-[56px] font-bold uppercase tracking-tight mb-6 drop-shadow-md relative z-10">
          MOTIVE: <span className="text-[#e8e8e8]">{decodedMotive}</span>
        </h1>
        <p className="font-body text-[#888888] text-[16px] md:text-[18px] max-w-2xl mx-auto mb-10 leading-relaxed relative z-10">
          &quot;{description}&quot;
        </p>
        <div className="w-16 h-[1px] bg-[#8b0000] mx-auto mb-6 relative z-10"></div>
        <p className="font-mono text-[#555555] text-[13px] uppercase tracking-widest mx-auto relative z-10">
          {cases.length} documented {cases.length === 1 ? 'case' : 'cases'}
        </p>
      </section>

      {/* CASES GRID */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        {cases.length === 0 ? (
          <div className="text-center py-20 bg-[#111111]/30 border border-dashed border-[#2a2a2a]">
            <h3 className="font-heading text-[#888888] text-2xl">No Cases Found</h3>
            <p className="font-body text-[#555555] mt-2 text-sm uppercase tracking-widest">Awaiting archive entry</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((c: { _id: { toString: () => string }; [key: string]: unknown }) => (
              <CaseCard key={c._id.toString()} c={c} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
