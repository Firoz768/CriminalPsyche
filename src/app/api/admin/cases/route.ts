import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import { revalidatePath, revalidateTag } from "next/cache";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const cases = await Case.find()
      .select("title slug killerName motiveCategory status yearOfCrime createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Admin Cases API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    
    body.createdBy = session.user.id;
    
    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    const newCase = await Case.create(body);

    revalidatePath("/");
    revalidatePath("/cases");
    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    revalidateTag("stats");
    revalidateTag("featured");

    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (error: any) {
    console.error("Admin Create Case API Error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ message: "A case with this slug already exists." }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
