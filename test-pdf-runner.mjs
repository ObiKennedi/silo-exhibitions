import { generateTermsPdf } from "./lib/terms-pdf.ts";
import fs from "node:fs";

const buf = generateTermsPdf({
    eventTitle: "Silo Trade Fair 2026",
    venue: "Main Campus Grounds",
    startDate: "2026-11-20",
    endDate: "2026-11-22",
    terms: [
        "All vendors must be set up by 8:00 AM.",
        "Strict no-refund policy applies to all booths. All stand reservation fees, deposits, and booth payments are strictly 100% non-refundable and non-cancellable under any circumstances.",
        "Cashless payments are mandatory."
    ],
    cashlessPolicy: "All exhibitors must provide POS or bank transfer options.",
    stalls: [
        { title: "Single Stand", size: "10ft x 10ft", price: 200000, description: "Standard stall" }
    ],
    slug: "silo-trade-fair-2026"
});

console.log("Generated buffer byte length:", buf.length);
fs.writeFileSync("./test_out.pdf", buf);
console.log("Wrote test_out.pdf successfully.");


