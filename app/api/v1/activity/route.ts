import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
	activityService,
	ActivityType,
	TargetType,
	ActivityPriority,
} from "@/lib/services/ActivityService";
import { z } from "zod";

/* -------------------------------------------------------------- */
/* VALIDATION SCHEMAS                                             */
/* -------------------------------------------------------------- */

const createActivitySchema = z.object({
	type: z.nativeEnum(ActivityType),
	targetType: z.nativeEnum(TargetType),
	targetId: z.number().positive(),
	message: z.string().max(500).optional(),
	metadata: z.record(z.any()).optional(),
	priority: z.nativeEnum(ActivityPriority).optional(),
	mentionedUserIds: z.array(z.number().positive()).optional(),
	recipientIds: z.array(z.number().positive()).optional(),
});

const getActivitiesSchema = z.object({
	types: z.array(z.nativeEnum(ActivityType)).optional(),
	limit: z.number().min(1).max(100).optional(),
	cursor: z.number().optional(),
	includeOwnActions: z.boolean().optional(),
	includeMentions: z.boolean().optional(),
});

const deleteActivitySchema = z.object({
	activityId: z.number().positive(),
});

/* -------------------------------------------------------------- */
/* POST /api/v1/activity - Create new activity                   */
/* -------------------------------------------------------------- */
export async function POST(req: Request) {
	try {
		/* ---- Auth ---- */
		const session = await auth();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = Number(session.user.id);

		/* ---- Validate Request ---- */
		const body = await req.json();
		const validation = createActivitySchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Invalid request data",
					details: validation.error.format(),
				},
				{ status: 400 }
			);
		}

		const activityInput = validation.data;

		/* ---- Create Activity ---- */
		const activity = await activityService.createActivity(
			{
				userId,
				timestamp: new Date(),
				source: "api",
			},
			activityInput
		);

		return NextResponse.json(
			{
				success: true,
				activity: {
					id: activity.id,
					type: activity.type,
					targetType: activity.targetType,
					targetId: activity.targetId,
					message: activity.message,
					createdAt: activity.createdAt.toISOString(),
				},
			},
			{
				status: 201,
				headers: {
					Location: `/api/v1/activity/${activity.id}`,
				},
			}
		);
	} catch (error) {
		console.error("Error creating activity:", error);
		return NextResponse.json(
			{
				error: "Failed to create activity",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

/* -------------------------------------------------------------- */
/* GET /api/v1/activity - Get user activities                    */
/* -------------------------------------------------------------- */
export async function GET(req: Request) {
	try {
		/* ---- Auth ---- */
		const session = await auth();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = Number(session.user.id);

		/* ---- Parse Query Parameters ---- */
		const { searchParams } = new URL(req.url);
		const queryData = {
			types: searchParams.get("types")?.split(",") as
				| ActivityType[]
				| undefined,
			limit: searchParams.get("limit")
				? Number(searchParams.get("limit"))
				: undefined,
			cursor: searchParams.get("cursor")
				? Number(searchParams.get("cursor"))
				: undefined,
			includeOwnActions: searchParams.get("includeOwnActions") === "true",
			includeMentions: searchParams.get("includeMentions") !== "false", // default true
		};

		const validation = getActivitiesSchema.safeParse(queryData);
		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Invalid query parameters",
					details: validation.error.format(),
				},
				{ status: 400 }
			);
		}

		/* ---- Get Activities ---- */
		const result = await activityService.getUserActivities(
			userId,
			validation.data
		);

		return NextResponse.json({
			success: true,
			data: {
				activities: result.activities.map((activity) => ({
					id: activity.id,
					type: activity.type,
					targetType: activity.targetType,
					targetId: activity.targetId,
					message: activityService.generateActivityMessage({
						type: activity.type as ActivityType,
						message: activity.message,
						user: activity.user ? { name: activity.user.name } : undefined,
						Post: activity.Post ? { title: activity.Post.title } : undefined,
						mentions: activity.mentions?.map((m) => ({
							user: { name: m.user.name },
						})),
					}),
					createdAt: activity.createdAt.toISOString(),
					user: activity.user,
					post: activity.Post,
					mentions: activity.mentions?.map((m) => m.user),
				})),
				pagination: {
					hasMore: result.hasMore,
					nextCursor: result.nextCursor,
					limit: validation.data.limit || 20,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching activities:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch activities",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

/* -------------------------------------------------------------- */
/* DELETE /api/v1/activity - Delete activity                     */
/* -------------------------------------------------------------- */
export async function DELETE(req: Request) {
	try {
		/* ---- Auth ---- */
		const session = await auth();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = Number(session.user.id);

		/* ---- Validate Request ---- */
		const body = await req.json();
		const validation = deleteActivitySchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Invalid request data",
					details: validation.error.format(),
				},
				{ status: 400 }
			);
		}

		/* ---- Delete Activity ---- */
		await activityService.deleteActivity(userId, validation.data.activityId);

		return NextResponse.json({
			success: true,
			message: "Activity deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting activity:", error);

		if (error instanceof Error) {
			if (error.message === "Activity not found") {
				return NextResponse.json(
					{ error: "Activity not found" },
					{ status: 404 }
				);
			}
			if (error.message === "Unauthorized to delete this activity") {
				return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
			}
		}

		return NextResponse.json(
			{
				error: "Failed to delete activity",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
