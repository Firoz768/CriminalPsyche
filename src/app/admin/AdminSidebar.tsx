"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "Cases",
      href: "/admin/cases",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    },
    { name: "New Case", href: "/admin/cases/new", icon: "M12 4v16m8-8H4" },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-[#0f0f0f] border-b border-[#2a2a2a] z-[110] flex items-center justify-between px-6">
        <Link
          href="/admin"
          className="font-heading text-[#8b0000] font-bold text-lg tracking-[0.2em] uppercase"
        >
          COMMAND CENTER
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-[#e8e8e8] hover:text-[#8b0000]"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar - Hidden on mobile unless drawer is open */}
      <aside
        className={`
        w-[240px] bg-[#0f0f0f] border-r border-[#2a2a2a] h-screen flex flex-col fixed left-0 top-0 z-[110] transition-transform duration-300
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}
      >
        <div className="p-6 border-b border-[#2a2a2a] hidden md:block">
          <Link
            href="/"
            className="font-heading text-[#8b0000] font-bold text-xl tracking-[0.2em] uppercase hover:text-white transition-colors block"
          >
            CriminalPsyche
          </Link>
          <div className="mt-4">
            <p className="font-body text-[#e8e8e8] text-sm font-semibold">
              {session?.user?.name || "Agent"}
            </p>
            <p className="font-body text-[#888888] text-[12px] uppercase tracking-widest mt-1">
              Administrator
            </p>
          </div>
        </div>

        {/* Mobile close button inside drawer */}
        <div className="md:hidden p-6 border-b border-[#2a2a2a] flex justify-between items-center">
          <div>
            <p className="font-body text-[#e8e8e8] text-sm font-semibold">
              {session?.user?.name || "Agent"}
            </p>
            <p className="font-body text-[#8b0000] text-[10px] uppercase tracking-widest mt-1">
              Administrator
            </p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#888888]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 font-body text-sm font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-[#1a1a1a] text-[#e8e8e8] border-l-[3px] border-[#8b0000]"
                    : "text-[#888888] hover:text-[#e8e8e8] hover:bg-[#1a1a1a] border-l-[3px] border-transparent"
                }`}
              >
                <svg
                  className="w-5 h-5 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d={link.icon}
                  />
                  {link.name === "Settings" && (
                    <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                  )}
                </svg>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#2a2a2a]">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 font-body text-[13px] font-bold text-[#8b0000] hover:text-white hover:bg-[#8b0000] transition-colors border border-transparent hover:border-[#8b0000] tracking-widest uppercase"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 z-[105]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
