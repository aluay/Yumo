import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get activity for a user
export async function GET(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	const { id } = await context.params;

	const userId = Number(id);

	if (isNaN(userId)) {
		return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
	}

	try {
		const activity = await prisma.activity.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
			take: 20,
			include: {
				script: {
					select: {
						id: true,
						title: true,
						language: true,
					},
				},
				mentionedUsers: {
					select: {
						user: {
							select: {
								id: true,
							},
						},
					},
				},
			},
		});
		// const activity = await prisma.activity.findMany({
		// 	where: { userId },
		// 	orderBy: { createdAt: "desc" },
		// 	take: 20,
		// });

		const safe = activity.map((item) => ({
			...item,
			createdAt: item.createdAt.toISOString(),
		}));

		return NextResponse.json(safe);
	} catch (err) {
		console.error("Failed to fetch activity:", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
