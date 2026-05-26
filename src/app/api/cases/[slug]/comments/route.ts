import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import Comment from "@/models/Comment";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    await dbConnect();
    
    // Find case by slug to get the caseId
    const caseFile = await Case.findOne({ slug: params.slug }).lean();
    if (!caseFile) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    // Fetch comments sorted by createdAt descending
    const comments = await Comment.find({ caseId: caseFile._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("API GET Comments Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "You must be logged in to comment" }, { status: 401 });
    }

    await dbConnect();

    // Find case by slug
    const caseFile = await Case.findOne({ slug: params.slug }).lean();
    if (!caseFile) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    const { body } = await req.json();

    if (!body || typeof body !== "string" || body.length < 3 || body.length > 1000) {
      return NextResponse.json({ message: "Comment body must be between 3 and 1000 characters." }, { status: 400 });
    }

    const newComment = await Comment.create({
      caseId: caseFile._id,
      userId: session.user.id,
      userName: session.user.name,
      body,
    });

    return NextResponse.json({ comment: newComment });
  } catch (error) {
    console.error("API POST Comment Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
