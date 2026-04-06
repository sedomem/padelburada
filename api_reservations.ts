import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReservationConfirmation } from "@/lib/email";
import { formatDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const role = (session.user as any).role;

  const where = role === "admin" ? {} : { userId };
  const reservations = await prisma.reservation.findMany({
    where,
    include: { court: { include: { city: true, district: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);

    const {
      courtId, reservationDate, startTime, endTime, totalPrice,
      playerCount, extraServices, customerName, customerEmail,
      customerPhone, paymentStatus, paymentId,
    } = body;

    // Check slot still available
    const conflict = await prisma.reservation.findFirst({
      where: {
        courtId: Number(courtId),
        reservationDate: new Date(reservationDate),
        startTime,
        status: { not: "cancelled" },
      },
    });
    if (conflict) {
      return NextResponse.json({ error: "Bu saat artık müsait değil" }, { status: 409 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: session ? Number((session.user as any).id) : null,
        courtId: Number(courtId),
        reservationDate: new Date(reservationDate),
        startTime,
        endTime,
        totalPrice: Number(totalPrice),
        playerCount: Number(playerCount),
        extraServices,
        customerName,
        customerEmail,
        customerPhone,
        paymentStatus: paymentStatus || "paid",
        paymentId,
        paymentMethod: "fake",
        status: paymentStatus === "paid" ? "confirmed" : "pending",
      },
      include: { court: true },
    });

    // Send email
    await sendReservationConfirmation({
      to: customerEmail,
      customerName,
      courtName: reservation.court.name,
      date: formatDate(reservationDate),
      startTime,
      endTime,
      totalPrice: Number(totalPrice),
      reservationId: reservation.id,
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
