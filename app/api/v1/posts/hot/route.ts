import { NextResponse } from "next/server";
import { getHotPosts } from "@/lib/api/hotPosts";

/* ------------------------------------------------------------------ */
/* GET  /api/v1/posts/hot                                              */
/* ------------------------------------------------------------------ */
export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);

	// 10 posts per page, max 50
	const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
	const cursor = searchParams.get("cursor"); // post.id of last page

	const { posts, nextCursor } = await getHotPosts({
		limit,
		cursor: cursor ? Number(cursor) : null,
	});

	return NextResponse.json({
		posts,
		nextCursor,
	});
}
