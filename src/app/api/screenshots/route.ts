import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category");
  const gameId = searchParams.get("gameId");

  const screenshots = await prisma.screenshot.findMany({
    where: {
      ...(categorySlug
        ? { category: { slug: categorySlug } }
        : {}),
      ...(gameId ? { gameId } : {}),
    },
    include: {
      game: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(screenshots);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { imageUrl, caption, gameId, categoryId } = body;

  if (!imageUrl || !gameId || !categoryId) {
    return NextResponse.json(
      { error: "imageUrl, gameId, and categoryId are required" },
      { status: 400 }
    );
  }

  const screenshot = await prisma.screenshot.create({
    data: { imageUrl, caption, gameId, categoryId },
    include: { game: true, category: true },
  });

  return NextResponse.json(screenshot, { status: 201 });
}
