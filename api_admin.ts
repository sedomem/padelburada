// app/api/admin/courts/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { approve } = await req.json();
  const court = await prisma.court.update({
    where: { id: Number(params.id) },
    data: { isApproved: approve, status: approve ? "active" : "pending" },
  });
  return NextResponse.json(court);
}

// ---- app/api/admin/users/route.ts ----
// Save this file separately as app/api/admin/users/route.ts
