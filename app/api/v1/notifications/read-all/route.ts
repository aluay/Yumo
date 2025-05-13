import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/* -------------------------------------------------------------- */
/* PATCH /api/v1/notifications/read-all                           */
/* Body: (empty) — simply flip every isRead=false row to true.    */
/* -------------------------------------------------------------- */
export async function PATCH() {
	/* ── Auth guard ──────────────────────────────────────────── */
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = Number(session.user.id);

	/* ── Bulk update ─────────────────────────────────────────── */
	await prisma.notification.updateMany({
		where: { recipientId: userId, isRead: false },
		data: { isRead: true, readAt: new Date() },
	});

	/* 204: success, no body */
	return new NextResponse(null, { status: 204 });
}
