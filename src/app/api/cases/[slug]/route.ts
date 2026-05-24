import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    await dbConnect();
    const caseFile = await Case.findOne({ slug: params.slug, status: "published" }).lean();
    
    if (!caseFile) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    // Find related cases with the same motive
    const relatedCases = await Case.find({ 
      motiveCategory: caseFile.motiveCategory, 
      _id: { $ne: caseFile._id },
      status: "published"
    }).limit(2).select("title slug motiveCategory killerName coverImage").lean();

    return NextResponse.json({ caseFile, relatedCases });
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
