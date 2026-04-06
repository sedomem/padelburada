import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTimeSlots } from "@/lib/utils";
import { parseISO, format } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courtId = Number(params.id);
    const dateStr = req.nextUrl.searchParams.get("date");
    if (!dateStr) return NextResponse.json({ error: "date gerekli" }, { status: 400 });

    const date = parseISO(dateStr);
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...

    // Check exception
    const exception = await prisma.courtException.findFirst({
      where: {
        courtId,
        exceptionDate: { gte: new Date(dateStr), lt: new Date(new Date(dateStr).getTime() + 86400000) },
      },
    });

    if (exception?.isClosed) {
      return NextResponse.json({ slots: [], closed: true });
    }

    // Get schedule for that day
    const schedule = await prisma.courtSchedule.findFirst({
      where: { courtId, dayOfWeek, isActive: true },
    });

    if (!schedule) {
      return NextResponse.json({ slots: [] });
    }

    const priceHour = exception?.priceHourOverride ?? schedule.priceHour;
    const timeSlots = generateTimeSlots(schedule.startTime, schedule.endTime);

    // Get existing reservations
    const reservations = await prisma.reservation.findMany({
      where: {
        courtId,
        reservationDate: { gte: new Date(dateStr), lt: new Date(new Date(dateStr).getTime() + 86400000) },
        status: { not: "cancelled" },
      },
      select: { startTime: true },
    });

    const bookedTimes = new Set(reservations.map((r) => r.startTime));
    const now = new Date();
    const isToday = format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

    const slots = timeSlots.map((time) => {
      const [h] = time.split(":").map(Number);
      const isPast = isToday && h <= now.getHours();
      return {
        time,
        available: !bookedTimes.has(time) && !isPast,
        price: priceHour,
      };
    });

    return NextResponse.json({ slots });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
