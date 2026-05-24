import { Suspense } from "react";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import CasesFilterBar from "./CasesFilterBar";
import CaseCard from "@/components/CaseCard";
import CasesSkeleton from "@/components/CasesSkeleton";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Case Files Archive - CriminalPsyche",
  description:
    "Browse the complete database of classified crime files, behavioral profiles, and psychological analyses.",
};

async function CasesGrid({
  search,
  motive,
  type,
  year,
  pageStr,
}: {
  search: string;
  motive: string;
  type: string;
  year: string;
  pageStr: string;
}) {
  await dbConnect();

  const page = parseInt(pageStr, 10) || 1;
  const limit = 12;

  const query: any = { status: "published" };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { killerName: { $regex: search, $options: "i" } },
      { summary: { $regex: search, $options: "i" } },
    ];
  }

  if (motive !== "All") {
    query.motiveCategory = motive.toLowerCase();
  }

  if (type !== "All") {
    query.tags = type;
  }

  if (year !== "All") {
    if (year === "2020s") query.yearOfCrime = { $gte: 2020, $lte: 2029 };
    else if (year === "2010s") query.yearOfCrime = { $gte: 2010, $lte: 2019 };
    else if (year === "2000s") query.yearOfCrime = { $gte: 2000, $lte: 2009 };
    else if (year === "1990s") query.yearOfCrime = { $gte: 1990, $lte: 1999 };
    else if (year === "1980s") query.yearOfCrime = { $gte: 1980, $lte: 1989 };
    else if (year === "Older") query.yearOfCrime = { $lt: 1980 };
  }

  const skip = (page - 1) * limit;

  const cases = await Case.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 border border-dashed border-[#2a2a2a] bg-[#111111]/30">
        <svg
          className="w-16 h-16 text-[#8b0000] mb-6 drop-shadow-[0_0_15px_rgba(139,0,0,0.5)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="font-heading text-[#e8e8e8] text-4xl mb-3">
          No cases found
        </h3>
        <p className="font-body text-[#888888] text-[15px]">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cases.map((c: any) => (
        <CaseCard key={c._id.toString()} c={c} />
      ))}
    </div>
  );
}

export default async function CasesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await dbConnect();

  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const motive =
    typeof searchParams.motive === "string" ? searchParams.motive : "All";
  const type =
    typeof searchParams.type === "string" ? searchParams.type : "All";
  const year =
    typeof searchParams.year === "string" ? searchParams.year : "All";
  const pageStr =
    typeof searchParams.page === "string" ? searchParams.page : "1";

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24 pt-20">
      {/* PAGE HEADER */}
      <section className="w-full bg-[#111111] border-y border-[#2a2a2a] py-16 relative z-10 text-center">
        <h1 className="font-heading text-[#e8e8e8] text-5xl md:text-[56px] font-bold tracking-tight mb-4 uppercase drop-shadow-md">
          CASE FILES
        </h1>
        <p className="font-body text-[#888888] text-[16px] max-w-2xl mx-auto mb-8 px-4">
          A documented archive of the world's most disturbing criminal minds
        </p>
        <div className="w-16 h-[2px] bg-[#8b0000] mx-auto"></div>
      </section>

      {/* FILTERS BAR */}
      <div className="sticky top-20 z-40 bg-[#0f0f0f] border-b border-[#2a2a2a] shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <CasesFilterBar
            currentSearch={search}
            currentMotive={motive}
            currentType={type}
            currentYear={year}
          />
        </div>
      </div>

      {/* CASES GRID */}
      <section className="max-w-7xl mx-auto px-6 pt-16 relative z-10">
        <Suspense
          fallback={<CasesSkeleton />}
          key={`${search}-${motive}-${type}-${year}-${pageStr}`}
        >
          <CasesGrid
            search={search}
            motive={motive}
            type={type}
            year={year}
            pageStr={pageStr}
          />
        </Suspense>
      </section>
    </main>
  );
}
