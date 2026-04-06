// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const [totalCourts, totalUsers, totalReservations, pendingCourts] = await Promise.all([
    prisma.court.count(),
    prisma.user.count(),
    prisma.reservation.count(),
    prisma.court.count({ where: { isApproved: false } }),
  ]);

  return NextResponse.json({ totalCourts, totalUsers, totalReservations, pendingCourts });
}

// ---- app/api/admin/courts/pending/route.ts ----
// Save separately as app/api/admin/courts/pending/route.ts
