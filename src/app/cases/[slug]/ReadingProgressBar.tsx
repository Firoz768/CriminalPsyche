"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const maxScroll = docHeight - winHeight;
      if (maxScroll <= 0) {
        setProgress(0);
      } else {
        setProgress((scrollY / maxScroll) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className="fixed top-[80px] left-0 h-[2px] bg-[#8b0000] z-50 transition-all duration-150 shadow-[0_0_10px_rgba(139,0,0,0.8)]" 
      style={{ width: `${progress}%` }}
    ></div>
  );
}
