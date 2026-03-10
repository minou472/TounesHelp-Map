/// <reference types="node" />
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { forgotPasswordSchema } from "@/lib/validations";

// POST /api/auth/forgot-password — request a password reset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input using Zod schema
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json(
        { error: errors || "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return success to prevent email enumeration
    // If the email exists, we'll send a reset link
    // If not, we just pretend it worked

    if (user) {
      // Generate reset token (valid for 1 hour)
      const resetToken = randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpires,
        },
      });

      // In production, you would send an email with the reset link
      // For now, we'll log it (or you could return it for testing)
      const resetLink = `/reset-password?token=${resetToken}`;
      console.log(`Password reset link for ${normalizedEmail}: ${resetLink}`);

      // In production, integrate with email service (e.g., SendGrid, Resend, Nodemailer)
      // await sendEmail({
      //   to: email,
      //   subject: "Password Reset Request",
      //   html: `<a href="${process.env.NEXT_PUBLIC_APP_URL}${resetLink}">Reset Password</a>`
      // });
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json(
      {
        message:
          "If an account exists with this email, you will receive a password reset link",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
