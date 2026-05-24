import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import CaseCard from "@/components/CaseCard";

export const dynamic = "force-dynamic";

export default async function TagDetailPage({ params }: { params: { tag: string } }) {
  await dbConnect();
  
  const decodedTag = decodeURIComponent(params.tag);
  
  const query = {
    status: "published",
    tags: { $regex: new RegExp(`^${decodedTag}$`, "i") }
  };

  const cases = await Case.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20 pb-24">
      {/* HEADER */}
      <section className="bg-[#111111] border-b border-[#2a2a2a] py-16 px-6 text-center">
        <h1 className="font-heading text-[#8b0000] text-3xl md:text-[42px] font-bold uppercase tracking-tight mb-4 drop-shadow-md">
          CASES TAGGED: <span className="text-[#e8e8e8] ml-2">&quot;{decodedTag}&quot;</span>
        </h1>
        <p className="font-mono text-[#888888] text-[14px] uppercase tracking-widest mx-auto mb-6">
          {cases.length} {cases.length === 1 ? 'case' : 'cases'} found
        </p>
        <div className="w-16 h-[2px] bg-[#8b0000] mx-auto"></div>
      </section>

      {/* CASES GRID */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        {cases.length === 0 ? (
          <div className="text-center py-24 bg-[#111111]/30 border border-dashed border-[#2a2a2a]">
            <h3 className="font-heading text-[#888888] text-2xl mb-2">No Cases Match This Tag</h3>
            <Link href="/tags" className="font-body text-[#8b0000] text-sm uppercase tracking-widest font-bold hover:text-white transition-colors">
              Return to Tags
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((c: { _id: { toString: () => string }; slug?: string; coverImage?: string; title?: string; motiveCategory?: string; killerName?: string; summary?: string; yearOfCrime?: number | string }) => (
              <CaseCard key={c._id.toString()} c={c} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
