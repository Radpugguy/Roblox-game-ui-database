import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tagGroups = await prisma.tagGroup.findMany({
    include: {
      tags: {
        include: {
          _count: { select: { screenshots: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(tagGroups);
}
