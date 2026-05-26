import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import mongoose from "mongoose";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();
    
    const comment = await Comment.findById(params.id);
    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 });
    }

    const isAuthor = comment.userId.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Comment.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API DELETE Comment Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
