import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cities = await prisma.city.findMany({
    include: { districts: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(cities);
}

export async function POST(req: Request) {
  const { name, slug } = await req.json();
  const city = await prisma.city.create({ data: { name, slug } });
  return NextResponse.json(city, { status: 201 });
}
