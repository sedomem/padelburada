import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { courtSchema } from "@/lib/validations";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

  const court = await prisma.court.findUnique({
    where: { id },
    include: { city: true, district: true, schedules: true },
  });

  if (!court) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(court);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const id = Number(params.id);
  const court = await prisma.court.findUnique({ where: { id } });
  if (!court) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const userId = Number((session.user as any).id);
  const role = (session.user as any).role;
  if (court.ownerUserId !== userId && role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = courtSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.court.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const id = Number(params.id);
  const court = await prisma.court.findUnique({ where: { id } });
  if (!court) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const userId = Number((session.user as any).id);
  const role = (session.user as any).role;
  if (court.ownerUserId !== userId && role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  await prisma.court.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
