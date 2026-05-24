import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    await dbConnect();
    
    const currentCase = await Case.findOne({ slug: params.slug, status: "published" }).lean();
    if (!currentCase) {
      return NextResponse.json({ cases: [] });
    }

    const query = {
      _id: { $ne: currentCase._id },
      status: "published",
      $or: [
        { motiveCategory: currentCase.motiveCategory },
        { tags: { $in: currentCase.tags || [] } }
      ]
    };

    const relatedCases = await Case.find(query)
      .select("title slug killerName motiveCategory coverImage")
      .limit(3)
      .lean();

    return NextResponse.json({ cases: relatedCases });
  } catch (error) {
    console.error("Related Cases API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
