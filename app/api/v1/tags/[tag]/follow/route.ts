import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/v1/tags/[tag]/follow
export async function POST(
	req: Request,
	context: { params: Promise<{ tag: string }> }
) {
	// Auth check
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json(
			{ error: "Authentication required" },
			{ status: 401 }
		);
	}

	const userId = Number(session.user.id);
	const { tag } = await context.params;
	const tagName = decodeURIComponent(tag).trim().toLowerCase();

	if (!tagName) {
		return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
	}

	try {
		console.log("Creating tag follow for user:", userId, "and tag:", tagName);
		// Create tag follow
		const tagFollow = await prisma.tagFollow.create({
			data: {
				userId,
				tag: tagName,
			},
		});

		return NextResponse.json(
			{
				success: true,
				data: tagFollow,
			},
			{ status: 201 }
		);
	} catch (error: unknown) {
		console.error(
			"Error in follow tag POST:",
			typeof error === "object" ? error : String(error)
		);
		if (typeof error === "object" && error !== null && "code" in error) {
			const code = (error as { code?: string }).code;
			if (code === "P2002") {
				return NextResponse.json(
					{ error: "You are already following this tag" },
					{ status: 409 }
				);
			}
			if (code === "P2025") {
				return NextResponse.json({ error: "Tag not found" }, { status: 404 });
			}
		}
		return NextResponse.json(
			{ error: "Unexpected error occurred" },
			{ status: 500 }
		);
	}
}

// DELETE /api/v1/tags/[tag]/follow
export async function DELETE(
	req: Request,
	context: { params: Promise<{ tag: string }> }
) {
	// Auth check
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json(
			{ error: "Authentication required" },
			{ status: 401 }
		);
	}

	const userId = Number(session.user.id);
	const { tag } = await context.params;
	const tagName = decodeURIComponent(tag).trim().toLowerCase();

	if (!tagName) {
		return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
	}

	try {
		// Delete tag follow
		await prisma.tagFollow.delete({
			where: {
				userId_tag: {
					userId,
					tag: tagName,
				},
			},
		});

		return NextResponse.json({
			success: true,
		});
	} catch (error: unknown) {
		console.error(
			"Error in unfollow tag DELETE:",
			typeof error === "object" ? error : String(error)
		);
		if (typeof error === "object" && error !== null && "code" in error) {
			const code = (error as { code?: string }).code;
			if (code === "P2025") {
				return NextResponse.json(
					{ error: "You are not following this tag" },
					{ status: 404 }
				);
			}
		}
		return NextResponse.json(
			{ error: "Unexpected error occurred" },
			{ status: 500 }
		);
	}
}
