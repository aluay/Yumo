import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	context: { params: Promise<{ tag: string }> }
) {
	const { tag } = await context.params;
	const tagName = decodeURIComponent(tag);

	try {
		const posts = await prisma.post.findMany({
			where: {
				status: "PUBLISHED",
				OR: [{ tags: { has: tagName } }, { language: tagName }],
			},
			include: {
				author: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return NextResponse.json(posts);
	} catch (error) {
		console.error("Failed get tag posts:", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 }
		);
	}
}
