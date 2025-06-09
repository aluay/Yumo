import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ActivityType, TargetType } from "@/lib/logActivity";

export async function POST(
	req: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json(
			{ error: "Authentication required." },
			{ status: 401 }
		);
	}

	const { userId } = await context.params;
	const followerId = Number(session.user.id);
	const followingId = Number(userId);

	if (isNaN(followingId)) {
		return NextResponse.json({ error: "Invalid userId." }, { status: 400 });
	}
	if (followerId === followingId) {
		return NextResponse.json(
			{ error: "You cannot follow yourself." },
			{ status: 400 }
		);
	}

	// Check if already following
	const existing = await prisma.userFollow.findUnique({
		where: { followerId_followingId: { followerId, followingId } },
	});
	if (existing) {
		return NextResponse.json(
			{ error: "Already following this user." },
			{ status: 400 }
		);
	}

	// Use transaction to ensure atomicity
	await prisma.$transaction(async (tx) => {
		await tx.userFollow.create({
			data: { followerId, followingId },
		});
		// Record activity and notification for the followed user
		const { recordActivity } = await import("@/lib/logActivity");
		await recordActivity(tx, {
			actorId: followerId,
			type: ActivityType.USER_FOLLOWED,
			targetId: followingId,
			targetType: TargetType.USER,
			message: "started following you",
			recipientId: followingId,
		});
	});

	return NextResponse.json({
		success: true,
		message: "Followed user successfully.",
	});
}
