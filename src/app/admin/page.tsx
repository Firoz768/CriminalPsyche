import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import User from "@/models/User";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  // Direct database query (Next.js server component best practice)
  await dbConnect();
  
  const totalCases = await Case.countDocuments();
  const published = await Case.countDocuments({ status: "published" });
  const drafts = await Case.countDocuments({ status: "draft" });
  const totalUsers = await User.countDocuments();
  const recentCases = await Case.find().sort({ createdAt: -1 }).limit(10).lean();

  return (
    <main className="p-8 md:p-12 max-w-7xl mx-auto w-full">
      <header className="mb-14">
        <h1 className="font-heading text-[#e8e8e8] text-4xl md:text-[36px] font-bold tracking-tight mb-3 uppercase">
          COMMAND CENTER
        </h1>
        <p className="font-body text-[#888888] text-sm uppercase tracking-widest font-semibold">
          Manage your case files and content
        </p>
      </header>

      {/* STATS ROW */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 shadow-lg flex flex-col items-center justify-center text-center">
          <span className="font-heading font-bold text-[#8b0000] text-[48px] leading-none mb-3">{totalCases}</span>
          <span className="font-body text-[#888888] text-[11px] uppercase tracking-[0.2em] font-bold">Total Cases</span>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 shadow-lg flex flex-col items-center justify-center text-center">
          <span className="font-heading font-bold text-[#1a7a1a] text-[48px] leading-none mb-3">{published}</span>
          <span className="font-body text-[#888888] text-[11px] uppercase tracking-[0.2em] font-bold">Published</span>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 shadow-lg flex flex-col items-center justify-center text-center">
          <span className="font-heading font-bold text-[#888888] text-[48px] leading-none mb-3">{drafts}</span>
          <span className="font-body text-[#888888] text-[11px] uppercase tracking-[0.2em] font-bold">Drafts</span>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 shadow-lg flex flex-col items-center justify-center text-center">
          <span className="font-heading font-bold text-[#8b0000] text-[48px] leading-none mb-3">{totalUsers}</span>
          <span className="font-body text-[#888888] text-[11px] uppercase tracking-[0.2em] font-bold">Total Users</span>
        </div>
      </section>

      {/* RECENT CASES TABLE */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1.5 h-8 bg-[#8b0000]"></div>
          <h2 className="font-heading text-[#e8e8e8] text-[24px] uppercase tracking-wider m-0">RECENT CASES</h2>
        </div>

        <div className="bg-[#111111] border border-[#2a2a2a] overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#0f0f0f]">
                <th className="font-body text-[#888888] text-[12px] uppercase tracking-widest py-5 px-6 font-bold w-[35%]">Title</th>
                <th className="font-body text-[#888888] text-[12px] uppercase tracking-widest py-5 px-6 font-bold">Killer</th>
                <th className="font-body text-[#888888] text-[12px] uppercase tracking-widest py-5 px-6 font-bold">Motive</th>
                <th className="font-body text-[#888888] text-[12px] uppercase tracking-widest py-5 px-6 font-bold">Status</th>
                <th className="font-body text-[#888888] text-[12px] uppercase tracking-widest py-5 px-6 font-bold">Year</th>
                <th className="font-body text-[#888888] text-[12px] uppercase tracking-widest py-5 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#888888] font-body text-[15px]">No cases found in the archive.</td>
                </tr>
              ) : (
                recentCases.map((c: {
                  _id: { toString: () => string };
                  title?: string;
                  killerName?: string;
                  motiveCategory?: string;
                  status?: string;
                  yearOfCrime?: number | string;
                }) => (
                  <tr key={c._id.toString()} className="border-b border-[#1f1f1f] hover:bg-[#1a1a1a] transition-colors group">
                    <td className="py-4 px-6 font-heading text-[#cccccc] text-[18px] font-semibold group-hover:text-[#e8e8e8] transition-colors">
                      {c.title}
                    </td>
                    <td className="py-4 px-6 font-mono text-[#888888] text-[12px]">{c.killerName || "UNKNOWN"}</td>
                    <td className="py-4 px-6 font-body text-[#888888] text-[12px] uppercase tracking-wider font-semibold">{c.motiveCategory}</td>
                    <td className="py-4 px-6">
                      {c.status === "published" ? (
                        <span className="bg-green-950/40 text-green-500 border border-green-900/50 text-[10px] uppercase tracking-widest px-2.5 py-1 font-bold">PUBLISHED</span>
                      ) : (
                        <span className="bg-[#8b0000]/20 text-[#8b0000] border border-[#8b0000]/30 text-[10px] uppercase tracking-widest px-2.5 py-1 font-bold">DRAFT</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-[#888888] text-[12px]">{c.yearOfCrime || "----"}</td>
                    <td className="py-4 px-6 text-right space-x-4">
                      <Link href={`/admin/cases/${c._id}`} className="inline-block font-body text-[#888888] text-[10px] uppercase tracking-[0.2em] font-bold border border-[#2a2a2a] px-4 py-2 hover:border-[#8b0000] hover:text-[#8b0000] transition-colors">
                        EDIT
                      </Link>
                      <button className="font-body text-[#8b0000] text-[10px] uppercase tracking-[0.2em] font-bold hover:text-red-500 transition-colors">
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
