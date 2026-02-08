import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      screenshots: {
        include: {
          category: true,
          tags: { include: { tag: { include: { tagGroup: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json(game);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, developer, genre, thumbnail, robloxUrl } = body;

  const game = await prisma.game.update({
    where: { id },
    data: { title, developer, genre, thumbnail, robloxUrl },
  });

  return NextResponse.json(game);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.game.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
