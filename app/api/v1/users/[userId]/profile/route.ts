import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { profileInputSchema } from "@/lib/validation/post";

// import { z } from "zod";
// import type { JSONContent } from "@tiptap/react";

/* ------------------------------------------------------------------ */
/* Validation for PATCH                                               */
/* ------------------------------------------------------------------ */
// const jsonDoc = z
// 	.custom<JSONContent | null>((val) => {
// 		if (val === null) return true;
// 		return typeof val === "object" && (val as JSONContent).type === "doc";
// 	})
// 	.optional();

// const patchSchema = z
// 	.object({
// 		name: z.string().min(2).max(60),
// 		email: z.string().email(),
// 		website: z.string().max(120).optional(),
// 		bio: z.string().max(1000).optional(),
// 		pageContent: jsonDoc,
// 	})
// 	.refine((v) => Object.keys(v).length > 0, { message: "No fields provided" });

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
			// emailVerified: true,
			image: true, // Profile fields
			website: true,
			bio: true,
			pageContent: true,
			showEmail: true,

			// Relations
			// accounts: true,
			// sessions: true,
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
			// postLikes: true,
			// postBookmarks: true,
			// commentLikes: true,
			// commentReports: true,
			// Activity: true,
			// ActivityMention: true,
			// Notification: true,

			createdAt: true,
			// updatedAt: true,
		},
	});

	if (!profile) return notFound(userId);
	return NextResponse.json(profile);
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
