import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const games = await prisma.game.findMany({
    where: search
      ? {
          title: { contains: search },
        }
      : undefined,
    include: {
      _count: { select: { screenshots: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(games);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, developer, genre, thumbnail, robloxUrl } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const game = await prisma.game.create({
    data: { title, developer, genre, thumbnail, robloxUrl },
  });

  return NextResponse.json(game, { status: 201 });
}
