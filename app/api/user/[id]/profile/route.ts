import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	const { id } = await context.params;
	const userId = Number(id);
	if (isNaN(userId))
		return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			Script: true,
			bookmarkedScripts: true,
		},
	});

	if (!user)
		return NextResponse.json({ error: "User not found" }, { status: 404 });

	return NextResponse.json({
		id: user.id,
		name: user.name,
		email: user.email,
		image: user.image,
		createdAt: user.createdAt.toISOString(),
		scriptCount: user.Script.length,
		bookmarkCount: user.bookmarkedScripts.length,
	});
}
