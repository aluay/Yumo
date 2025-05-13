import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/v1/users/[userId]/tags
export async function GET(
	req: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const { userId } = await context.params;
	const numericUserId = Number(userId);

	if (isNaN(numericUserId)) {
		return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
	}

	try {
		// Check if user exists
		const userExists = await prisma.user.findUnique({
			where: { id: numericUserId },
			select: { id: true },
		});

		if (!userExists) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Get user's followed tags
		const followedTags = await prisma.tagFollow.findMany({
			where: { userId: numericUserId },
			orderBy: { createdAt: "desc" },
			select: {
				tag: true,
				createdAt: true,
			},
		});

		return NextResponse.json({
			success: true,
			data: followedTags,
		});
	} catch (error) {
		console.error("Error fetching followed tags:", error);
		return NextResponse.json(
			{ error: "Failed to fetch followed tags" },
			{ status: 500 }
		);
	}
}
