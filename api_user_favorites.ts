import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const userId = Number((session.user as any).id);
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      court: {
        include: { city: true, district: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(favorites);
}
