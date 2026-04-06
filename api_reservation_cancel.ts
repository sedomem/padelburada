import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO, differenceInHours } from "date-fns";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const role = (session.user as any).role;
  const resId = Number(params.id);

  const reservation = await prisma.reservation.findUnique({ where: { id: resId } });
  if (!reservation) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  // Ownership check
  if (role !== "admin" && reservation.userId !== userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  // 2-hour policy
  const reservationDateTime = new Date(reservation.reservationDate);
  const [h, m] = reservation.startTime.split(":").map(Number);
  reservationDateTime.setHours(h, m, 0, 0);
  const hoursUntil = differenceInHours(reservationDateTime, new Date());

  if (hoursUntil < 2 && role !== "admin") {
    return NextResponse.json({ error: "Rezervasyon saatinden 2 saat öncesine kadar iptal edilebilir" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  await prisma.reservation.update({
    where: { id: resId },
    data: {
      status: "cancelled",
      paymentStatus: "refunded",
      cancellationReason: body.reason || "Kullanıcı tarafından iptal edildi",
    },
  });

  return NextResponse.json({ success: true });
}
