/**
 * Cloudinary Helper & Media Optimization Utility
 * Handles Cloudinary delivery URLs, transformations, and asset management for Silo Exhibitions.
 */

export interface CloudinaryTransformOptions {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "limit" | "scale" | "thumb";
    quality?: "auto" | number | "auto:best" | "auto:good" | "auto:eco" | "auto:low";
    format?: "auto" | "webp" | "jpg" | "png" | "avif";
    aspectRatio?: string;
}

export const CLOUDINARY_CLOUD_NAME =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "silo-exhibitions";

export const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const CLOUDINARY_FOLDERS = {
    EVENT_COVERS: "silo-exhibitions/events/covers",
    EVENT_FLIERS: "silo-exhibitions/events/fliers",
    EVENT_GALLERY: "silo-exhibitions/events/gallery",
    EVENT_DOCS: "silo-exhibitions/events/documents",
    SPONSORS: "silo-exhibitions/sponsors",
    VENDOR_LOGOS: "silo-exhibitions/vendors/logos",
} as const;

/**
 * Builds an optimized Cloudinary delivery URL with transformations.
 * If given a full Cloudinary URL, injects or updates transformation parameters.
 * If given a public ID, constructs the full CDN delivery URL.
 * If given a local or external URL (e.g. "/events/..."), returns it as is.
 */
export function getCloudinaryUrl(
    publicIdOrUrl: string | null | undefined,
    options: CloudinaryTransformOptions = {}
): string {
    if (!publicIdOrUrl) return "";

    // If it's a local path or external non-cloudinary URL, return it safely
    if (
        publicIdOrUrl.startsWith("/") ||
        (publicIdOrUrl.startsWith("http") && !publicIdOrUrl.includes("res.cloudinary.com"))
    ) {
        return publicIdOrUrl;
    }

    const {
        width,
        height,
        crop = width && height ? "fill" : undefined,
        quality = "auto",
        format = "auto",
        aspectRatio,
    } = options;

    const transforms: string[] = [];

    if (format) transforms.push(`f_${format}`);
    if (quality) transforms.push(`q_${quality}`);
    if (crop) transforms.push(`c_${crop}`);
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (aspectRatio) transforms.push(`ar_${aspectRatio}`);

    const transformStr = transforms.length > 0 ? transforms.join(",") : "";

    // If already a full Cloudinary URL
    if (publicIdOrUrl.includes("res.cloudinary.com")) {
        if (!transformStr) return publicIdOrUrl;
        // Inject transformations after /upload/
        return publicIdOrUrl.replace(
            /\/image\/upload\/(?:[^\/]+\/)?/,
            `/image/upload/${transformStr}/`
        );
    }

    // Public ID provided
    const cleanPublicId = publicIdOrUrl.replace(/^\/+/, "");
    return transformStr
        ? `${CLOUDINARY_BASE_URL}/${transformStr}/${cleanPublicId}`
        : `${CLOUDINARY_BASE_URL}/${cleanPublicId}`;
}

/**
 * Generates an auto-optimized thumbnail for exhibition media galleries.
 */
export function getCloudinaryThumbnailUrl(
    publicIdOrUrl: string,
    width = 400,
    height = 400
): string {
    return getCloudinaryUrl(publicIdOrUrl, {
        width,
        height,
        crop: "fill",
        quality: "auto",
        format: "auto",
    });
}

/**
 * Extracts the Cloudinary public_id from a full Cloudinary delivery URL.
 */
export function extractCloudinaryPublicId(url: string): string | null {
    if (!url || !url.includes("res.cloudinary.com")) return null;

    try {
        const parts = url.split("/image/upload/");
        if (parts.length < 2) return null;

        // Skip version tag (e.g. "v1711234567/") if present
        let afterUpload = parts[1];
        // Remove transformation parameters if present
        const segments = afterUpload.split("/");
        const withoutTransforms = segments.filter(
            (segment) => !/^[a-z]_[a-z0-9_:,.-]+$/i.test(segment) && !/^v\d+$/.test(segment)
        );

        const joined = withoutTransforms.join("/");
        // Strip extension (e.g. .jpg, .webp)
        return joined.replace(/\.[^/.]+$/, "");
    } catch {
        return null;
    }
}
