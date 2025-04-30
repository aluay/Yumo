import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import prisma from "@/lib/prisma";
import { logActivity, deleteActivity } from "@/lib/api/logActivity";

// Like a script
export async function POST(req: Request) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { scriptId } = await req.json();
	const numericId = Number(scriptId);

	if (isNaN(numericId)) {
		return NextResponse.json({ error: "Invalid scriptId" }, { status: 400 });
	}
	try {
		const script = await prisma.script.findUnique({
			where: { id: numericId },
		});

		if (!script) {
			return NextResponse.json({ error: "Script not found" }, { status: 404 });
		}

		const likedScripts = await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: {
				likedScripts: {
					connect: { id: numericId },
				},
			},
		});

		await logActivity({
			userId: Number(session.user.id),
			type: "SCRIPT_LIKED",
			targetId: likedScripts.id,
			message: `You liked a new script"${likedScripts.id}"`,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Like failed:", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 }
		);
	}
}

// Unlike a script
export async function DELETE(req: Request) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { scriptId } = await req.json();

	const numericId = Number(scriptId);
	if (isNaN(numericId)) {
		return NextResponse.json({ error: "Invalid scriptId" }, { status: 400 });
	}

	try {
		const unlikedScript = await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: {
				likedScripts: {
					disconnect: { id: numericId },
				},
			},
		});

		if (!unlikedScript) {
			return NextResponse.json({ error: "Script not found" }, { status: 404 });
		} else {
			await deleteActivity(
				Number(session?.user.id),
				"SCRIPT_LIKED",
				unlikedScript.id
			);

			return NextResponse.json({ success: true });
		}
	} catch (error) {
		console.error("Unlike failed:", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 }
		);
	}
}
