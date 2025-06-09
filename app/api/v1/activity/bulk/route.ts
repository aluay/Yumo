import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { activityService, ActivityType } from "@/lib/services/ActivityService";
import { z } from "zod";

/* -------------------------------------------------------------- */
/* VALIDATION SCHEMAS                                             */
/* -------------------------------------------------------------- */

const bulkDeleteSchema = z.object({
	criteria: z.object({
		types: z.array(z.nativeEnum(ActivityType)).optional(),
		olderThan: z.string().datetime().optional(),
		targetIds: z.array(z.number().positive()).optional(),
	}),
});

const bulkActivityIdsSchema = z.object({
	activityIds: z.array(z.number().positive()).min(1).max(100),
	action: z.enum(["delete"]),
});

/* -------------------------------------------------------------- */
/* POST /api/v1/activity/bulk - Bulk operations on activities    */
/* -------------------------------------------------------------- */
export async function POST(req: Request) {
	try {
		/* ---- Auth ---- */
		const session = await auth();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = Number(session.user.id);

		/* ---- Parse Request Body ---- */
		const body = await req.json();
		const { action } = body;

		if (action === "bulk_delete_by_criteria") {
			/* ---- Bulk Delete by Criteria ---- */
			const validation = bulkDeleteSchema.safeParse(body);
			if (!validation.success) {
				return NextResponse.json(
					{
						error: "Invalid request data",
						details: validation.error.format(),
					},
					{ status: 400 }
				);
			}

			const { criteria } = validation.data;

			// Ensure user can only delete their own activities
			const deleteResult = await activityService.bulkDeleteActivities({
				userId,
				types: criteria.types,
				olderThan: criteria.olderThan
					? new Date(criteria.olderThan)
					: undefined,
			});

			return NextResponse.json({
				success: true,
				message: `${deleteResult.deletedCount} activities deleted`,
				deletedCount: deleteResult.deletedCount,
			});
		} else if (action === "bulk_delete_by_ids") {
			/* ---- Bulk Delete by IDs ---- */
			const validation = bulkActivityIdsSchema.safeParse(body);
			if (!validation.success) {
				return NextResponse.json(
					{
						error: "Invalid request data",
						details: validation.error.format(),
					},
					{ status: 400 }
				);
			}

			const { activityIds } = validation.data;
			let deletedCount = 0;
			const errors: string[] = [];

			for (const activityId of activityIds) {
				try {
					await activityService.deleteActivity(userId, activityId);
					deletedCount++;
				} catch (error) {
					errors.push(
						`Failed to delete activity ${activityId}: ${
							error instanceof Error ? error.message : "Unknown error"
						}`
					);
				}
			}

			return NextResponse.json({
				success: true,
				message: `${deletedCount} out of ${activityIds.length} activities deleted`,
				deletedCount,
				errors: errors.length > 0 ? errors : undefined,
			});
		} else {
			return NextResponse.json(
				{
					error:
						"Invalid action. Supported actions: bulk_delete_by_criteria, bulk_delete_by_ids",
				},
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Error in bulk activity operation:", error);
		return NextResponse.json(
			{
				error: "Bulk operation failed",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
