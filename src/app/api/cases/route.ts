import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const motive = searchParams.get("motive") || "";
    const year = searchParams.get("year") || "";
    const tag = searchParams.get("tag") || "";
    
    // Base query
    const query: Record<string, unknown> = { status: "published" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { killerName: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    if (motive && motive !== "All") {
      query.motiveCategory = motive.toLowerCase();
    }

    if (year && year !== "All") {
      if (year === "2020s") query.yearOfCrime = { $gte: 2020, $lte: 2029 };
      else if (year === "2010s") query.yearOfCrime = { $gte: 2010, $lte: 2019 };
      else if (year === "2000s") query.yearOfCrime = { $gte: 2000, $lte: 2009 };
      else if (year === "1990s") query.yearOfCrime = { $gte: 1990, $lte: 1999 };
      else if (year === "1980s") query.yearOfCrime = { $gte: 1980, $lte: 1989 };
      else if (year === "Older") query.yearOfCrime = { $lt: 1980 };
    }

    if (tag) {
      // Case-insensitive exact match in tags array
      query.tags = { $regex: new RegExp(`^${tag}$`, "i") };
    }

    const cases = await Case.find(query)
      .select("title slug killerName motiveCategory summary coverImage yearOfCrime tags")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
      
    return NextResponse.json({ cases });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
