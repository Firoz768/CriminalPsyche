import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Archives - CriminalPsyche",
  description:
    "Search the comprehensive database of case files, killers, motives, and psychological profiles.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
