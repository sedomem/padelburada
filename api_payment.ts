import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { cardNumber, amount } = await req.json();

    if (!cardNumber || !amount) {
      return NextResponse.json({ error: "Kart numarası ve tutar gerekli" }, { status: 400 });
    }

    const cleaned = cardNumber.replace(/\s/g, "");

    // Simulate: success if card ends with 4242, fail otherwise
    const success = cleaned.startsWith("4242");

    await new Promise((r) => setTimeout(r, 800)); // Simulate network delay

    if (success) {
      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      return NextResponse.json({ success: true, paymentId, message: "Ödeme başarılı" });
    } else {
      return NextResponse.json(
        { success: false, message: "Ödeme reddedildi. Kart bilgilerinizi kontrol edin." },
        { status: 402 }
      );
    }
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
