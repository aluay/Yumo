import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/* ------------------------------------------------------------------ */
/* GET /api/v1/users?cursor=<id>&limit=<n>&q=<search>                  */
/* ------------------------------------------------------------------ */
export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);

	const limit = Math.min(
		Number(searchParams.get("limit") ?? DEFAULT_LIMIT),
		MAX_LIMIT
	);
	const cursor = searchParams.get("cursor"); // last user.id from prior page
	const qRaw = searchParams.get("q")?.trim() ?? "";

	const users = await prisma.user.findMany({
		where: {
			OR: [
				{ name: { contains: qRaw, mode: "insensitive" } },
				{ email: { contains: qRaw, mode: "insensitive" } },
			],
		},
		take: limit,
		select: { id: true, name: true, image: true },
		orderBy: { id: "asc" },
		...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
	});

	const nextCursor = users.length > limit ? users.pop()!.id : null;

	return NextResponse.json({ data: users, nextCursor });
}

/* ------------------------------------------------------------------ */
/* 405 for everything else                                            */
/* ------------------------------------------------------------------ */
export function POST() {
	return new NextResponse(null, { status: 405 });
}
export function PATCH() {
	return new NextResponse(null, { status: 405 });
}
export function DELETE() {
	return new NextResponse(null, { status: 405 });
}
