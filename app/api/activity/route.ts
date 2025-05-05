import { NextResponse } from "next/server";
import { activitySchema, deleteSchema } from "@/lib/schemas/postSchema";
import prisma from "@/lib/prisma";

// Create a new activity log
export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsed = activitySchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const { userId, type, targetId, message } = parsed.data;

		const createdActivity = await prisma.activity.upsert({
			where: {
				id: userId,
				type: type,
				targetId: targetId,
				message: message,
			},
			update: { message, createdAt: new Date() },
			create: { userId, type, targetId, message },
		});

		return NextResponse.json(createdActivity);
	} catch (err) {
		console.error("Activity logging failed:", err);
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}

// Delete an activity log
export async function DELETE(req: Request) {
	try {
		const body = await req.json();
		const parsed = deleteSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const { userId, type, targetId } = parsed.data;

		await prisma.activity.deleteMany({
			where: {
				userId,
				type,
				targetId,
			},
		});

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Failed to delete activity:", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
