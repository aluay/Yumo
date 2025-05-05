import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get the number of likes for a post
export async function GET(
	_req: Request,
	{ params }: { params: { postId: string } }
) {
	const post = await prisma.post.findUnique({
		where: { id: Number(params.postId) },
		include: {
			likedBy: true,
		},
	});

	if (!post) {
		return NextResponse.json({ error: "Post not found" }, { status: 404 });
	}

	return NextResponse.json({ likes: post.likedBy.length });
}
