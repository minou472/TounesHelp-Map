import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAccessToken, createRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
    try {
    const { email, password } = await req.json();

    // 1. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return NextResponse.json(
            { error: "No account found with this email" },
            { status: 401 }
    );
    }

    // 2. Check if account is active
    if (!user.isActive) {
        return NextResponse.json(
            { error: "Your account has been blocked" },
            { status: 403 }
    );
    }

    // 3. Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return NextResponse.json(
            { error: "Incorrect password" },
            { status: 401 }
        );
    }

    // 4. Create tokens
    const accessToken  = createAccessToken({ userId: user.id, role: user.role });
    const refreshToken = createRefreshToken({ userId: user.id });

    // 5. Set cookies
    const response = NextResponse.json(
      { message: "Login successful", role: user.role },
      { status: 200 }
    );

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}