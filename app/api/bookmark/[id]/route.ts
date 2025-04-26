import { auth } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { id } = await context.params;
	const scriptId = Number(id);
	if (isNaN(scriptId)) {
		return NextResponse.json({ error: "Invalid script ID" }, { status: 400 });
	}

	await prisma.user.update({
		where: { id: Number(session.user.id) },
		data: {
			bookmarkedScripts: {
				connect: { id: scriptId },
			},
		},
	});

	return NextResponse.json({ success: true });
}

export async function DELETE(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await context.params;
	const scriptId = Number(id);
	if (isNaN(scriptId)) {
		return NextResponse.json({ error: "Invalid Script ID" }, { status: 400 });
	}

	await prisma.user.update({
		where: { id: Number(session.user.id) },
		data: {
			bookmarkedScripts: {
				disconnect: { id: scriptId },
			},
		},
	});

	return NextResponse.json({ success: true });
}
