import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";

export async function GET() {
  try {
    await dbConnect();
    
    const tagsAggregation = await Case.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      // Group by lowercase tag to prevent duplicates like "Cult" vs "cult"
      { $group: { _id: { $toLower: "$tags" }, originalTag: { $first: "$tags" }, count: { $sum: 1 } } },
      { $project: { _id: 0, tag: "$originalTag", count: 1 } },
      { $sort: { count: -1 } }
    ]);

    return NextResponse.json({ tags: tagsAggregation });
  } catch (error) {
    console.error("Tags API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
