import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    
    if (!q.trim()) {
      return NextResponse.json({ cases: [] });
    }

    // Using regex for partial matching across fields as requested
    const regex = { $regex: q, $options: "i" };
    
    const query = {
      status: "published",
      $or: [
        { title: regex },
        { killerName: regex },
        { summary: regex },
        { body: regex },
        { psychologyProfile: regex },
        { behavioralPatterns: regex },
        { tags: regex },
        { region: regex },
      ]
    };

    const cases = await Case.find(query)
      .select("title slug killerName motiveCategory summary coverImage yearOfCrime region tags")
      .lean();

    // Sort by relevance: title matches first
    cases.sort((a, b) => {
      const aTitleMatch = a.title?.toLowerCase().includes(q.toLowerCase());
      const bTitleMatch = b.title?.toLowerCase().includes(q.toLowerCase());
      
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      return 0; // maintain original order for others
    });

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
