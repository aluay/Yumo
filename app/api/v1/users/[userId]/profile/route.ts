import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { profileInputSchema } from "@/lib/validation/post";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const notFound = (userId: string) =>
	NextResponse.json({
		userId: Number(userId),
		name: null,
		website: null,
		bio: null,
		user: { image: null },
	});

const forbidden = () =>
	NextResponse.json({ error: "Forbidden" }, { status: 403 });

/* ================================================================== */
/* GET  /api/v1/users/[userId]/profile                                 */
/* ================================================================== */
export async function GET(
	_req: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const { userId } = await context.params;
	const numericUserId = Number(userId);

	if (Number.isNaN(numericUserId))
		return NextResponse.json({ error: "Invalid userId" }, { status: 400 });

	const profile = await prisma.user.findUnique({
		where: { id: numericUserId },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			website: true,
			bio: true,
			pageContent: true,
			showEmail: true,
			posts: {
				select: {
					id: true,
					title: true,
					description: true,
					tags: true,
					likeCount: true,
					bookmarkCount: true,
					createdAt: true,
					author: { select: { id: true, name: true, image: true } },
					_count: { select: { comments: true } },
				},
			},
			comments: true,
			followers: { select: { followerId: true } },
			following: { select: { followingId: true } },
			createdAt: true,
		},
	});

	if (!profile) return notFound(userId);

	const followerCount = profile.followers.length;
	const followingCount = profile.following.length;

	return NextResponse.json({
		...profile,
		followerCount,
		followingCount,
	});
}

/* ================================================================== */
/* PATCH  /api/v1/users/[userId]/profile                               */
/* ================================================================== */
export async function PATCH(
	req: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { userId } = await context.params;
	const numericUserId = Number(userId);

	if (Number.isNaN(numericUserId)) {
		return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
	}

	// Only the profile owner may edit
	if (numericUserId !== Number(session.user.id)) return forbidden();
	const body = await req.json();

	const parsed = profileInputSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
	}

	const cleaned: Prisma.UserUpdateInput = {
		name: parsed.data.name,
		...(parsed.data.image !== null && { image: parsed.data.image }),
		...(parsed.data.website !== null && { website: parsed.data.website }),
		...(parsed.data.bio !== null && { bio: parsed.data.bio }),
		showEmail:
			parsed.data.showEmail === undefined ? true : !!parsed.data.showEmail,
		pageContent:
			parsed.data.pageContent === null
				? Prisma.JsonNull
				: parsed.data.pageContent,
	};

	const updated = await prisma.user.update({
		where: { id: numericUserId },
		data: cleaned,
		select: {
			image: true,
			website: true,
			bio: true,
			pageContent: true,
			showEmail: true,
		},
	});

	return NextResponse.json(updated);
}
