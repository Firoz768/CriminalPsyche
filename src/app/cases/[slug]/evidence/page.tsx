"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface EvidenceItem {
  id: string;
  title: string;
  description?: string;
  type: "photo" | "document" | "weapon" | "note" | "map" | "profile";
  imageUrl?: string;
  x: number;
  y: number;
  connections: number[];
}

const typeColors = {
  photo: "#8b0000",
  document: "#1a3a7a",
  weapon: "#8b4500",
  note: "#6a5a00",
  map: "#1a5a1a",
  profile: "#6a1a7a",
};

export default function EvidenceBoardPage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const boardRef = useRef<HTMLDivElement>(null);
  
  const [caseFile, setCaseFile] = useState<{ _id: string; title: string; } | null>(null);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const caseRes = await fetch(`/api/cases/${params.slug}`);
        if (caseRes.ok) {
          const data = await caseRes.json();
          setCaseFile(data.caseFile);
          setEvidenceItems(data.caseFile.evidenceItems || []);
        }
      } catch (error) {
        console.error("Failed to fetch case", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [params.slug]);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault(); // Prevent text selection
    if (!boardRef.current) return;
    
    // Capture the pointer to ensure we still get events if mouse leaves the element
    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);
    
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    
    // Calculate new percentages
    let newX = ((e.clientX - boardRect.left) / boardRect.width) * 100;
    let newY = ((e.clientY - boardRect.top) / boardRect.height) * 100;

    // Constrain to 0-100
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    setEvidenceItems((prev) =>
      prev.map((item) =>
        item.id === draggingId ? { ...item, x: newX, y: newY } : item
      )
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      const target = e.target as HTMLElement;
      target.releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  const handleSave = async () => {
    if (!isAdmin || !caseFile?._id) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cases/${caseFile._id}/evidence-positions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidenceItems })
      });
      if (res.ok) {
        alert("Layout saved successfully.");
      } else {
        alert("Failed to save layout.");
      }
    } catch (error) {
      console.error("Save error", error);
      alert("Error saving layout.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#888888]">Loading evidence board...</div>;
  }

  if (!caseFile) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#888888]">Case not found.</div>;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 border-b border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-between px-6 z-50 flex-shrink-0">
        <Link href={`/cases/${params.slug}`} className="text-[#8b0000] hover:text-[#a00000] font-body text-[12px] font-bold uppercase tracking-widest flex items-center gap-2">
          <span>←</span> BACK TO CASE
        </Link>
        <h1 className="font-heading text-[#e8e8e8] text-[20px] absolute left-1/2 -translate-x-1/2 truncate max-w-[40%]">
          {caseFile.title}
        </h1>
        <div className="flex items-center gap-6">
          <span className="text-[#888888] font-body text-[12px] uppercase tracking-[0.2em] hidden md:block">
            EVIDENCE BOARD
          </span>
          {isAdmin && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#111111] border border-[#8b0000] text-[#8b0000] hover:bg-[#8b0000] hover:text-white transition-colors font-body text-[11px] font-bold uppercase tracking-widest px-4 py-2 disabled:opacity-50"
            >
              {saving ? "SAVING..." : "SAVE LAYOUT"}
            </button>
          )}
        </div>
      </div>

      {/* Board Area */}
      <div 
        ref={boardRef}
        className="flex-1 relative bg-[#0f0f0f] w-full h-full overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Connections Layer (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {evidenceItems.map((item) => {
            if (!item.connections || item.connections.length === 0) return null;
            return item.connections.map(targetIdx => {
              const targetItem = evidenceItems[targetIdx];
              if (!targetItem) return null;
              
              // Draw line from center of item to center of target item
              return (
                <line
                  key={`${item.id}-${targetItem.id}`}
                  x1={`${item.x}%`}
                  y1={`${item.y}%`}
                  x2={`${targetItem.x}%`}
                  y2={`${targetItem.y}%`}
                  stroke="#8b0000"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  strokeDasharray="4 4"
                />
              );
            });
          })}
        </svg>

        {/* Evidence Cards */}
        {evidenceItems.map((item) => (
          <div
            key={item.id}
            onPointerDown={(e) => handlePointerDown(e, item.id)}
            className="absolute bg-[#1a1a1a] border border-[#2a2a2a] w-[180px] p-[12px] rounded-sm shadow-[4px_4px_12px_rgba(0,0,0,0.5)] z-10 cursor-grab active:cursor-grabbing select-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)', // Center on coordinate
              borderTopColor: typeColors[item.type] || '#2a2a2a',
              borderTopWidth: '3px'
            }}
          >
            {/* Pushpin */}
            <div 
              className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] rounded-full shadow-sm"
              style={{ backgroundColor: typeColors[item.type] || '#888' }}
            />

            <div 
              className="font-body text-[10px] uppercase tracking-wider mb-2 font-bold"
              style={{ color: typeColors[item.type] || '#888' }}
            >
              {item.type}
            </div>

            {item.imageUrl && (
              <div className="w-full h-[100px] mb-2 relative bg-[#0a0a0a] border border-[#2a2a2a] pointer-events-none">
                <Image 
                  src={item.imageUrl} 
                  alt={item.title} 
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}

            <h3 className="font-body text-[#e8e8e8] text-[13px] font-bold leading-tight mt-2 pointer-events-none">
              {item.title}
            </h3>
            
            {item.description && (
              <p className="font-body text-[#888888] text-[11px] leading-[1.6] mt-1.5 pointer-events-none">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
