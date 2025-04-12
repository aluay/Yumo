import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { scriptSchema } from "@/lib/schemas/scriptSchema";

// Get a single script by id
export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	const { id } = await context.params;

	const numericId = parseInt(id);
	if (isNaN(numericId)) {
		return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
	}

	const script = await prisma.script.findUnique({
		where: { id: numericId },
	});

	if (!script) {
		return NextResponse.json({ error: "Script not found" }, { status: 404 });
	}

	return NextResponse.json(script);
}

// Update a script by id
export async function PUT(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;

		const numericId = parseInt(id);
		if (isNaN(numericId)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		const body = await request.json();
		const parsed = scriptSchema.partial().safeParse(body);

		if (!parsed.success) {
			const errorMessages = parsed.error.errors.map((err) => err.message);
			return NextResponse.json({ error: errorMessages }, { status: 400 });
		}

		const updatedScript = await prisma.script.update({
			where: { id: numericId },
			data: parsed.data,
		});

		return NextResponse.json(updatedScript, { status: 200 });
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Failed to update script:", error.message);
		}
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

// Delete a script by id
export async function DELETE(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;
		const numericId = parseInt(id);

		if (isNaN(numericId)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		const deletedScript = await prisma.script.delete({
			where: { id: numericId },
		});
		return NextResponse.json(deletedScript);
	} catch (error: unknown) {
		if (error instanceof Error) {
			return NextResponse.json({ error: "Script not found" }, { status: 404 });
		}
		console.log("Error deleting script:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
