import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { courtSchema } from "@/lib/validations";
import slugify from "slugify";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const city = sp.get("city");
    const type = sp.get("type");
    const minPrice = sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined;
    const maxPrice = sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined;
    const q = sp.get("q");
    const sort = sp.get("sort") || "rating";
    const amenities = sp.get("amenities")?.split(",").filter(Boolean) || [];
    const page = Number(sp.get("page") || 1);
    const limit = Number(sp.get("limit") || 12);

    const where: any = { isApproved: true, status: "active" };

    if (city) where.city = { slug: city };
    if (type) where.courtType = type;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.minPriceHour = {};
      if (minPrice !== undefined) where.minPriceHour.gte = minPrice;
      if (maxPrice !== undefined) where.minPriceHour.lte = maxPrice;
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { city: { name: { contains: q, mode: "insensitive" } } },
        { district: { name: { contains: q, mode: "insensitive" } } },
      ];
    }
    if (amenities.includes("parking")) where.hasParking = true;
    if (amenities.includes("shower")) where.hasShower = true;
    if (amenities.includes("racket")) where.hasRacketRental = true;
    if (amenities.includes("lighting")) where.hasLighting = true;

    const orderBy: any =
      sort === "price_asc" ? { minPriceHour: "asc" }
      : sort === "price_desc" ? { minPriceHour: "desc" }
      : sort === "newest" ? { createdAt: "desc" }
      : { avgRating: "desc" };

    const [courts, total] = await Promise.all([
      prisma.court.findMany({
        where,
        include: { city: true, district: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.court.count({ where }),
    ]);

    return NextResponse.json({ courts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    const role = (session.user as any).role;
    if (role !== "business_owner" && role !== "admin")
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    const body = await req.json();
    const parsed = courtSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const userId = Number((session.user as any).id);
    const baseSlug = slugify(parsed.data.name, { lower: true, strict: true, locale: "tr" });
    let slug = baseSlug;
    let count = 0;
    while (await prisma.court.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++count}`;
    }

    const court = await prisma.court.create({
      data: { ...parsed.data, slug, ownerUserId: userId, isApproved: false, status: "pending" },
    });

    return NextResponse.json(court, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
