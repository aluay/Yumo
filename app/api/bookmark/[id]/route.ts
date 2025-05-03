import { auth } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logActivity, deleteActivity } from "@/lib/api/logActivity";

// Bookmark a script
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

	const bookmarkedScript = await prisma.user.update({
		where: { id: Number(session.user.id) },
		data: {
			bookmarkedScripts: {
				connect: { id: scriptId },
			},
		},
	});

	await logActivity({
		userId: Number(session.user.id),
		type: "SCRIPT_BOOKMARKED",
		targetId: bookmarkedScript.id,
		message: `You bookmarked a script`,
	});
	return NextResponse.json({ success: true });
}

// Un-bookmark a script
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

	const unbookmarkedScript = await prisma.user.update({
		where: { id: Number(session.user.id) },
		data: {
			bookmarkedScripts: {
				disconnect: { id: scriptId },
			},
		},
	});

	await deleteActivity(
		Number(session?.user.id),
		"SCRIPT_BOOKMARKED",
		unbookmarkedScript.id
	);

	return NextResponse.json({ success: true });
}
