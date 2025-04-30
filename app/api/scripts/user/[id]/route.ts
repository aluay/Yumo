import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { scriptPayloadSchema } from "@/lib/schemas/scriptSchema";

// Get all scripts for a specific user
export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;

		const numericId = parseInt(id);
		if (isNaN(numericId)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		const scripts = await prisma.script.findMany({
			where: { authorId: numericId },
			include: {
				author: {
					select: {
						name: true,
						image: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		const safeScripts = scripts.map((s) => ({
			...s,
			createdAt: s.createdAt.toISOString(),
			updatedAt: s.updatedAt.toISOString(),
		}));

		const result = scriptPayloadSchema.array().safeParse(safeScripts);
		if (!result.success) {
			return NextResponse.json(
				{ error: result.error.format() },
				{ status: 500 }
			);
		}

		if (!result.success) {
			return NextResponse.json({ error: "No Scripts found" }, { status: 500 });
		}

		return NextResponse.json(result.data);
	} catch (error) {
		console.error("Failed to fetch scripts:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
