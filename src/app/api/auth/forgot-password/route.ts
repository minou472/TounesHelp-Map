import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/response";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "), 422);
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return errorResponse("No account found with this email. Please sign up.", 404);
    }

    const resetToken = signToken({ userId: user.id, email: user.email, type: "password-reset" }, "1h");
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/connexion?resetToken=${resetToken}`;

    console.info(
      `[FORGOT PASSWORD] Send reset instructions to ${email}. Reset URL: ${resetUrl}`
    );

    return successResponse({ message: "Password reset instructions have been sent to your email." });
  } catch (error) {
    console.error("[FORGOT PASSWORD]", error);
    return errorResponse("Internal server error", 500);
  }
}
