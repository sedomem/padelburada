// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const userId = Number((session.user as any).id);
  const { fullName, phone } = await req.json();
  const user = await prisma.user.update({ where: { id: userId }, data: { fullName, phone } });
  return NextResponse.json(user);
}

// ---- app/api/user/favorites/route.ts ----
// Save separately as app/api/user/favorites/route.ts

// ---- app/api/user/reviews/route.ts ----
// Save separately as app/api/user/reviews/route.ts
