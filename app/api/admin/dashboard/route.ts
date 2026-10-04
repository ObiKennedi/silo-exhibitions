import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const [
            totalUsers,
            totalEvents,
            publishedEvents,
            totalVendorApplications,
            vendorApps,
            events,
            usersRaw,
            allVendorApps,
            gallery,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.event.count(),
            prisma.event.count({ where: { status: "PUBLISHED" } }),
            prisma.vendorApplication.count(),
            prisma.vendorApplication.findMany({
                where: { paymentStatus: "SUCCESS" },
                select: { paidAmount: true },
            }),
            prisma.event.findMany({
                orderBy: { startDate: "desc" },
                include: {
                    _count: {
                        select: {
                            vendorApplications: true,
                            volunteerApplications: true,
                            media: true,
                        },
                    },
                },
            }),
            prisma.user.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    volunteerApplications: {
                        include: {
                            event: {
                                select: {
                                    id: true,
                                    title: true,
                                    slug: true,
                                    venue: true,
                                    startDate: true,
                                },
                            },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                },
                take: 100,
            }),
            prisma.vendorApplication.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            venue: true,
                            startDate: true,
                        },
                    },
                },
            }),
            prisma.eventMedia.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                        },
                    },
                },
                take: 50,
            }),
        ]);

        const totalRevenue = vendorApps.reduce(
            (acc, curr) => acc + (Number(curr.paidAmount) || 0),
            0
        );

        // Map every user with their complete trade fair applications history
        const users = usersRaw.map((u) => {
            const userVendorApps = allVendorApps
                .filter(
                    (app) =>
                        app.userId === u.id ||
                        (app.email && u.email && app.email.toLowerCase() === u.email.toLowerCase())
                )
                .map((app) => ({
                    ...app,
                    paidAmount: Number(app.paidAmount) || 0,
                    dueNow: Number(app.dueNow) || 0,
                    revenuePercentage: app.revenuePercentage ? Number(app.revenuePercentage) : null,
                }));

            return {
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                emailVerified: u.emailVerified,
                createdAt: u.createdAt,
                vendorApplications: userVendorApps,
                volunteerApplications: u.volunteerApplications,
                totalTradefairsCount: userVendorApps.length,
                totalSpent: userVendorApps.reduce((sum, a) => sum + (a.paidAmount || 0), 0),
            };
        });

        const recentApplicationsRaw = await prisma.vendorApplication.findMany({
            orderBy: { createdAt: "desc" },
            take: 30,
            select: {
                id: true,
                bookingCode: true,
                businessName: true,
                contactName: true,
                email: true,
                phone: true,
                category: true,
                stallTitle: true,
                planName: true,
                dueNow: true,
                paidAmount: true,
                paymentStatus: true,
                transactionId: true,
                channel: true,
                createdAt: true,
                paidAt: true,
                event: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        venue: true,
                    },
                },
            },
        });

        const recentApplications = recentApplicationsRaw.map((app) => ({
            ...app,
            paidAmount: Number(app.paidAmount) || 0,
            dueNow: Number(app.dueNow) || 0,
        }));

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                totalEvents,
                publishedEvents,
                totalVendorApplications,
                totalRevenue,
                totalGalleryItems: gallery.length,
            },
            events,
            users,
            gallery,
            recentApplications,
        });
    } catch (err) {
        console.error("[API] Admin dashboard fetch failed:", err);
        return NextResponse.json(
            { error: "Failed to fetch admin dashboard data" },
            { status: 500 }
        );
    }
}
