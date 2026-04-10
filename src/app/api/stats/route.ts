import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";

// GET /api/stats — dashboard stats
export async function GET(req: NextRequest) {
  try {
    const totalCases = await prisma.tunisiaCase.count();
    const sufferingCases = await prisma.tunisiaCase.count({ where: { status: "SUFFERING" } });
    const helpingCases = await prisma.tunisiaCase.count({ where: { status: "HELPING" } });
    const resolvedCases = await prisma.tunisiaCase.count({ where: { status: "RESOLVED" } });
    const totalUsers = await prisma.user.count();
    const totalPlaces = await prisma.place.count();
    
    const recentCases = await prisma.tunisiaCase.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, governorate: true, createdAt: true },
    });
    
    const casesByGovernorate = await prisma.tunisiaCase.groupBy({
      by: ["governorate"],
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });
    
    const casesByCategory = await prisma.tunisiaCase.groupBy({
      by: ["category"],
      _count: { _all: true },
    });

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
