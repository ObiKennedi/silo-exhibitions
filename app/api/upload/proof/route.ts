import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "silo-exhibitions/payments/proofs";

        if (!file) {
            return NextResponse.json({ error: "No image file provided for upload." }, { status: 400 });
        }

        // Validate image file type
        const fileType = file.type?.toLowerCase() || "";
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/jpg"];
        if (fileType && !allowedTypes.includes(fileType) && !fileType.startsWith("image/")) {
            return NextResponse.json({ error: "Please upload a valid image file (PNG, JPG, JPEG, WEBP)." }, { status: 400 });
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "Screenshot file size exceeds 10MB limit." }, { status: 400 });
        }

        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "wrvldpse";

        if (!apiKey || !apiSecret) {
            return NextResponse.json(
                { error: "Cloudinary credentials not configured in server environment." },
                { status: 500 }
            );
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("api_key", apiKey);
        uploadFormData.append("timestamp", String(timestamp));
        uploadFormData.append("folder", folder);
        uploadFormData.append("signature", signature);

        const cloudinaryRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: uploadFormData,
            }
        );

        const data = await cloudinaryRes.json();

        if (!cloudinaryRes.ok || data.error) {
            console.error("[Proof Upload Cloudinary Error]:", data.error);
            return NextResponse.json(
                { error: data.error?.message || "Cloudinary upload failed." },
                { status: cloudinaryRes.status || 500 }
            );
        }

        return NextResponse.json({
            success: true,
            secure_url: data.secure_url,
            public_id: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            bytes: data.bytes,
        });
    } catch (err: any) {
        console.error("[Proof Upload Handler Error]:", err);
        return NextResponse.json(
            { error: err?.message || "Internal server error during proof upload." },
            { status: 500 }
        );
    }
}
