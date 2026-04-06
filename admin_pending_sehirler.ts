// app/api/admin/courts/pending/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const courts = await prisma.court.findMany({
    where: { isApproved: false },
    include: {
      city: true,
      district: true,
      owner: { select: { fullName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courts);
}
