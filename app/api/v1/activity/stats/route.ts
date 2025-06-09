import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { activityService } from "@/lib/services/ActivityService";
import { z } from "zod";

/* -------------------------------------------------------------- */
/* VALIDATION SCHEMAS                                             */
/* -------------------------------------------------------------- */

const statsQuerySchema = z.object({
	userId: z.number().positive().optional(),
	fromDate: z.string().datetime().optional(),
	toDate: z.string().datetime().optional(),
	groupBy: z.enum(["type", "day", "week", "month"]).default("type"),
});

/* -------------------------------------------------------------- */
/* GET /api/v1/activity/stats - Get activity statistics          */
/* -------------------------------------------------------------- */
export async function GET(req: Request) {
	try {
		/* ---- Auth ---- */
		const session = await auth();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const currentUserId = Number(session.user.id);

		/* ---- Parse Query Parameters ---- */
		const { searchParams } = new URL(req.url);
		const queryData = {
			userId: searchParams.get("userId")
				? Number(searchParams.get("userId"))
				: currentUserId,
			fromDate: searchParams.get("fromDate") || undefined,
			toDate: searchParams.get("toDate") || undefined,
			groupBy:
				(searchParams.get("groupBy") as "type" | "day" | "week" | "month") ||
				"type",
		};

		const validation = statsQuerySchema.safeParse(queryData);
		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Invalid query parameters",
					details: validation.error.format(),
				},
				{ status: 400 }
			);
		}

		const { userId, fromDate, toDate, groupBy } = validation.data;

		/* ---- Permission Check ---- */
		// Users can only view their own stats unless they're admin
		if (userId !== currentUserId) {
			// TODO: Add admin role check here
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		/* ---- Get Statistics ---- */
		const timeRange =
			fromDate && toDate
				? { from: new Date(fromDate), to: new Date(toDate) }
				: undefined;

		const stats = await activityService.getActivityStats(userId, timeRange);

		return NextResponse.json({
			success: true,
			data: {
				userId,
				timeRange,
				groupBy,
				statistics: stats,
				generatedAt: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error("Error fetching activity statistics:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch activity statistics",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
