import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const resId = Number(params.id);
  const { status } = await req.json();

  // Verify ownership
  const reservation = await prisma.reservation.findUnique({
    where: { id: resId },
    include: { court: true },
  });
  if (!reservation) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (reservation.court.ownerUserId !== userId && (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const updated = await prisma.reservation.update({
    where: { id: resId },
    data: { status },
  });
  return NextResponse.json(updated);
}
