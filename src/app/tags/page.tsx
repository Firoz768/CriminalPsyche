import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  await dbConnect();
  
  const tagsAggregation = await Case.aggregate([
    { $match: { status: "published" } },
    { $unwind: "$tags" },
    { $group: { _id: { $toLower: "$tags" }, originalTag: { $first: "$tags" }, count: { $sum: 1 } } },
    { $project: { _id: 0, tag: "$originalTag", count: 1 } },
    { $sort: { tag: 1 } } // Sort alphabetically for the cloud
  ]);

  // Determine scaling for tag cloud
  const counts = tagsAggregation.map((t: { count: number }) => t.count);
  const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
  const minCount = counts.length > 0 ? Math.min(...counts) : 1;

  // Function to calculate font size between 13px and 22px
  const getFontSize = (count: number) => {
    if (maxCount === minCount) return 16;
    const ratio = (count - minCount) / (maxCount - minCount);
    const size = 13 + (ratio * (22 - 13));
    return Math.round(size);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* PAGE HEADER */}
      <section className="bg-[#111111] border-b border-[#2a2a2a] py-16 px-6 text-center">
        <h1 className="font-heading text-[#e8e8e8] text-4xl md:text-[48px] font-bold uppercase tracking-tight mb-4 drop-shadow-md">
          CASE TAGS
        </h1>
        <p className="font-body text-[#888888] text-[16px] max-w-2xl mx-auto mb-6">
          Browse cases by category and theme
        </p>
        <div className="w-16 h-[2px] bg-[#8b0000] mx-auto"></div>
      </section>

      {/* TAGS CLOUD SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        {tagsAggregation.length === 0 ? (
          <div className="text-center py-20 bg-[#111111]/30 border border-dashed border-[#2a2a2a]">
            <h3 className="font-heading text-[#888888] text-2xl">No Tags Found</h3>
            <p className="font-body text-[#555555] text-sm mt-2">Publish cases with tags to see them here.</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4 bg-[#111111] p-12 border border-[#2a2a2a] shadow-xl">
            {tagsAggregation.map((t: { tag: string; count: number }) => {
              const fontSize = getFontSize(t.count);
              return (
                <Link 
                  href={`/tags/${encodeURIComponent(t.tag)}`} 
                  key={t.tag}
                  style={{ fontSize: `${fontSize}px` }}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#888888] px-5 py-2.5 hover:bg-[#8b0000] hover:border-[#8b0000] hover:text-[#ffffff] hover:shadow-[0_0_15px_rgba(139,0,0,0.4)] transition-all duration-300 font-body uppercase tracking-wider font-semibold whitespace-nowrap"
                >
                  {t.tag} <span className="opacity-50 ml-1 text-[0.8em]">({t.count})</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
