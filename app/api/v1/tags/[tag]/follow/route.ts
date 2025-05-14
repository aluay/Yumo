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
		if (error instanceof Error && "code" in error && error.code === "P2025") {
			// Handle unique constraint violation
			if ((error as { code?: string }).code === "P2002") {
				return NextResponse.json(
					{ error: "You are already following this tag" },
					{ status: 409 }
				);
			}

			console.error("Error following tag:", error);
			return NextResponse.json(
				{ error: "Failed to follow tag" },
				{ status: 500 }
			);
		}
		console.error("Error following tag:", error);
		return NextResponse.json(
			{ error: "Failed to follow tag" },
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
		// Handle record not found
		if (
			error instanceof Error &&
			(error as { code?: string }).code === "P2025"
		) {
			return NextResponse.json(
				{ error: "You are not following this tag" },
				{ status: 404 }
			);
		}

		console.error("Error unfollowing tag:", error);
		return NextResponse.json(
			{ error: "Failed to unfollow tag" },
			{ status: 500 }
		);
	}
}
