import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
	_req: Request,
	{ params }: { params: { scriptId: string } }
) {
	const script = await prisma.script.findUnique({
		where: { id: Number(params.scriptId) },
		include: {
			likedBy: true,
		},
	});

	if (!script) {
		return NextResponse.json({ error: "Script not found" }, { status: 404 });
	}

	return NextResponse.json({ likes: script.likedBy.length });
}
