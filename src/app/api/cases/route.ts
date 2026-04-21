import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  getPagination
} from "@/lib/response";
import { z } from "zod";
import { CaseStatus, CaseCategory } from "@/lib/enums";

// Schema to validate new case data from frontend
const createCaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  fullDescription: z.string().optional(),
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
      CaseCategory.OTHER
    ])
    .default(CaseCategory.OTHER),
  victimName: z.string().min(2, "Victim name is required"),
  victimPhone: z.string().min(4, "Victim phone is required"),
  victimEmail: z.string().email().optional().or(z.literal("")),
  creatorName: z.string().min(2, "Creator name is required"),
  creatorPhone: z.string().min(4, "Creator phone is required"),
  creatorEmail: z.string().email("Creator email is required"),
  peopleAffected: z.number().min(1).default(1),
  images: z.array(z.string()).default([]),
  videoUrl: z.string().optional()
});

// GET /api/cases - Get list of cases with search/filter/pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPagination(searchParams);

    const status = searchParams.get("status") as CaseStatus | null;
    const governorate = searchParams.get("governorate");
    const category = searchParams.get("category") as CaseCategory | null;
    const search = searchParams.get("search");

    // Build search conditions for Prisma query
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (governorate) where.governorate = governorate;
    if (category) where.category = category;
    if (search) {
      // Search in multiple fields (SQLite simple contains search)
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { city: { contains: search } },
        { victimName: { contains: search } }
      ];
    }

    const cases = await prisma.tunisiaCase.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        _count: { select: { helpers: true } }
      }
    });

    const total = await prisma.tunisiaCase.count({ where });

    return paginatedResponse(cases, total, page, limit);
  } catch (error) {
    console.error("[GET /cases]", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/cases - Create new case (anyone can create, optional login)
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);

    const body = await req.json();
    const parsed = createCaseSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((e) => e.message).join(", ");
      console.error("[POST /cases] Validation error:", messages);
      return errorResponse(messages, 422);
    }

    const { images, fullDescription, ...caseDataWithoutImages } = parsed.data;

    const newCase = await prisma.tunisiaCase.create({
      data: {
        ...caseDataWithoutImages,
        fullDescription: fullDescription || caseDataWithoutImages.description,
        imagesJson: JSON.stringify(images),
        createdById: authUser?.userId || null,
        datePublished: new Date()
      }
    });

    // Increment user's casesCreated count if authenticated
    if (authUser?.userId) {
      await prisma.user.update({
        where: { id: authUser.userId },
        data: { casesCreated: { increment: 1 } }
      });
    }

    return successResponse(newCase, 201);
  } catch (error) {
    console.error("[POST /cases]", error);
    return errorResponse("Internal server error", 500);
  }
}
