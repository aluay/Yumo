import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
	req: Request,
	{ params }: { params: { userId: string } }
) {
	const userId = Number(params.userId);
	if (isNaN(userId)) {
		return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
	}

	// List of followers (users who follow this user)
	const followers = await prisma.userFollow.findMany({
		where: { followingId: userId },
		select: { follower: { select: { id: true, name: true, image: true } } },
	});

	return NextResponse.json({
		followers: followers.map((f) => f.follower),
		count: followers.length,
	});
}
