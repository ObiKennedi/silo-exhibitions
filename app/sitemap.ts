import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://siloexhibitions.com.ng";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/upcoming-exhibitions`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/past-exhibitions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const events = await prisma.event.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    const eventPages: MetadataRoute.Sitemap = events.flatMap((event) => [
      {
        url: `${baseUrl}/${event.slug}`,
        lastModified: event.updatedAt || new Date(),
        changeFrequency: "daily",
        priority: 0.85,
      },
      {
        url: `${baseUrl}/${event.slug}/apply-vendor`,
        lastModified: event.updatedAt || new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
    ]);

    return [...staticPages, ...eventPages];
  } catch {
    return staticPages;
  }
}
