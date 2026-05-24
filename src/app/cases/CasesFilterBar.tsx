"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  currentSearch: string;
  currentMotive: string;
  currentType: string;
  currentYear: string;
}

export default function CasesFilterBar({ currentSearch, currentMotive, currentType, currentYear }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [motive, setMotive] = useState(currentMotive);
  const [type, setType] = useState(currentType);
  const [year, setYear] = useState(currentYear);
  
  const updateFilters = (newParams: { search?: string, motive?: string, type?: string, year?: string }) => {
    const s = newParams.search ?? search;
    const m = newParams.motive ?? motive;
    const t = newParams.type ?? type;
    const y = newParams.year ?? year;
    
    const params = new URLSearchParams();
    if (s) params.set("search", s);
    if (m && m !== "All") params.set("motive", m);
    if (t && t !== "All") params.set("type", t);
    if (y && y !== "All") params.set("year", y);
    
    router.push(`/cases?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({});
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="w-full md:w-1/3 flex group">
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cases, killers, keywords..." 
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#888888] focus:outline-none focus:border-[#8b0000] px-4 py-3 font-body text-sm transition-colors"
        />
        <button type="submit" className="bg-[#1a1a1a] border border-l-0 border-[#2a2a2a] px-4 text-[#888888] group-focus-within:border-[#8b0000] group-focus-within:text-[#8b0000] hover:bg-[#8b0000] hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
      </form>

      {/* Dropdowns */}
      <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
        <select 
          value={motive}
          onChange={(e) => { setMotive(e.target.value); updateFilters({ motive: e.target.value }); }}
          className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#e8e8e8] focus:outline-none focus:border-[#8b0000] px-3 py-3 font-body text-sm transition-colors flex-1 md:flex-none cursor-pointer"
        >
          <option value="All">Motive: All</option>
          <option value="Power">Power</option>
          <option value="Greed">Greed</option>
          <option value="Rage">Rage</option>
          <option value="Ideology">Ideology</option>
          <option value="Psychosis">Psychosis</option>
          <option value="Unknown">Unknown</option>
        </select>

        <select 
          value={type}
          onChange={(e) => { setType(e.target.value); updateFilters({ type: e.target.value }); }}
          className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#e8e8e8] focus:outline-none focus:border-[#8b0000] px-3 py-3 font-body text-sm transition-colors flex-1 md:flex-none cursor-pointer"
        >
          <option value="All">Type: All</option>
          <option value="Serial Killer">Serial Killer</option>
          <option value="Mass Murder">Mass Murder</option>
          <option value="Unsolved">Unsolved</option>
          <option value="Cult">Cult</option>
        </select>

        <select 
          value={year}
          onChange={(e) => { setYear(e.target.value); updateFilters({ year: e.target.value }); }}
          className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#e8e8e8] focus:outline-none focus:border-[#8b0000] px-3 py-3 font-body text-sm transition-colors flex-1 md:flex-none cursor-pointer"
        >
          <option value="All">Year: All</option>
          <option value="2020s">2020s</option>
          <option value="2010s">2010s</option>
          <option value="2000s">2000s</option>
          <option value="1990s">1990s</option>
          <option value="1980s">1980s</option>
          <option value="Older">Older</option>
        </select>
      </div>
    </div>
  );
}
