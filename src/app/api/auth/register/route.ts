import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Automatically make the very first registered user an Admin
    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? "admin" : "user";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    return NextResponse.json(
      { message: "User registered successfully", user: { id: user._id, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
