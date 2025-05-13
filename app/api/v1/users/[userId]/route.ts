import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Validation for PATCH                                               */
/* ------------------------------------------------------------------ */
const patchSchema = z
	.object({
		name: z.string().min(2).max(60).optional(),
		image: z.string().url().optional(),
	})
	.refine((v) => Object.keys(v).length > 0, { message: "No fields provided" });

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const notFound = () =>
	NextResponse.json({ error: "User not found" }, { status: 404 });

const forbidden = () =>
	NextResponse.json({ error: "Forbidden" }, { status: 403 });

/* ------------------------------------------------------------------ */
/* GET  /api/v1/users/[userId]                                        */
/* ------------------------------------------------------------------ */
export async function GET(
	_req: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const { userId } = await context.params;
	const numericUserId = Number(userId);

	if (Number.isNaN(numericUserId))
		return NextResponse.json({ error: "Invalid userId" }, { status: 400 });

	const user = await prisma.user.findUnique({
		where: { id: numericUserId },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			createdAt: true,
			// aggregate counts if you like:
			_count: { select: { posts: true, comments: true } },
		},
	});

	if (!user) return notFound();
	return NextResponse.json(user);
}

/* ------------------------------------------------------------------ */
/* PATCH  /api/v1/users/[userId]                                      */
/* ------------------------------------------------------------------ */
export async function PATCH(
	req: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { userId } = await context.params;
	const numericUserId = Number(userId);

	if (Number.isNaN(numericUserId))
		return NextResponse.json({ error: "Invalid userId" }, { status: 400 });

	// Only the owner can edit their profile (extend with admin check if needed)
	if (numericUserId !== Number(session.user.id)) return forbidden();

	const body = await req.json();
	const parsed = patchSchema.safeParse(body);
	if (!parsed.success)
		return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

	const updated = await prisma.user.update({
		where: { id: numericUserId },
		data: parsed.data,
		select: { id: true, name: true, image: true },
	});

	return NextResponse.json(updated);
}
