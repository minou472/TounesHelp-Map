import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/response";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "), 422);
    }

    const { name, email, password, phone } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse("Email already registered. Please log in.", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, phone, role: "USER" },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, createdAt: true,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return successResponse({ user, token }, 201);
  } catch (error) {
    console.error("[REGISTER]", error);
    return errorResponse("Internal server error", 500);
  }
}
