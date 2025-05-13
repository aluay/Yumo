import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/* -------------------------------------------------------------- */
/* PATCH  /api/v1/notifications/{id}/read                         */
/* Marks ONE notification as read.                                */
/* -------------------------------------------------------------- */
export async function PATCH(
	_req: Request,
	{ params }: { params: { id: string } }
) {
	/* ─── Auth ──────────────────────────────────────────────── */
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const notifId = Number(params.id);
	if (Number.isNaN(notifId)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	/* ─── Ownership check ───────────────────────────────────── */
	const notif = await prisma.notification.findUnique({
		where: { id: notifId },
		select: { recipientId: true, isRead: true },
	});

	if (!notif) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
	if (notif.recipientId !== Number(session.user.id)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	/* ─── Update only if still unread ───────────────────────── */
	if (!notif.isRead) {
		await prisma.notification.update({
			where: { id: notifId },
			data: { isRead: true, readAt: new Date() },
		});
	}

	/* 204 No-Content is perfect for “operation succeeded, no body” */
	return new NextResponse(null, { status: 204 });
}
