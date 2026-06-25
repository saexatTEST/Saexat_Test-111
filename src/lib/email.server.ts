import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";

const emailSchema = z.object({
  to: z.string().email(),
  guestName: z.string(),
  roomNumber: z.number(),
  roomCategory: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guestCount: z.number(),
  hotelName: z.string().default("Sayohat Hotel Tashkent"),
  hotelAddress: z.string().default("115A Buyuk Ipak Yuli St, Mirzo Ulug'bek district, Tashkent"),
});

const _sendBookingConfirmationEmailFn = createServerFn({ method: "POST" })
  .inputValidator((input) => emailSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

    if (!apiKey) {
      console.warn("[email] RESEND_API_KEY not set — skipping email");
      return { sent: false };
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const formatDate = (iso: string) => {
      try {
        return new Date(iso + "T00:00:00").toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      } catch {
        return iso;
      }
    };
    export const sendBookingConfirmationEmail = createServerOnlyFn(_sendBookingConfirmationEmailFn);
    
    const nights = Math.ceil(
      (new Date(data.checkOut).getTime() - new Date(data.checkIn).getTime()) /
        86400000
    );

    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Бронирование подтверждено</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1a24;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,#c9a84c,#e8c97a);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#0f0f13;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                ✅ Бронирование подтверждено
              </h1>
              <p style="margin:8px 0 0;color:#0f0f13;font-size:14px;opacity:0.75;">
                ${data.hotelName}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px;">

              <p style="color:#e2e2e2;font-size:16px;margin:0 0 24px;">
                Уважаемый(ая) <strong style="color:#c9a84c;">${data.guestName}</strong>,
              </p>
              <p style="color:#a0a0b0;font-size:14px;line-height:1.7;margin:0 0 28px;">
                Ваше бронирование в отеле <strong style="color:#e2e2e2;">${data.hotelName}</strong> успешно подтверждено. Ниже приведены детали вашего проживания.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:14px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="color:#6b6b85;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Номер комнаты</span>
                    <p style="margin:4px 0 0;color:#c9a84c;font-size:22px;font-weight:800;">${data.roomNumber}</p>
                    <p style="margin:2px 0 0;color:#a0a0b0;font-size:13px;">${data.roomCategory}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%">
                          <span style="color:#6b6b85;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Дата заезда</span>
                          <p style="margin:4px 0 0;color:#e2e2e2;font-size:15px;font-weight:600;">${formatDate(data.checkIn)}</p>
                          <p style="margin:2px 0 0;color:#6b6b85;font-size:12px;">с 14:00</p>
                        </td>
                        <td width="50%">
                          <span style="color:#6b6b85;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Дата выезда</span>
                          <p style="margin:4px 0 0;color:#e2e2e2;font-size:15px;font-weight:600;">${formatDate(data.checkOut)}</p>
                          <p style="margin:2px 0 0;color:#6b6b85;font-size:12px;">до 12:00</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%">
                          <span style="color:#6b6b85;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Кол-во ночей</span>
                          <p style="margin:4px 0 0;color:#e2e2e2;font-size:15px;font-weight:600;">${nights}</p>
                        </td>
                        <td width="50%">
                          <span style="color:#6b6b85;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Гостей</span>
                          <p style="margin:4px 0 0;color:#e2e2e2;font-size:15px;font-weight:600;">${data.guestCount}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:14px;border:1px solid rgba(255,255,255,0.07);padding:18px 24px;margin-bottom:28px;">
                <tr>
                  <td>
                    <span style="color:#6b6b85;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">📍 Адрес отеля</span>
                    <p style="margin:6px 0 0;color:#e2e2e2;font-size:14px;line-height:1.5;">${data.hotelAddress}</p>
                  </td>
                </tr>
              </table>

              <p style="color:#a0a0b0;font-size:13px;line-height:1.7;margin:0 0 8px;">
                Если у вас есть вопросы, свяжитесь с нами по телефону или посетите ресепшн отеля.
              </p>
              <p style="color:#a0a0b0;font-size:13px;line-height:1.7;margin:0;">
                Ждём вас! 🏨
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#12121a;padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;color:#3d3d52;font-size:12px;">
                ${data.hotelName} · ${data.hotelAddress}
              </p>
              <p style="margin:6px 0 0;color:#3d3d52;font-size:11px;">
                Это автоматическое письмо — не отвечайте на него.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      const { error } = await resend.emails.send({
        from,
        to: data.to,
        subject: `✅ Бронирование подтверждено — Номер ${data.roomNumber} · ${data.hotelName}`,
        html,
      });

      if (error) {
        console.error("[email] Resend error:", error);
        return { sent: false };
      }

      return { sent: true };
    } catch (err) {
      console.error("[email] unexpected error:", err);
      return { sent: false };
    }
  });

export const sendBookingConfirmationEmail = createServerOnlyFn(_sendBookingConfirmationEmailFn);