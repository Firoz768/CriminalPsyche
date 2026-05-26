import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
// Important to import Case so Mongoose knows about the model for population
import "@/models/Case";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Fetch all comments and populate the case title
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .populate("caseId", "title slug")
      .lean();

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("API GET Admin Comments Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
