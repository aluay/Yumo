// import { NextResponse } from "next/server";
// import { auth } from "@/lib/auth";
// import { prisma } from "@/lib/db";
// import { Prisma } from "@prisma/client";

// const DEFAULT_LIMIT = 50;
// const MAX_LIMIT = 200;

// /* Simple helper: adjust to however we will store roles */
// function isAdmin(session: any) {
// 	return session.user?.role === "ADMIN";
// }

// /* -------------------------------------------------------------- */
// /* GET /api/v1/notifications/all                                  */
// /*   ?cursor=<id>&limit=<n>&recipient=<userId>                    */
// /* -------------------------------------------------------------- */
// export async function GET(req: Request) {
// 	const session = await auth();
// 	if (!session?.user) {
// 		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 	}
// 	if (!isAdmin(session)) {
// 		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
// 	}

// 	const { searchParams } = new URL(req.url);
// 	const limit = Math.min(
// 		Number(searchParams.get("limit") ?? DEFAULT_LIMIT),
// 		MAX_LIMIT
// 	);
// 	const cursor = searchParams.get("cursor"); // last notification.id
// 	const recipient = searchParams.get("recipient"); // optional filter

// 	const where: Prisma.NotificationWhereInput = recipient
// 		? { recipientId: Number(recipient) }
// 		: {};

// 	const notifications = await prisma.notification.findMany({
// 		where,
// 		orderBy: { id: "desc" },
// 		take: limit + 1,
// 		...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
// 		select: {
// 			id: true,
// 			isRead: true,
// 			createdAt: true,
// 			recipient: { select: { id: true, name: true, image: true } },
// 			activity: {
// 				select: {
// 					type: true,
// 					message: true,
// 					user: { select: { id: true, name: true, image: true } },
// 					targetType: true,
// 					targetId: true,
// 				},
// 			},
// 		},
// 	});

// 	const nextCursor =
// 		notifications.length > limit ? notifications.pop()!.id : null;

// 	return NextResponse.json({ data: notifications, nextCursor });
// }
