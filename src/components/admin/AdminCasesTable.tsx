"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CaseRecord {
  _id: string;
  title?: string;
  killerName?: string;
  motiveCategory?: string;
  status?: string;
  yearOfCrime?: number | string;
}

export default function AdminCasesTable() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      console.log("Fetching /api/admin/cases...");
      // Ensure credentials (cookies) are sent
      const res = await fetch("/api/admin/cases", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        console.log("Admin Cases API returned data:", data);
        setCases(data.cases || []);
      } else {
        console.error("Failed to fetch cases", res.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const confirmDelete = (id: string) => {
    setCaseToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!caseToDelete) return;
    try {
      const res = await fetch(`/api/admin/cases/${caseToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCases((prev) => prev.filter((c) => c._id !== caseToDelete));
        showToast("Case permanently deleted from the archives");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalOpen(false);
      setCaseToDelete(null);
    }
  };

  if (loading) {
    return <div className="font-body text-[#888888] text-sm uppercase tracking-widest text-center py-20 animate-pulse">Loading Archive Index...</div>;
  }

  return (
    <>
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
            {cases.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-[#888888] font-body text-[15px]">No cases found in the archive.</td>
              </tr>
            ) : (
              cases.map((c: CaseRecord) => (
                <tr key={c._id} className="border-b border-[#1f1f1f] hover:bg-[#1a1a1a] transition-colors group">
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
                    <Link href={`/admin/cases/${c._id}/edit`} className="inline-block font-body text-[#888888] text-[10px] uppercase tracking-[0.2em] font-bold border border-[#2a2a2a] px-4 py-2 hover:border-[#8b0000] hover:text-[#e8e8e8] transition-colors">
                      EDIT
                    </Link>
                    <button 
                      onClick={() => confirmDelete(c._id)}
                      className="font-body text-[#8b0000] text-[10px] uppercase tracking-[0.2em] font-bold hover:text-red-500 transition-colors"
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE MODAL OVERLAY */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#000000] opacity-80" onClick={() => setDeleteModalOpen(false)}></div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 max-w-md w-full relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.8)] transform transition-transform scale-100">
            <h3 className="font-heading text-[#e8e8e8] text-2xl uppercase tracking-widest mb-3">DELETE CASE FILE</h3>
            <p className="font-body text-[#888888] text-sm mb-8">This action cannot be undone. The case will be permanently removed from the archives.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteModalOpen(false)} 
                className="flex-1 font-body text-[#888888] text-xs font-bold uppercase tracking-widest py-3 border border-[#2a2a2a] hover:text-[#e8e8e8] hover:border-[#888888] transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 font-body text-white text-xs font-bold uppercase tracking-widest py-3 bg-[#8b0000] hover:bg-[#a00000] transition-colors"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM RED TOAST */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-[#8b0000] border border-[#a00000] text-white font-body text-[13px] font-bold uppercase tracking-widest px-6 py-4 shadow-[0_0_20px_rgba(139,0,0,0.4)] z-[9999] animate-[slideIn_0.3s_ease-out]">
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}} />
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {toastMessage}
          </div>
        </div>
      )}
    </>
  );
}
