import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/* ------------------------------------------------------------------ */
/* GET /api/v1/activity/posts/[postId]                                 */
/* ------------------------------------------------------------------ */
export async function GET(
	req: Request,
	{ params }: { params: { postId: string } }
) {
	/* -------- validate postId ------------------------------------- */
	const postId = Number(params.postId);
	if (Number.isNaN(postId)) {
		return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
	}

	/* -------- query params ---------------------------------------- */
	const { searchParams } = new URL(req.url);
	const limit = Math.min(
		Number(searchParams.get("limit") ?? DEFAULT_LIMIT),
		MAX_LIMIT
	);
	const cursor = searchParams.get("cursor"); // last activity.id
	const sort = searchParams.get("sort") ?? "new"; // new | old

	const orderBy: Prisma.ActivityOrderByWithRelationInput =
		sort === "old" ? { id: "asc" } : { id: "desc" };

	/* -------- fetch ---------------------------------------------- */
	const activities = await prisma.activity.findMany({
		where: { targetType: "POST", targetId: postId },
		orderBy,
		take: limit + 1,
		...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
		select: {
			id: true,
			type: true,
			message: true,
			createdAt: true,
			user: { select: { id: true, name: true, image: true } },
			mentions: {
				select: { user: { select: { id: true, name: true, image: true } } },
			},
			Post: { select: { id: true, title: true } },
		},
	});

	const nextCursor = activities.length > limit ? activities.pop()!.id : null;

	return NextResponse.json({ data: activities, nextCursor });
}
