/**
 * Pure TypeScript PDF generator for Silo Exhibitions Terms & Conditions.
 * Conforms to PDF 1.4 standard without external dependencies.
 */

interface TermsPdfOptions {
    eventTitle: string;
    venue: string;
    startDate: string;
    endDate?: string;
    terms: string[];
    cashlessPolicy?: string;
    stalls?: {
        title: string;
        size: string;
        price?: number;
        description?: string;
    }[];
    slug: string;
}

// Sanitize ASCII text for PDF literal strings (escape (, ), \)
function escapePdfText(str: string | undefined | null): string {
    if (!str) return "";
    return String(str)
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        // Replace unicode quotation marks and em dashes with standard ASCII
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/\u20A6/g, "NGN ") // Naira symbol to NGN
        .replace(/[^\x20-\x7E]/g, " "); // Strip other non-printable ASCII
}

// Word-wrap text into lines with a maximum character width
function wrapText(text: string, maxChars = 85): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
        if (!word) continue;
        if (currentLine.length + word.length + 1 > maxChars) {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = currentLine ? `${currentLine} ${word}` : word;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

export function generateTermsPdf(options: TermsPdfOptions): Buffer {
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const leftMargin = 45;
    const contentWidth = pageWidth - leftMargin * 2;

    // We will collect streams for each page
    const pageStreams: string[] = [];
    let currentStream = "";
    let currentY = pageHeight - 50;

    const startNewPage = () => {
        if (currentStream) {
            pageStreams.push(currentStream);
        }
        currentStream = "";
        currentY = pageHeight - 50;
    };

    const checkPageBreak = (neededHeight: number) => {
        if (currentY - neededHeight < 60) {
            startNewPage();
            // Draw continuing header on subsequent pages
            currentStream += `
0.04 0.09 0.18 rg
BT /F2 9 Tf ${leftMargin} ${currentY} Td (${escapePdfText(options.eventTitle)} - Terms & Conditions) Tj ET
0.7 0.75 0.85 RG 0.5 w
${leftMargin} ${currentY - 6} m ${leftMargin + contentWidth} ${currentY - 6} l S
`;
            currentY -= 26;
        }
    };

    // --- PAGE 1: HEADER & BANNER ---
    // Blue decorative top bar
    currentStream += `
0.0 0.08 0.97 rg
${leftMargin} ${currentY - 4} ${contentWidth} 4 re f
`;
    currentY -= 22;

    // Brand Title
    currentStream += `
0.0 0.08 0.97 rg
BT /F2 16 Tf ${leftMargin} ${currentY} Td (SILO EXHIBITIONS) Tj ET
`;
    currentY -= 16;

    // Document Title
    currentStream += `
0.04 0.06 0.18 rg
BT /F2 14 Tf ${leftMargin} ${currentY} Td (OFFICIAL EXHIBITOR TERMS, CONDITIONS & STAND PLANS) Tj ET
`;
    currentY -= 18;

    // Event Info Box
    const dateStr = options.endDate && options.endDate !== options.startDate
        ? `${options.startDate} to ${options.endDate}`
        : options.startDate;

    currentStream += `
0.96 0.97 0.99 rg
0.82 0.88 0.96 RG 1 w
${leftMargin} ${currentY - 36} ${contentWidth} 36 re b
0.1 0.2 0.5 rg
BT /F2 10 Tf ${leftMargin + 12} ${currentY - 14} Td (Event: ${escapePdfText(options.eventTitle)}) Tj ET
0.3 0.35 0.45 rg
BT /F1 9 Tf ${leftMargin + 12} ${currentY - 28} Td (Venue: ${escapePdfText(options.venue)}  |  Dates: ${escapePdfText(dateStr)}) Tj ET
`;
    currentY -= 54;

    // --- SECTION 1: TERMS & CONDITIONS ---
    checkPageBreak(30);
    currentStream += `
0.0 0.08 0.97 rg
BT /F2 11 Tf ${leftMargin} ${currentY} Td (1. OFFICIAL EXHIBITOR RULES & TERMS) Tj ET
0.8 0.85 0.92 RG 0.5 w
${leftMargin} ${currentY - 4} m ${leftMargin + contentWidth} ${currentY - 4} l S
`;
    currentY -= 18;

    const termsToRender = options.terms.length > 0
        ? options.terms
        : [
            "Stand Setup & Access: Vendors must complete booth setup between 7:30 AM and 8:30 AM each morning. Stands must remain active and staffed until closing time daily.",
            "Stand Plans & Allocation: Reserved booth space is guaranteed upon successful payment of the chosen stand plan. Vendors must operate strictly within assigned dimensions.",
            "Cashless Payment Compliance: Vendors must offer digital payments (POS terminal, direct bank transfer, or QR paypoint) to buyers for fast queues and seamless audits.",
            "Booth Cleanliness & Safety: Exhibitors must keep their assigned space clean, hazard-free, and dispose of packaging in designated bins. Open flames are prohibited without clearance.",
            "Strict No-Cancellation & No-Refund Policy: There is no cancellation or refund plan whatsoever. All stand reservation fees, deposits, and booth payments are strictly 100% non-refundable and non-cancellable under any circumstances.",
        ];

    termsToRender.forEach((term, idx) => {
        const fullText = `${idx + 1}. ${term}`;
        const wrapped = wrapText(fullText, 88);
        checkPageBreak(wrapped.length * 13 + 8);

        wrapped.forEach((line, lineIdx) => {
            const fontName = lineIdx === 0 ? "/F2" : "/F1";
            currentStream += `
0.15 0.2 0.25 rg
BT ${fontName} 9.5 Tf ${leftMargin + 6} ${currentY} Td (${escapePdfText(line)}) Tj ET
`;
            currentY -= 13;
        });
        currentY -= 5;
    });

    // --- SECTION 2: CASHLESS & DIGITAL PAYMENT POLICY ---
    if (options.cashlessPolicy) {
        checkPageBreak(40);
        currentY -= 6;
        currentStream += `
0.0 0.08 0.97 rg
BT /F2 11 Tf ${leftMargin} ${currentY} Td (2. CASHLESS & DIGITAL PAYMENT POLICY) Tj ET
0.8 0.85 0.92 RG 0.5 w
${leftMargin} ${currentY - 4} m ${leftMargin + contentWidth} ${currentY - 4} l S
`;
        currentY -= 18;

        const wrappedPolicy = wrapText(options.cashlessPolicy, 88);
        wrappedPolicy.forEach((line) => {
            checkPageBreak(14);
            currentStream += `
0.15 0.2 0.25 rg
BT /F1 9.5 Tf ${leftMargin + 6} ${currentY} Td (${escapePdfText(line)}) Tj ET
`;
            currentY -= 13;
        });
        currentY -= 8;
    }

    // --- SECTION 3: STALL PLANS & PAYMENT OPTIONS ---
    if (options.stalls && options.stalls.length > 0) {
        checkPageBreak(40);
        currentY -= 6;
        currentStream += `
0.0 0.08 0.97 rg
BT /F2 11 Tf ${leftMargin} ${currentY} Td (3. CONFIGURED STAND PLANS & PACKAGES) Tj ET
0.8 0.85 0.92 RG 0.5 w
${leftMargin} ${currentY - 4} m ${leftMargin + contentWidth} ${currentY - 4} l S
`;
        currentY -= 18;

        options.stalls.forEach((stall) => {
            const priceText = stall.price ? `Price: NGN ${stall.price.toLocaleString()}` : "Price: Contact Organizers";
            const stallHeader = `${stall.title} (${stall.size}) - ${priceText}`;
            checkPageBreak(36);

            // Stall card box
            currentStream += `
0.97 0.98 1.0 rg
0.85 0.9 0.96 RG 0.5 w
${leftMargin + 6} ${currentY - 26} ${contentWidth - 12} 26 re b
0.04 0.09 0.18 rg
BT /F2 9.5 Tf ${leftMargin + 14} ${currentY - 11} Td (${escapePdfText(stallHeader)}) Tj ET
0.4 0.45 0.5 rg
BT /F1 8.5 Tf ${leftMargin + 14} ${currentY - 22} Td (${escapePdfText(stall.description || "Official vendor space allocation.")}) Tj ET
`;
            currentY -= 34;
        });
    }

    // --- SECTION 4: SIGN-OFF & ACKNOWLEDGMENT ---
    checkPageBreak(65);
    currentY -= 10;
    currentStream += `
0.96 0.96 0.97 rg
0.8 0.82 0.88 RG 0.5 w
${leftMargin} ${currentY - 50} ${contentWidth} 50 re b
0.04 0.09 0.18 rg
BT /F2 9 Tf ${leftMargin + 12} ${currentY - 14} Td (ORGANIZER AUTHORIZATION & VENDOR ACCEPTANCE) Tj ET
0.35 0.4 0.48 rg
BT /F1 8.5 Tf ${leftMargin + 12} ${currentY - 28} Td (By booking a stand at ${escapePdfText(options.eventTitle)}, the vendor agrees to abide by all rules above.) Tj ET
BT /F1 8.5 Tf ${leftMargin + 12} ${currentY - 40} Td (Issued electronically by Silo Exhibitions Secretariat  |  https://siloexhibitions.com.ng/${escapePdfText(options.slug)}) Tj ET
`;
    currentY -= 65;

    // Push the final page
    if (currentStream) {
        pageStreams.push(currentStream);
    }

    const totalPages = pageStreams.length;

    // Append page numbers to each page stream
    const finalPageStreams = pageStreams.map((stream, pageIdx) => {
        const pageNum = pageIdx + 1;
        const footerText = `Page ${pageNum} of ${totalPages}  |  Official Documentation  |  Silo Exhibitions`;
        return `${stream}
0.6 0.65 0.72 rg
BT /F1 8 Tf ${leftMargin} 30 Td (${escapePdfText(footerText)}) Tj ET
0.8 0.85 0.9 RG 0.5 w
${leftMargin} 42 m ${leftMargin + contentWidth} 42 l S
`;
    });

    // --- BUILD THE PDF OBJECTS ---
    const objects: string[] = [];

    // Obj 1: Catalog
    objects.push(`1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj`);

    // Obj 2: Pages tree
    const kidsStr = finalPageStreams.map((_, i) => `${3 + i * 2} 0 R`).join(" ");
    objects.push(`2 0 obj
<<
  /Type /Pages
  /Kids [${kidsStr}]
  /Count ${totalPages}
>>
endobj`);

    // Font 1: Helvetica (regular)
    const fontRegularObjNum = 3 + totalPages * 2;
    // Font 2: Helvetica-Bold
    const fontBoldObjNum = fontRegularObjNum + 1;

    // For each page:
    // Page Obj (3 + i*2)
    // Contents Obj (4 + i*2)
    finalPageStreams.forEach((stream, i) => {
        const pageObjNum = 3 + i * 2;
        const contentObjNum = pageObjNum + 1;
        const streamBytes = Buffer.from(stream, "utf-8");

        objects.push(`${pageObjNum} 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 ${pageWidth} ${pageHeight}]
  /Contents ${contentObjNum} 0 R
  /Resources <<
    /Font <<
      /F1 ${fontRegularObjNum} 0 R
      /F2 ${fontBoldObjNum} 0 R
    >>
  >>
>>
endobj`);

        objects.push(`${contentObjNum} 0 obj
<<
  /Length ${streamBytes.length}
>>
stream
${stream}
endstream
endobj`);
    });

    // Font 1 object
    objects.push(`${fontRegularObjNum} 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
  /Encoding /WinAnsiEncoding
>>
endobj`);

    // Font 2 object
    objects.push(`${fontBoldObjNum} 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
  /Encoding /WinAnsiEncoding
>>
endobj`);

    // --- COMPOSE BINARY BUFFER WITH ACCURATE BYTE OFFSETS ---
    let output = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const offsets: number[] = [];

    objects.forEach((obj) => {
        offsets.push(Buffer.byteLength(output, "utf-8"));
        output += `${obj}\n`;
    });

    const startXref = Buffer.byteLength(output, "utf-8");
    const totalObjectsCount = objects.length + 1; // including 0 0 obj

    output += `xref
0 ${totalObjectsCount}
0000000000 65535 f \n`;

    offsets.forEach((offset) => {
        const offsetStr = String(offset).padStart(10, "0");
        output += `${offsetStr} 00000 n \n`;
    });

    output += `trailer
<<
  /Size ${totalObjectsCount}
  /Root 1 0 R
>>
startxref
${startXref}
%%EOF
`;

    return Buffer.from(output, "utf-8");
}
