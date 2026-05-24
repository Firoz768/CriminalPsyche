import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import mongoose from "mongoose";
import { revalidatePath, revalidateTag } from "next/cache";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();
    const caseFile = await Case.findById(params.id).lean();
    
    if (!caseFile) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({ case: caseFile });
  } catch (error) {
    console.error("API GET Case Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();
    const body = await req.json();
    
    const updatedCase = await Case.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!updatedCase) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/cases");
    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    revalidatePath(`/cases/${updatedCase.slug}`);
    revalidateTag("stats");
    revalidateTag("featured");

    return NextResponse.json({ case: updatedCase });
  } catch (error: unknown) {
    console.error("API PATCH Case Error:", error);
    const err = error as { code?: number };
    if (err.code === 11000) {
      return NextResponse.json({ message: "A case with this slug already exists." }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();
    await Case.findByIdAndDelete(params.id);
    
    revalidatePath("/");
    revalidatePath("/cases");
    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    revalidateTag("stats");
    revalidateTag("featured");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API DELETE Case Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
