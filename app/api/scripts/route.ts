import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { scriptSchema, scriptPayloadSchema } from "@/lib/schemas/scriptSchema";
import { auth } from "@/app/auth";

// Get all scripts
export async function GET() {
	const session = await auth();

	try {
		const scripts = await prisma.script.findMany({
			take: session?.user ? undefined : 10, // Only load recent 10 scripts for unauthenticated users
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

		return NextResponse.json(result.data);
	} catch (error) {
		console.error("Failed to fetch scripts:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

// Create new script
export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const result = scriptSchema.safeParse(body);

	if (!result.success) {
		return NextResponse.json({ error: result.error.format() }, { status: 400 });
	}

	const newScript = await prisma.script.create({
		data: {
			...result.data,
			authorId: Number(session.user.id),
		},
	});

	return NextResponse.json(newScript, { status: 201 });
}
