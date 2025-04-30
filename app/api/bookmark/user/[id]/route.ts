import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
		const scripts = await prisma.script.findMany({
			where: {
				bookmarkedBy: {
					some: {
						id: userId,
					},
				},
				status: "PUBLISHED", // Only return published scripts
			},
			orderBy: { createdAt: "desc" },
			include: {
				author: {
					select: {
						name: true,
						image: true,
					},
				},
			},
		});

		const safeScripts = scripts.map((s) => ({
			...s,
			createdAt: s.createdAt.toISOString(),
			updatedAt: s.updatedAt.toISOString(),
		}));

		return NextResponse.json(safeScripts);
	} catch (err) {
		console.error("Error fetching bookmarks for user", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
