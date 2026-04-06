import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const role = (session.user as any).role;
  const courtId = Number(params.id);

  if (role !== "admin") {
    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (court?.ownerUserId !== userId)
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { exceptionDate, isClosed, priceHourOverride, note } = await req.json();

  const exception = await prisma.courtException.create({
    data: {
      courtId,
      exceptionDate: new Date(exceptionDate),
      isClosed,
      priceHourOverride: priceHourOverride ? Number(priceHourOverride) : null,
      note,
    },
  });

  return NextResponse.json(exception, { status: 201 });
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const exceptions = await prisma.courtException.findMany({
    where: { courtId: Number(params.id) },
    orderBy: { exceptionDate: "asc" },
  });
  return NextResponse.json(exceptions);
}
