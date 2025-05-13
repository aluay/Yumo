import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const DEFAULT_LIMIT = 20;

/* ──────────────────────────────────────────────────────────────── */
/* GET  /api/v1/activity/users/[userId]                             */
/* ──────────────────────────────────────────────────────────────── */
export async function GET(
	req: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { userId } = await context.params;
	const numericUserId = Number(userId);

	if (Number.isNaN(numericUserId))
		return NextResponse.json({ error: "Invalid userId" }, { status: 400 });

	// user can fetch only their own feed (extend with admin check if needed)
	if (numericUserId !== Number(session.user.id))
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const { searchParams } = new URL(req.url);
	const limit = Math.min(
		Number(searchParams.get("limit") ?? DEFAULT_LIMIT),
		50
	);
	const cursor = searchParams.get("cursor"); // last activity.id from previous page

	const where = {
		OR: [
			{ userId: numericUserId }, // their own actions
			{ mentions: { some: { userId: numericUserId } } }, // @mentions
		],
	};

	const activities = await prisma.activity.findMany({
		where,
		orderBy: { id: "desc" }, // newest first
		take: limit + 1,
		...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
		select: {
			id: true,
			type: true,
			message: true,
			createdAt: true,
			postId: true,
			// Include lightweight info about the actor or target
			user: { select: { id: true, name: true, image: true } },
			Post: { select: { id: true, title: true } },
		},
	});

	const nextCursor = activities.length > limit ? activities.pop()!.id : null;
	return NextResponse.json({ data: activities, nextCursor });
}
