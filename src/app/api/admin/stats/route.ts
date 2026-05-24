import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const totalCases = await Case.countDocuments();
    const published = await Case.countDocuments({ status: "published" });
    const drafts = await Case.countDocuments({ status: "draft" });
    const totalUsers = await User.countDocuments();

    return NextResponse.json({ totalCases, published, drafts, totalUsers });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
