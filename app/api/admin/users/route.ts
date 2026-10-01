import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                createdAt: true,
            },
        });
        return NextResponse.json({ success: true, users });
    } catch (err) {
        console.error("[API] Failed to fetch users:", err);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action = "updateRole", userId, role } = body;

        if (action === "updateRole") {
            if (!userId || !role) {
                return NextResponse.json(
                    { error: "User ID and role are required." },
                    { status: 400 }
                );
            }

            const updated = await prisma.user.update({
                where: { id: userId },
                data: { role: role.toLowerCase() },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    emailVerified: true,
                },
            });

            return NextResponse.json({
                success: true,
                message: `User role updated to ${role}.`,
                user: updated,
            });
        }

        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    } catch (err: any) {
        console.error("[API] Error in admin users route:", err);
        return NextResponse.json(
            { error: err?.message || "Failed to update user." },
            { status: 500 }
        );
    }
}
