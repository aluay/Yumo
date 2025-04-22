import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import prisma from "@/lib/prisma";
import { likeSchema } from "@/lib/schemas/scriptSchema";

// Like a comment
export async function POST(req: Request) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const parsed = likeSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.flatten() },
			{ status: 400 }
		);
	}

	const { commentId } = parsed.data;

	try {
		await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: {
				likedComments: {
					connect: {
						id: commentId,
					},
				},
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error liking comment:", error);
		return NextResponse.json(
			{ error: "Failed to like comment" },
			{ status: 500 }
		);
	}
}

// Unlike a comment
export async function DELETE(req: Request) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const parsed = likeSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.flatten() },
			{ status: 400 }
		);
	}

	const { commentId } = parsed.data;

	try {
		await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: {
				likedComments: {
					disconnect: { id: commentId },
				},
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error unliking comment", error);
		return NextResponse.json(
			{ error: "Failed to unlike comment" },
			{ status: 500 }
		);
	}
}
