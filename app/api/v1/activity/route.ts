import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { activityInputSchema } from "@/lib/validation";

/* Utility to look up the owner of the target (for auto-notify) */
async function getTargetOwner(targetType: string, targetId: number) {
	switch (targetType) {
		case "POST":
			return prisma.post
				.findUnique({ where: { id: targetId }, select: { authorId: true } })
				.then((p) => p?.authorId ?? null);
		case "COMMENT":
			return prisma.comment
				.findUnique({ where: { id: targetId }, select: { authorId: true } })
				.then((c) => c?.authorId ?? null);
		case "USER":
			return targetId; // owner is the user themselves
		default:
			return null;
	}
}

/* -------------------------------------------------------------- */
/* POST /api/v1/activity                                          */
/* -------------------------------------------------------------- */
export async function POST(req: Request) {
	/* ---- Auth ---- */
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	/* ---- Validate ---- */
	const body = await req.json();
	const parsed = activityInputSchema.safeParse(body);
	if (!parsed.success)
		return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

	const {
		type,
		targetType,
		targetId,
		message,
		mentionedUserIds = [],
	} = parsed.data;

	const actorId = Number(session.user.id);

	/* ---- Determine notification recipients ---- */
	const recipients = new Set<number>();

	// 1) owner of the target (post author, comment author, etc.)
	const ownerId = await getTargetOwner(targetType, targetId);
	if (ownerId && ownerId !== actorId) recipients.add(ownerId);

	// 2) mentioned users
	mentionedUserIds.forEach((u: number) => {
		if (u !== actorId) recipients.add(u);
	});

	/* ---- Transaction: create activity, mentions, notifications ---- */
	const result = await prisma.$transaction(async (tx) => {
		/* activity row */
		const activity = await tx.activity.create({
			data: {
				userId: actorId,
				type,
				targetType,
				targetId,
				message,
				postId:
					targetType === "POST"
						? targetId
						: targetType === "COMMENT"
						? await tx.comment
								.findUnique({
									where: { id: targetId },
									select: { postId: true },
								})
								.then((c) => c?.postId ?? null)
						: null,
			},
		});

		/* mentions */
		if (mentionedUserIds.length) {
			await tx.activityMention.createMany({
				data: mentionedUserIds.map((u: number) => ({
					userId: u,
					activityId: activity.id,
				})),
				skipDuplicates: true,
			});
		}

		/* notifications */
		if (recipients.size) {
			await tx.notification.createMany({
				data: Array.from(recipients).map((r) => ({
					recipientId: r,
					activityId: activity.id,
				})),
				skipDuplicates: true,
			});
		}

		return activity;
	});

	return NextResponse.json(result, {
		status: 201,
		headers: { Location: `/api/v1/activity/users/${actorId}` },
	});
}
