import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ userId: string }> }
) {
	const resolvedParams = await params;
	const userId = Number(resolvedParams.userId);
	if (isNaN(userId)) {
		return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
	}

	// List of users this user is following
	const following = await prisma.userFollow.findMany({
		where: { followerId: userId },
		select: { following: { select: { id: true, name: true, image: true } } },
	});

	return NextResponse.json({
		following: following.map((f) => f.following),
		count: following.length,
	});
}
