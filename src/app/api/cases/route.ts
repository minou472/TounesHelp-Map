import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, paginatedResponse, getPagination } from "@/lib/response";
import { z } from "zod";
import { CaseStatus, CaseCategory } from "@/lib/enums";

const createCaseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  fullDescription: z.string().min(50, "Full description must be at least 50 characters"),
  governorate: z.string().min(1, "Governorate is required"),
  city: z.string().min(1, "City is required"),
  latitude: z.number(),
  longitude: z.number(),
  category: z
    .enum([
      CaseCategory.MEDICAL,
      CaseCategory.EDUCATION,
      CaseCategory.FOOD,
      CaseCategory.SHELTER,
      CaseCategory.TRANSPORTATION,
      CaseCategory.WATER,
      CaseCategory.OTHER,
    ])
    .default(CaseCategory.OTHER),
  victimName: z.string().min(2, "Victim name is required"),
  victimPhone: z.string().min(8, "Victim phone is required"),
  victimEmail: z.string().email().optional(),
  creatorName: z.string().min(2, "Creator name is required"),
  creatorPhone: z.string().min(8, "Creator phone is required"),
  creatorEmail: z.string().email("Creator email is required"),
  peopleAffected: z.number().min(1).default(1),
  images: z.array(z.string()).default([]),
  videoUrl: z.string().optional(),
});

// GET /api/cases — list all cases with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPagination(searchParams);

    const status = searchParams.get("status") as CaseStatus | null;
    const governorate = searchParams.get("governorate");
    const category = searchParams.get("category") as CaseCategory | null;
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (governorate) where.governorate = governorate;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { victimName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [cases, total] = await Promise.all([
      prisma.tunisiaCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
          _count: { select: { helpers: true } },
        },
      }),
      prisma.tunisiaCase.count({ where }),
    ]);

    return paginatedResponse(cases, total, page, limit);
  } catch (error) {
    console.error("[GET /cases]", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/cases — create new case (auth required)
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required", 401);

    const body = await req.json();
    const parsed = createCaseSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "), 422);
    }

    const caseData = parsed.data;

    const newCase = await prisma.tunisiaCase.create({
      data: {
        ...caseData,
        createdById: authUser.userId,
        datePublished: new Date(),
      },
    });

    // Increment user's casesCreated count
    await prisma.user.update({
      where: { id: authUser.userId },
      data: { casesCreated: { increment: 1 } },
    });

    return successResponse(newCase, 201);
  } catch (error) {
    console.error("[POST /cases]", error);
    return errorResponse("Internal server error", 500);
  }
}
