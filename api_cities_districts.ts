// app/api/cities/[id]/districts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { name, slug } = await req.json();
  const district = await prisma.district.create({
    data: { name, slug, cityId: Number(params.id) },
  });
  return NextResponse.json(district, { status: 201 });
}

// ---- app/api/cities/[id]/route.ts ----
// Save separately as app/api/cities/[id]/route.ts
