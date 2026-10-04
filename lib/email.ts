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
        let sender = (from || process.env.EMAIL_FROM || "Silo Exhibitions <hello@siloexhibitions.com.ng>").trim();
        // Guard against any lingering siloexhibitions.com without .ng
        if (sender.includes("@siloexhibitions.com") && !sender.includes("@siloexhibitions.com.ng")) {
            sender = sender.replace("@siloexhibitions.com", "@siloexhibitions.com.ng");
        }

        const result = await resend.emails.send({
            from: sender,
            to,
            subject,
            html,
        });

        if (result.error) {
            console.error("[Email] Resend API error:", result.error);
            return { success: false, error: result.error };
        }

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
    baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || "https://siloexhibitions.com.ng"
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

export interface VendorReviewEmailPayload {
    recipientEmail: string;
    contactName: string;
    businessName: string;
    eventTitle: string;
    stallTitle: string;
    planName: string;
    dueNow: number | string;
    senderAccountName: string;
    bookingCode: string;
    category: string;
}

export function generateVendorReviewEmailHtml(data: VendorReviewEmailPayload): string {
    const formattedAmount = Number(data.dueNow || 0).toLocaleString();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vendor Application Under Review</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <!-- Brand Top Banner -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0015f8 0%, #1e3a8a 100%); padding: 32px 28px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Silo Campus Trade Fair</h1>
                            <p style="margin: 6px 0 0 0; color: #bfdbfe; font-size: 13px; font-weight: 500;">Exhibition Stand Registration</p>
                        </td>
                    </tr>

                    <!-- Main Body -->
                    <tr>
                        <td style="padding: 32px 28px;">
                            <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px;">
                                ⏳ APPLICATION UNDER REVIEW
                            </div>

                            <h2 style="margin: 0 0 14px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                                Registration &amp; Payment Received
                            </h2>

                            <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                                Dear <strong>${data.contactName}</strong>,
                            </p>

                            <p style="margin: 0 0 20px 0; font-size: 14.5px; line-height: 1.6; color: #334155;">
                                Thank you for applying for a vendor stand at <strong>${data.eventTitle}</strong> for your brand, <strong>${data.businessName}</strong>. We have received your application and bank transfer payment notification.
                            </p>

                            <!-- Review Status Callout -->
                            <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                <table width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #64748b;">Booking Reference:</td>
                                        <td style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0015f8; text-align: right;">${data.bookingCode}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #64748b;">Brand Name:</td>
                                        <td style="padding-bottom: 10px; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">${data.businessName}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #64748b;">Category:</td>
                                        <td style="padding-bottom: 10px; font-size: 13.5px; font-weight: 600; color: #0f172a; text-align: right;">${data.category}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #64748b;">Stand &amp; Plan:</td>
                                        <td style="padding-bottom: 10px; font-size: 13.5px; font-weight: 600; color: #0f172a; text-align: right;">${data.stallTitle} (${data.planName})</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #64748b;">Amount Due / Paid:</td>
                                        <td style="padding-bottom: 10px; font-size: 15px; font-weight: 800; color: #16a34a; text-align: right;">₦${formattedAmount}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #64748b;">Transfer Sender Name:</td>
                                        <td style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">${data.senderAccountName}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 13px; color: #64748b;">Transferred To:</td>
                                        <td style="font-size: 13px; font-weight: 600; color: #475569; text-align: right;">OPay (6105607790 - Silo campus tradefair)</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- What Happens Next -->
                            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #0f172a;">What happens next?</h3>
                            <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 13.5px; line-height: 1.6; color: #475569;">
                                <li>Our finance team is currently reconciling your transfer from <strong>${data.senderAccountName}</strong> against our OPay account statement.</li>
                                <li>Once verified, your stand status will be changed to <strong>APPROVED</strong>.</li>
                                <li>You will receive your official <strong>Exhibitor Stall Pass</strong> and booth credentials via email.</li>
                            </ul>

                            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                                If you have any questions or made this transfer with a different account name, please contact our support desk at <a href="mailto:hello@siloexhibitions.com.ng" style="color: #0015f8; text-decoration: underline;">hello@siloexhibitions.com.ng</a> or reach us on WhatsApp.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f1f5f9; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 12px; color: #64748b;">
                                &copy; ${new Date().getFullYear()} Silo Exhibitions. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

export async function sendVendorReviewEmail(payload: VendorReviewEmailPayload) {
    try {
        const html = generateVendorReviewEmailHtml(payload);
        const res = await sendEmail({
            to: payload.recipientEmail,
            subject: `⏳ Registration & Payment Received — ${payload.businessName} (${payload.eventTitle})`,
            html,
        });
        return res;
    } catch (err) {
        console.error("[Email] Failed to send vendor review email:", err);
        return { success: false, error: err };
    }
}

export interface VendorApprovedEmailPayload {
    recipientEmail: string;
    contactName: string;
    businessName: string;
    eventTitle: string;
    stallTitle: string;
    planName: string;
    paidAmount: number;
    bookingCode: string;
    eventVenue: string;
}

export function generateVendorApprovedEmailHtml(data: VendorApprovedEmailPayload): string {
    const formattedAmount = Number(data.paidAmount || 0).toLocaleString();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stand Approved &amp; Payment Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <!-- Brand Top Banner -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px 28px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Silo Campus Trade Fair</h1>
                            <p style="margin: 6px 0 0 0; color: #dcfce7; font-size: 13px; font-weight: 500;">Exhibition Stand Confirmed &amp; Approved</p>
                        </td>
                    </tr>

                    <!-- Main Body -->
                    <tr>
                        <td style="padding: 32px 28px;">
                            <div style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px;">
                                ✓ REGISTRATION APPROVED
                            </div>

                            <h2 style="margin: 0 0 14px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                                Your Stand is Confirmed!
                            </h2>

                            <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                                Dear <strong>${data.contactName}</strong>,
                            </p>

                            <p style="margin: 0 0 20px 0; font-size: 14.5px; line-height: 1.6; color: #334155;">
                                Great news! Your bank transfer payment of <strong>₦${formattedAmount}</strong> has been verified and confirmed by our finance team. Your stand reservation for <strong>${data.businessName}</strong> at <strong>${data.eventTitle}</strong> is now officially <strong>APPROVED</strong>.
                            </p>

                            <!-- Approved Details Card -->
                            <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                <table width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #166534;">Booking Pass Code:</td>
                                        <td style="padding-bottom: 10px; font-size: 15px; font-weight: 800; color: #15803d; text-align: right;">${data.bookingCode}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #166534;">Brand Name:</td>
                                        <td style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">${data.businessName}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #166534;">Stand Allocated:</td>
                                        <td style="padding-bottom: 10px; font-size: 13.5px; font-weight: 600; color: #0f172a; text-align: right;">${data.stallTitle} (${data.planName})</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #166534;">Amount Verified:</td>
                                        <td style="padding-bottom: 10px; font-size: 15px; font-weight: 800; color: #15803d; text-align: right;">₦${formattedAmount}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 13px; color: #166534;">Exhibition Venue:</td>
                                        <td style="font-size: 13px; font-weight: 600; color: #0f172a; text-align: right;">${data.eventVenue}</td>
                                    </tr>
                                </table>
                            </div>

                            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                                Keep your <strong>Booking Pass Code (${data.bookingCode})</strong> handy for badge collection on the exhibition setup day.
                            </p>

                            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                                If you need to make changes or have questions about logistics, electricity, or setup times, please email <a href="mailto:hello@siloexhibitions.com.ng" style="color: #15803d; text-decoration: underline;">hello@siloexhibitions.com.ng</a> or reach us on WhatsApp.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f1f5f9; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 12px; color: #64748b;">
                                &copy; ${new Date().getFullYear()} Silo Exhibitions. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

export async function sendVendorApprovedEmail(payload: VendorApprovedEmailPayload) {
    try {
        const html = generateVendorApprovedEmailHtml(payload);
        const res = await sendEmail({
            to: payload.recipientEmail,
            subject: `🎉 Payment Confirmed & Stand Approved — ${payload.businessName} (${payload.eventTitle})`,
            html,
        });
        return res;
    } catch (err) {
        console.error("[Email] Failed to send vendor approved email:", err);
        return { success: false, error: err };
    }
}