import nodemailer from "nodemailer";

function getTransporter() {
  if (process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }
  // Ethereal test account fallback
  return null;
}

export async function sendReservationConfirmation(params: {
  to: string;
  customerName: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  reservationId: number;
}) {
  try {
    let transporter = getTransporter();
    if (!transporter) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@padelburada.com",
      to: params.to,
      subject: `Rezervasyon Onayı - ${params.courtName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #131313; padding: 24px; text-align: center;">
            <h1 style="color: #C3F400; margin: 0;">PadelBurada</h1>
          </div>
          <div style="padding: 32px; background: #1C1B1B; color: #E5E2E1;">
            <h2>Rezervasyonunuz Onaylandı! 🎾</h2>
            <p>Merhaba <strong>${params.customerName}</strong>,</p>
            <p>Rezervasyonunuz başarıyla oluşturuldu.</p>
            <div style="background: #2A2A2A; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Kort:</strong> ${params.courtName}</p>
              <p><strong>Tarih:</strong> ${params.date}</p>
              <p><strong>Saat:</strong> ${params.startTime} - ${params.endTime}</p>
              <p><strong>Toplam:</strong> ₺${params.totalPrice}</p>
              <p><strong>Rezervasyon No:</strong> #${params.reservationId}</p>
            </div>
            <p>İyi maçlar dileriz!</p>
            <p>— PadelBurada Ekibi</p>
          </div>
        </div>
      `,
    });

    console.log("📧 Email gönderildi:", nodemailer.getTestMessageUrl(info));
    return true;
  } catch (err) {
    console.error("Email hatası:", err);
    return false;
  }
}
