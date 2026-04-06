import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { courtId, reservationId } = body;
  if (!courtId) return NextResponse.json({ error: "courtId gerekli" }, { status: 400 });

  // One review per user per court
  const existing = await prisma.review.findFirst({ where: { userId, courtId: Number(courtId) } });
  if (existing) return NextResponse.json({ error: "Bu kort için zaten yorum yaptınız" }, { status: 409 });

  const review = await prisma.review.create({
    data: {
      userId,
      courtId: Number(courtId),
      reservationId: reservationId ? Number(reservationId) : undefined,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      isVerifiedPurchase: !!reservationId,
    },
    include: { user: true },
  });

  // Update court avg rating
  const agg = await prisma.review.aggregate({
    where: { courtId: Number(courtId) },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.court.update({
    where: { id: Number(courtId) },
    data: {
      avgRating: agg._avg.rating || 0,
      totalReviews: agg._count.rating,
    },
  });

  return NextResponse.json(review, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const { reviewId } = await req.json();

  const review = await prisma.review.findUnique({ where: { id: Number(reviewId) } });
  if (!review) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (review.userId !== userId && (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  await prisma.review.delete({ where: { id: Number(reviewId) } });

  // Recalc avg
  const agg = await prisma.review.aggregate({
    where: { courtId: review.courtId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.court.update({
    where: { id: review.courtId },
    data: { avgRating: agg._avg.rating || 0, totalReviews: agg._count.rating },
  });

  return NextResponse.json({ success: true });
}
