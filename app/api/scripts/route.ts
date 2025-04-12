import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { scriptSchema } from "@/lib/schemas/scriptSchema";

// Get all scripts
export async function GET() {
	try {
		const scripts = await prisma.script.findMany();
		return NextResponse.json(scripts);
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
	try {
		const body = await request.json();
		const parsed = scriptSchema.safeParse(body);

		if (!parsed.success) {
			const errorMessages = parsed.error.errors.map((err) => err.message);
			return NextResponse.json({ error: errorMessages }, { status: 400 });
		}

		const newScript = await prisma.script.create({
			data: parsed.data,
		});

		return NextResponse.json(newScript, { status: 201 });
	} catch (error) {
		console.error("Failed to create new script:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
