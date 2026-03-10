import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/cases — get all cases with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || undefined;
    const governorate = searchParams.get("governorate") || undefined;
    const status = searchParams.get("status") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const cases = await prisma.case.findMany({
      where: {
        isDeleted: false,
        status: status
          ? { equals: status as any }
          : { not: "PENDING_REVIEW" as any },
        governorate: governorate ? { equals: governorate } : undefined,
        createdAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
        OR: search
          ? [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { governorate: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
              { author: { email: { contains: search, mode: "insensitive" } } },
              { contacts: { name: { contains: search, mode: "insensitive" } } },
              {
                assistants: { name: { contains: search, mode: "insensitive" } },
              },
            ]
          : undefined,
      },
      include: {
        author: { select: { id: true, email: true } },
        contacts: true,
        assistants: true,
        images: true,
        comments: true,
        likes: true,
        dislikes: true,
        views: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cases);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST /api/cases — create a new case
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      governorate,
      city,
      latitude,
      longitude,
      contacts,
      assistants,
    } = body;

    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        governorate,
        city,
        latitude,
        longitude,
        authorId: user.userId,
        contacts: {
          create: contacts,
        },
        assistants: {
          create: assistants,
        },
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
