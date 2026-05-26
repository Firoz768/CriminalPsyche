import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

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
    
    if (!body.evidenceItems || !Array.isArray(body.evidenceItems)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      params.id, 
      { evidenceItems: body.evidenceItems }, 
      { new: true }
    );
    
    if (!updatedCase) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    revalidatePath(`/cases/${updatedCase.slug}/evidence`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API PATCH Evidence Positions Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
