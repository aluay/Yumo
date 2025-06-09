import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ userId: string }> }
) {
	const resolvedParams = await params;
	const userId = Number(resolvedParams.userId);
	const posts = await prisma.post.findMany({
		where: {
			likes: { some: { userId } },
			deletedAt: null,
		},
		orderBy: { createdAt: "desc" },
		select: { id: true, title: true, createdAt: true, tags: true },
	});
	return NextResponse.json({ data: posts });
}
