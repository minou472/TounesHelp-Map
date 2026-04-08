import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";

// GET /api/stats — dashboard stats
export async function GET(req: NextRequest) {
  try {
    const [
      totalCases,
      sufferingCases,
      helpingCases,
      resolvedCases,
      totalUsers,
      totalPlaces,
      recentCases,
      casesByGovernorate,
      casesByCategory,
    ] = await Promise.all([
      prisma.tunisiaCase.count(),
      prisma.tunisiaCase.count({ where: { status: "SUFFERING" } }),
      prisma.tunisiaCase.count({ where: { status: "HELPING" } }),
      prisma.tunisiaCase.count({ where: { status: "RESOLVED" } }),
      prisma.user.count(),
      prisma.place.count(),
      prisma.tunisiaCase.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, governorate: true, createdAt: true },
      }),
      prisma.tunisiaCase.groupBy({
        by: ["governorate"],
        _count: { _all: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.tunisiaCase.groupBy({
        by: ["category"],
        _count: { _all: true },
      }),
    ]);

    const totalPeopleAffected = await prisma.tunisiaCase.aggregate({
      _sum: { peopleAffected: true },
    });

    return successResponse({
      overview: {
        totalCases,
        sufferingCases,
        helpingCases,
        resolvedCases,
        totalUsers,
        totalPlaces,
        totalPeopleAffected: totalPeopleAffected._sum.peopleAffected || 0,
        resolutionRate: totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0,
      },
      recentCases,
      casesByGovernorate: casesByGovernorate.map((g: any) => ({
        governorate: g.governorate,
        count: g._count._all,
      })),
      casesByCategory: casesByCategory.map((c: any) => ({
        category: c.category,
        count: c._count._all,
      })),
    });
  } catch (error) {
    console.error("[GET /stats]", error);
    return errorResponse("Internal server error", 500);
  }
}
