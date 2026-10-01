import { Resend } from "resend";

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