import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

/* ──────────────────────────────────────────────────────────────── */
/* GET  /api/v1/activity/users/me                                   */
/* ──────────────────────────────────────────────────────────────── */
export async function GET(req: Request) {
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const userId = Number(session.user.id);

	/* ────── query params ────────────────────────────────────────── */
	const { searchParams } = new URL(req.url);
	const limit = Math.min(
		Number(searchParams.get("limit") ?? DEFAULT_LIMIT),
		MAX_LIMIT
	);
	const cursor = searchParams.get("cursor"); // last activity.id from previous page

	const where = {
		OR: [
			{ userId }, // their own actions
			{ mentions: { some: { userId } } }, // @mentions
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
			targetType: true,
			targetId: true,
			message: true,
			createdAt: true,
			postId: true,
			// Include lightweight info about the actor or target
			user: { select: { id: true, name: true, image: true } },
			Post: { select: { id: true, title: true, slug: true } },
		},
	});

	const nextCursor = activities.length > limit ? activities.pop()!.id : null;
	return NextResponse.json({
		data: activities.map((activity) => ({
			...activity,
			createdAt: activity.createdAt.toISOString(),
		})),
		nextCursor,
	});
}
