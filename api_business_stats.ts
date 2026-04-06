import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, format, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const userId = Number((session.user as any).id);

  const courts = await prisma.court.findMany({ where: { ownerUserId: userId }, select: { id: true } });
  const courtIds = courts.map((c) => c.id);

  const [totalReservations, pendingReservations, allReservations] = await Promise.all([
    prisma.reservation.count({ where: { courtId: { in: courtIds } } }),
    prisma.reservation.count({ where: { courtId: { in: courtIds }, status: "pending" } }),
    prisma.reservation.findMany({
      where: { courtId: { in: courtIds }, status: { not: "cancelled" } },
      select: { totalPrice: true, reservationDate: true, startTime: true, createdAt: true },
    }),
  ]);

  const totalRevenue = allReservations.reduce((sum, r) => sum + r.totalPrice, 0);

  // Weekly data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStr = format(date, "yyyy-MM-dd");
    const dayRes = allReservations.filter((r) =>
      format(new Date(r.reservationDate), "yyyy-MM-dd") === dayStr
    );
    return {
      day: format(date, "EEE", { locale: tr }),
      reservations: dayRes.length,
      revenue: dayRes.reduce((s, r) => s + r.totalPrice, 0),
    };
  });

  // Hourly distribution
  const hourCounts: Record<string, number> = {};
  allReservations.forEach((r) => {
    const h = r.startTime?.split(":")[0];
    if (h) hourCounts[h] = (hourCounts[h] || 0) + 1;
  });
  const hourlyData = Object.entries(hourCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([hour, count]) => ({ hour: `${hour}:00`, count }));

  return NextResponse.json({
    totalCourts: courts.length,
    totalReservations,
    pendingReservations,
    totalRevenue,
    weeklyData,
    hourlyData,
  });
}
