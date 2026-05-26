import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import mongoose from "mongoose";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "You must be logged in to like comments" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();
    
    const comment = await Comment.findById(params.id);
    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const hasLiked = comment.likedBy.some((id: mongoose.Types.ObjectId) => id.toString() === userId);

    if (hasLiked) {
      // Unlike
      comment.likedBy = comment.likedBy.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like
      comment.likedBy.push(userIdObj);
      comment.likes += 1;
    }

    await comment.save();

    return NextResponse.json({ likes: comment.likes, likedBy: comment.likedBy });
  } catch (error) {
    console.error("API POST Comment Like Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
