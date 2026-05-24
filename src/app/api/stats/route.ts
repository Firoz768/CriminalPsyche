import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    // 1. Total Cases (published only)
    const totalCases = await Case.countDocuments({ status: "published" });

    // 2. Psychology Profiles (published, psychologyProfile exists and is not empty)
    const psychologyProfiles = await Case.countDocuments({
      status: "published",
      psychologyProfile: { $exists: true, $ne: "" },
    });

    // 3. Unsolved Patterns (published, motiveCategory is 'unknown')
    const unsolvedPatterns = await Case.countDocuments({
      status: "published",
      motiveCategory: "unknown",
    });

    return NextResponse.json({
      totalCases,
      psychologyProfiles,
      unsolvedPatterns,
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
