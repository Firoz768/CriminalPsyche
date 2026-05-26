import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InitialLoader from "@/components/InitialLoader";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CLASSIFIED - CriminalPsyche",
  description: "Classified crime file database",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} font-body antialiased bg-background text-text-primary selection:bg-primary/40 selection:text-white`}
      >
        <AuthProvider>
          <InitialLoader />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
            <Analytics />
            <SpeedInsights />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
