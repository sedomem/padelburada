import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const courtId = Number(params.id);

  const existing = await prisma.favorite.findUnique({
    where: { userId_courtId: { userId, courtId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { userId_courtId: { userId, courtId } } });
    return NextResponse.json({ favorited: false });
  } else {
    await prisma.favorite.create({ data: { userId, courtId } });
    return NextResponse.json({ favorited: true });
  }
}
