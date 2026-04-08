import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { verifyToken, extractTokenFromHeader, JwtPayload } from "./jwt";
import { prisma } from "./prisma";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getAuthUser(
  req: NextRequest
): Promise<JwtPayload | null> {
  const token = extractTokenFromHeader(req.headers.get("authorization"));
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(
  req: NextRequest
): Promise<JwtPayload | null> {
  const user = await getAuthUser(req);
  return user;
}

export async function requireAdmin(
  req: NextRequest
): Promise<JwtPayload | null> {
  const user = await getAuthUser(req);
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function getUserFromDb(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      bio: true,
      avatar: true,
      rating: true,
      helpedCount: true,
      receivedHelpCount: true,
      skills: true,
      casesCreated: true,
      createdAt: true,
    },
  });
}
