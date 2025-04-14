import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	const { id } = await context.params;

	const numericId = parseInt(id);
	if (isNaN(numericId)) {
		return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
	}

	const scripts = await prisma.script.findMany({
		where: { authorId: numericId },
		orderBy: { createdAt: "desc" },
	});

	if (!scripts || scripts.length === 0) {
		return NextResponse.json(
			{ error: "No scripts found for this user" },
			{ status: 404 }
		);
	}
	return NextResponse.json(scripts);
}
