// app/api/business/courts/[id]/schedules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function verifyOwner(courtId: number, userId: number, role: string) {
  if (role === "admin") return true;
  const court = await prisma.court.findUnique({ where: { id: courtId } });
  return court?.ownerUserId === userId;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const schedules = await prisma.courtSchedule.findMany({
    where: { courtId: Number(params.id) },
    orderBy: { dayOfWeek: "asc" },
  });
  return NextResponse.json(schedules);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const role = (session.user as any).role;
  const courtId = Number(params.id);

  if (!(await verifyOwner(courtId, userId, role)))
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { schedules } = await req.json();

  // Delete all existing, recreate
  await prisma.courtSchedule.deleteMany({ where: { courtId } });

  const created = await Promise.all(
    schedules
      .filter((s: any) => s.isActive)
      .map((s: any) =>
        prisma.courtSchedule.create({
          data: {
            courtId,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            priceHour: Number(s.priceHour),
            isActive: true,
          },
        })
      )
  );

  return NextResponse.json(created);
}
