import { Resend } from "resend";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("[Email] RESEND_API_KEY is not set. Simulated send to:", to, "Subject:", subject);
        return { success: true, simulated: true };
    }

    try {
        const result = await resend.emails.send({
            from: from || "Silo Exhibitions <notifications@siloexhibitions.com>",
            to,
            subject,
            html,
        });
        return { success: true, result };
    } catch (err) {
        console.error("[Email] Failed to send email via Resend:", err);
        return { success: false, error: err };
    }
}

export interface NewEventEmailPayload {
    title: string;
    slug: string;
    venue: string;
    location?: string | null;
    startDate: Date | string;
    endDate?: Date | string | null;
    writeUp?: string | null;
}

export function generateNewEventEmailHtml(
    event: NewEventEmailPayload,
    recipientName?: string,
    baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || "https://siloexhibitions.com"
): string {
    const formattedStart = new Date(event.startDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const formattedEnd = event.endDate
        ? new Date(event.endDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : null;
    const dateStr = formattedEnd && formattedEnd !== formattedStart
        ? `${formattedStart} – ${formattedEnd}`
        : formattedStart;

    const eventUrl = `${baseUrl}/${event.slug}`;
    const vendorUrl = `${baseUrl}/${event.slug}/apply-vendor`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Exhibition Announced: ${event.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f8ff; margin: 0; padding: 30px 15px;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1.5px solid #dce6f5; overflow: hidden; box-shadow: 0 10px 30px rgba(10, 15, 46, 0.06);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #0a0f2e 0%, #0015f8 100%); padding: 32px 30px; text-align: center;">
        <span style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #93c5fd; display: block; margin-bottom: 6px;">SILO EXHIBITIONS</span>
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em;">New Exhibition Announced!</h1>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 32px 30px;">
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-top: 0;">
          Hello ${recipientName || "there"},
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          We are excited to announce our upcoming trade fair and exhibition:
        </p>

        <!-- Event Highlight Card -->
        <div style="background-color: #f8fbff; border: 1.5px solid #bfdbfe; border-left: 5px solid #0015f8; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h2 style="margin: 0 0 10px 0; color: #0a0f2e; font-size: 20px; font-weight: 800;">
            ${event.title}
          </h2>
          <table width="100%" border="0" cellpadding="4" cellspacing="0" style="font-size: 14px; color: #475569;">
            <tr>
              <td width="24" style="color: #0015f8;">📅</td>
              <td><strong>Date:</strong> ${dateStr}</td>
            </tr>
            <tr>
              <td width="24" style="color: #0015f8;">📍</td>
              <td><strong>Venue:</strong> ${event.venue} ${event.location ? `(${event.location})` : ""}</td>
            </tr>
          </table>
          ${
              event.writeUp
                  ? `<p style="margin: 14px 0 0 0; color: #64748b; font-size: 13.5px; line-height: 1.5; border-top: 1px dashed #cbd5e1; padding-top: 10px;">${event.writeUp.slice(0, 180)}...</p>`
                  : ""
          }
        </div>

        <p style="color: #334155; font-size: 14.5px; line-height: 1.6;">
          Stall reservations are officially open. Reserve your booth today to sell directly to thousands of visitors, or browse full exhibition schedules!
        </p>

        <!-- CTA Buttons -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 14px;">
          <tr>
            <td align="center">
              <a href="${vendorUrl}" style="display: inline-block; background-color: #0015f8; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(0, 21, 248, 0.3);">
                Book a Vendor Stall &rarr;
              </a>
              &nbsp;&nbsp;
              <a href="${eventUrl}" style="display: inline-block; background-color: #ffffff; color: #0a0f2e; text-decoration: none; padding: 12px 22px; border-radius: 999px; font-weight: 600; font-size: 13.5px; border: 1.5px solid #cbd5e1;">
                View Event Page
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0 0 6px 0;">Silo Exhibitions &bull; Connecting Exhibitors &amp; Buyers</p>
        <p style="margin: 0;">You received this email because you have an account with Silo Exhibitions.</p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
}

/**
 * Automatically sends Resend email to all registered users when an event is created.
 */
export async function sendNewEventBroadcastToAllUsers(event: NewEventEmailPayload) {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true },
        });

        if (!users || users.length === 0) {
            console.log("[Email Broadcast] No users found to notify.");
            return { totalUsers: 0, sentCount: 0, simulated: !process.env.RESEND_API_KEY };
        }

        console.log(`[Email Broadcast] Broadcasting new event "${event.title}" to ${users.length} users...`);

        let sentCount = 0;
        const subject = `🎉 New Exhibition Announced: ${event.title}`;

        // Send to users in concurrent batches of 5 to respect Resend rate limits
        const BATCH_SIZE = 5;
        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const batch = users.slice(i, i + BATCH_SIZE);
            await Promise.all(
                batch.map(async (user) => {
                    if (!user.email) return;
                    const html = generateNewEventEmailHtml(event, user.name);
                    const res = await sendEmail({
                        to: user.email,
                        subject,
                        html,
                    });
                    if (res.success) sentCount++;
                })
            );
        }

        console.log(`[Email Broadcast] Successfully sent to ${sentCount}/${users.length} users.`);
        return { totalUsers: users.length, sentCount, simulated: !process.env.RESEND_API_KEY };
    } catch (err) {
        console.error("[Email Broadcast] Failed to broadcast new event emails:", err);
        return { totalUsers: 0, sentCount: 0, error: err };
    }
}