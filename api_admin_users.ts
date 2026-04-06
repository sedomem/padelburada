import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true, createdAt: true, isVerified: true, lastLogin: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { userId, role } = await req.json();
  const valid = ["user", "business_owner", "admin"];
  if (!valid.includes(role)) return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });

  const user = await prisma.user.update({ where: { id: Number(userId) }, data: { role } });
  return NextResponse.json(user);
}
