export interface TelegramVendorNotificationPayload {
    bookingCode: string;
    eventTitle: string;
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    category: string;
    stallTitle: string;
    planName: string;
    dueNow: number | string;
    senderAccountName: string;
    productsSelling?: string;
    businessAddress?: string;
    socialHandle?: string;
}

export async function sendTelegramVendorAlert(payload: TelegramVendorNotificationPayload) {
    const botToken =
        process.env.TELEGRAM_BOT_TOKEN ||
        "8742336701:AAHR4QhpfvxElODKyQv5bZJ9LM__JqWz4Lo";
    const chatId =
        process.env.TELEGRAM_ADMIN_CHAT_ID ||
        "2074059490";

    if (!botToken || !chatId) {
        console.warn("[Telegram Alert] Bot token or chat ID is missing. Skipping alert.");
        return { success: false, error: "Missing bot credentials" };
    }

    const formattedAmount = Number(payload.dueNow || 0).toLocaleString();

    const htmlMessage = `
🚨 <b>NEW VENDOR REGISTRATION &amp; PAYMENT CLAIM</b>

📍 <b>Event:</b> ${escapeHtml(payload.eventTitle)}
🎪 <b>Stand:</b> ${escapeHtml(payload.stallTitle)}
📋 <b>Structure:</b> ${escapeHtml(payload.planName)}
💰 <b>Amount:</b> ₦${formattedAmount}

━━━━━━━━━━━━━━━━━━━━
🏷️ <b>Brand:</b> ${escapeHtml(payload.businessName)}
👤 <b>Owner / Contact:</b> ${escapeHtml(payload.contactName)}
📞 <b>WhatsApp / Phone:</b> ${escapeHtml(payload.phone)}
✉️ <b>Email:</b> ${escapeHtml(payload.email)}
📂 <b>Category:</b> ${escapeHtml(payload.category)}
${payload.socialHandle ? `🔗 <b>Social:</b> ${escapeHtml(payload.socialHandle)}\n` : ""}${payload.productsSelling ? `🛍️ <b>Products:</b> ${escapeHtml(payload.productsSelling)}\n` : ""}
━━━━━━━━━━━━━━━━━━━━
💳 <b>BANK TRANSFER CLAIM DETAILS:</b>
👤 <b>Sender Account Name:</b> <b>${escapeHtml(payload.senderAccountName)}</b>
🏦 <b>Transferred To:</b> OPay — 6105607790 (Silo campus tradefair)
🔢 <b>Booking Ref:</b> <code>${escapeHtml(payload.bookingCode)}</code>

⚠️ <i>Please verify credit alert in your OPay account matching <b>${escapeHtml(payload.senderAccountName)}</b> (₦${formattedAmount}) before approving this stand in the Admin Dashboard.</i>
`.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: htmlMessage,
                parse_mode: "HTML",
            }),
        });

        const data = await response.json();
        if (!data.ok) {
            console.warn("[Telegram Alert] Telegram API returned non-OK response:", data);
            // Fallback plain text send if HTML parsing had an issue
            if (data.description?.includes("can't parse entities")) {
                const plainText = htmlMessage.replace(/<[^>]+>/g, "");
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: plainText,
                    }),
                });
            }
            return { success: false, error: data.description };
        }

        console.log(`[Telegram Alert] Successfully alerted admin for booking ${payload.bookingCode}`);
        return { success: true, result: data.result };
    } catch (err) {
        console.error("[Telegram Alert] Failed to dispatch telegram notification:", err);
        return { success: false, error: err };
    }
}

function escapeHtml(text?: string): string {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
