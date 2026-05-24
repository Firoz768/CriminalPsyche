import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    // Fetch the 3 most recently published cases
    const featuredCases = await Case.find({ status: "published" })
      .select("title slug killerName motiveCategory summary coverImage tags")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return NextResponse.json({ cases: featuredCases });
  } catch (error) {
    console.error("Featured Cases API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
