"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0f0f0f] border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left Side */}
          <Link
            href="/"
            className="font-heading font-bold text-[#8b0000] text-2xl tracking-[0.2em] uppercase"
          >
            CriminalPsyche
          </Link>

          {/* Desktop Center */}
          <div className="hidden md:flex gap-8">
            <Link
              href="/"
              className="font-body text-[#e8e8e8] hover:text-[#8b0000] transition-colors text-sm uppercase tracking-wider font-semibold"
            >
              Home
            </Link>
            <Link
              href="/cases"
              className="font-body text-[#e8e8e8] hover:text-[#8b0000] transition-colors text-sm uppercase tracking-wider font-semibold"
            >
              Cases
            </Link>
            <Link
              href="/tags"
              className="font-body text-[#e8e8e8] hover:text-[#8b0000] transition-colors text-sm uppercase tracking-wider font-semibold"
            >
              Tags
            </Link>
            <Link
              href="/search"
              className="font-body text-[#e8e8e8] hover:text-[#8b0000] transition-colors text-sm uppercase tracking-wider font-semibold"
            >
              Search
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-6">
            {status === "loading" ? (
              <div className="w-20 h-6 bg-[#2a2a2a] animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center gap-4">
                {session.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="font-body text-[#8b0000] hover:text-[#a00000] transition-colors text-[13px] uppercase tracking-widest font-bold border border-[#8b0000] px-3 py-1"
                  >
                    Admin Panel
                  </Link>
                )}
                <span className="font-body text-[#e8e8e8] text-sm tracking-wider">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="font-body text-[#888888] hover:text-[#e8e8e8] transition-colors text-sm uppercase tracking-wider border border-[#2a2a2a] hover:border-[#8b0000] px-4 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="font-body text-[#e8e8e8] hover:text-[#8b0000] transition-colors text-sm uppercase tracking-wider font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="font-body text-white bg-[#8b0000] hover:bg-[#a00000] transition-colors text-sm uppercase tracking-wider px-4 py-2 font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-[#e8e8e8] hover:text-[#8b0000] transition-colors"
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
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-[#000000] opacity-80"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer Content */}
          <div className="relative w-64 bg-[#0f0f0f] h-full border-r border-[#2a2a2a] flex flex-col pt-20 px-6 transform transition-transform">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-[#888888] hover:text-[#8b0000]"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <nav className="flex flex-col gap-6 mt-10">
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/"
                className="font-heading text-[#e8e8e8] text-xl uppercase tracking-widest hover:text-[#8b0000]"
              >
                Home
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/cases"
                className="font-heading text-[#e8e8e8] text-xl uppercase tracking-widest hover:text-[#8b0000]"
              >
                Cases
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/tags"
                className="font-heading text-[#e8e8e8] text-xl uppercase tracking-widest hover:text-[#8b0000]"
              >
                Tags
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/search"
                className="font-heading text-[#e8e8e8] text-xl uppercase tracking-widest hover:text-[#8b0000]"
              >
                Search
              </Link>
            </nav>

            <div className="mt-auto mb-10 pt-10 border-t border-[#2a2a2a]">
              {status === "loading" ? (
                <div className="w-full h-10 bg-[#2a2a2a] animate-pulse"></div>
              ) : session ? (
                <div className="flex flex-col gap-4">
                  <span className="font-body text-[#888888] text-sm uppercase tracking-widest">
                    {session.user?.name}
                  </span>
                  {session.user?.role === "admin" && (
                    <Link
                      onClick={() => setMobileMenuOpen(false)}
                      href="/admin"
                      className="font-body text-[#8b0000] hover:text-[#a00000] text-sm uppercase tracking-widest font-bold"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="font-body text-white bg-[#8b0000] py-3 text-sm uppercase tracking-widest font-bold w-full mt-4"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    href="/login"
                    className="font-body text-[#e8e8e8] border border-[#2a2a2a] py-3 text-center text-sm uppercase tracking-widest"
                  >
                    Login
                  </Link>
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    href="/register"
                    className="font-body text-white bg-[#8b0000] py-3 text-center text-sm uppercase tracking-widest"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
