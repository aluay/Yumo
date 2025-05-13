import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/* -------------------------------------------------------------- */
/* GET /api/v1/notifications                                      */
/* -------------------------------------------------------------- */
/* Query params:
     ?limit   – max rows (default 20, cap 50)
     ?cursor  – last notification.id from previous page
     ?all=1   – include read items (otherwise unread-only)
*/
export async function GET(req: Request) {
	/* ---------- auth ---------- */
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const userId = Number(session.user.id);

	/* ---------- query params ---------- */
	const { searchParams } = new URL(req.url);
	const limit = Math.min(
		Number(searchParams.get("limit") ?? DEFAULT_LIMIT),
		MAX_LIMIT
	);
	const cursor = searchParams.get("cursor"); // notification.id
	const includeRead = searchParams.get("all") === "1";

	const where: Prisma.NotificationWhereInput = {
		recipientId: userId,
		...(includeRead ? {} : { isRead: false }),
	};

	/* ---------- fetch ---------- */
	const notifications = await prisma.notification.findMany({
		where,
		orderBy: { id: "desc" },
		take: limit + 1,
		...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
		select: {
			id: true,
			isRead: true,
			createdAt: true,
			activity: {
				select: {
					type: true,
					message: true,
					createdAt: true,
					user: { select: { id: true, name: true, image: true } },
					targetId: true,
					targetType: true,
				},
			},
		},
	});

	const nextCursor =
		notifications.length > limit ? notifications.pop()!.id : null;

	return NextResponse.json({ data: notifications, nextCursor });
}
