import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get("q");

	if (!query || query.trim() === "") {
		return NextResponse.json({ error: "Missing query" }, { status: 400 });
	}

	const results = await prisma.$queryRawUnsafe(
		`SELECT * FROM "Script"
        WHERE status = 'PUBLISHED' AND (
          "title" % $1 OR
          "language" % $1 OR
          EXISTS (
            SELECT 1 FROM unnest("tags") AS tag WHERE tag % $1
          ) OR
          "code" % $1
        )
        ORDER BY GREATEST(
          similarity(COALESCE("title", ''), $1),
          similarity(COALESCE("language", ''), $1),
          similarity(COALESCE("code", ''), $1)
        ) DESC
        LIMIT 20`,
		query
	);

	return NextResponse.json(results);
}
