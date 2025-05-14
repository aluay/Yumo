import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

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
			{ error: "You cannot unfollow yourself." },
			{ status: 400 }
		);
	}

	// Check if following
	const existing = await prisma.userFollow.findUnique({
		where: { followerId_followingId: { followerId, followingId } },
	});
	if (!existing) {
		return NextResponse.json(
			{ error: "You are not following this user." },
			{ status: 400 }
		);
	}

	await prisma.userFollow.delete({
		where: { followerId_followingId: { followerId, followingId } },
	});

	// Optionally: Remove activity/notification for unfollow (not required, but can be added)

	return NextResponse.json({
		success: true,
		message: "Unfollowed user successfully.",
	});
}
