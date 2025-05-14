import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
	const contentType = req.headers.get("content-type") || "";
	const extension = contentType.split("/")[1] || "png";

	const buffer = Buffer.from(await req.arrayBuffer());

	const filename = crypto.randomUUID() + "." + extension;
	const filePath = path.join(process.cwd(), "public", "uploads", filename);
	try {
		await writeFile(filePath, buffer);

		const returnUrl = `/uploads/${filename}`;

		return NextResponse.json({
			url: returnUrl, // ✅ relative URL
		});
	} catch (err) {
		console.error("Upload failed:", err);
		return new NextResponse("File upload error", { status: 500 });
	}
}
