import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get("q");

	if (!query || query.trim() === "") {
		return NextResponse.json([]);
	}

	try {
		const users = await prisma.user.findMany({
			where: {
				name: {
					contains: query,
					mode: "insensitive",
				},
			},
			select: {
				id: true,
				name: true,
			},
			take: 10,
		});

		return NextResponse.json(users);
	} catch (error) {
		console.error("Error searching users:", error);
		return NextResponse.json([], { status: 500 });
	}
}
