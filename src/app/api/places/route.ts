import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, paginatedResponse, getPagination } from "@/lib/response";
import { z } from "zod";

const createPlaceSchema = z.object({
  name: z.string().min(2, "Name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  governorate: z.string().min(1, "Governorate is required"),
  latitude: z.number(),
  longitude: z.number(),
  type: z.enum(["shelter", "hospital", "food_bank", "school", "mosque", "church", "ngo", "other"]),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/places
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPagination(searchParams);
    const type = searchParams.get("type");
    const governorate = searchParams.get("governorate");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (governorate) where.governorate = governorate;
    where.isActive = true;

    const [places, total] = await Promise.all([
      prisma.place.findMany({ where, skip, take: limit, orderBy: { name: "asc" } }),
      prisma.place.count({ where }),
    ]);

    return paginatedResponse(places, total, page, limit);
  } catch (error) {
    console.error("[GET /places]", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/places — admin only
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return errorResponse("Admin access required", 403);
    }

    const body = await req.json();
    const parsed = createPlaceSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "), 422);
    }

    const place = await prisma.place.create({ data: parsed.data });
    return successResponse(place, 201);
  } catch (error) {
    console.error("[POST /places]", error);
    return errorResponse("Internal server error", 500);
  }
}
