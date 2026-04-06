import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { email, fullName, phone, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Bu email zaten kayıtlı" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const role = body.role === "business" ? "business_owner" : "user";

    const user = await prisma.user.create({
      data: { email, fullName, phone, passwordHash, role, isVerified: true },
    });

    return NextResponse.json({ id: user.id, email: user.email, fullName: user.fullName }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
