import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/* -------------------------------------------------------------- */
/* GET /api/v1/notifications                                      */
/* -------------------------------------------------------------- */
/* Query params:
     ?limit   – max rows (default 20, cap 50)
     ?cursor  – last notification.id from previous page
     ?all=1   – include read items (otherwise unread-only)
*/
export async function GET(req: Request) {
	/* ---------- auth ---------- */
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const userId = Number(session.user.id);
	// const userId = 7; // For testing

	/* ---------- query params ---------- */
	const { searchParams } = new URL(req.url);
	const limit = Math.min(
		Number(searchParams.get("limit") ?? DEFAULT_LIMIT),
		MAX_LIMIT
	);
	const cursor = searchParams.get("cursor"); // notification.id
	const includeRead = searchParams.get("all") === "1";

	const where: Prisma.NotificationWhereInput = {
		recipientId: userId,
		...(includeRead ? {} : { isRead: false }),
	};

	/* ---------- fetch ---------- */
	const notifications = await prisma.notification.findMany({
		where,
		orderBy: { id: "desc" },
		take: limit + 1,
		...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
		select: {
			id: true,
			isRead: true,
			createdAt: true,
			activity: {
				select: {
					id: true,
					type: true,
					message: true,
					createdAt: true,
					targetId: true,
					targetType: true,
					// Include the user who performed the action
					user: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					// Include post data if it exists (either direct or as parent of comment)
					Post: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			},
		},
	});

	// Process notifications to add navigation links and enhanced content
	const processedNotifications = notifications
		.slice(0, limit)
		.map((notification) => {
			const { activity } = notification;
			let actionText = "";
			let actionUrl = "";
			let targetContent = null;

			// Format the action text and URL based on activity type
			if (activity) {
				const { type, targetType, targetId, user } = activity;
				const userName = user?.name || "Someone";

				switch (type) {
					case "POST_CREATED":
						actionText = `${userName} published a new post`;
						actionUrl = activity.Post
							? `/posts/${activity.Post.id || activity.Post.id}`
							: "";
						targetContent = activity.Post
							? {
									title: activity.Post.title,
									type: "post",
							  }
							: null;
						break;

					case "POST_LIKED":
						actionText = `${userName} liked your post`;
						actionUrl = activity.Post
							? `/posts/${activity.Post.id || activity.Post.id}`
							: "";
						targetContent = activity.Post
							? {
									title: activity.Post.title,
									type: "post",
							  }
							: null;
						break;

					case "POST_BOOKMARKED":
						actionText = `${userName} bookmarked your post`;
						actionUrl = activity.Post
							? `/posts/${activity.Post.id || activity.Post.id}`
							: "";
						targetContent = activity.Post
							? {
									title: activity.Post.title,
									type: "post",
							  }
							: null;
						break;

					case "USER_FOLLOWED":
						actionText = `${userName} started following you`;
						actionUrl = `/users/${user.id}`;
						targetContent = null;
						break;

					case "USER_MENTIONED":
						actionText = `${userName} mentioned you`;

						if (targetType === "POST") {
							actionText += " in a post";
							actionUrl = activity.Post
								? `/posts/${activity.Post.id || activity.Post.id}`
								: "";
						} else if (targetType === "COMMENT") {
							actionText += " in a comment";
							actionUrl = activity.Post
								? `/posts/${
										activity.Post.id || activity.Post.id
								  }#comment-${targetId}`
								: "";
						}

						targetContent = activity.Post
							? {
									title: activity.Post.title,
									type: targetType.toLowerCase(),
							  }
							: null;
						break;

					case "COMMENT_POSTED":
						const targetDescription =
							targetType === "POST" ? "your post" : "a comment";
						actionText = `${userName} commented on ${targetDescription}`;

						// If it's a comment on a post, link to the post with comment ID anchor
						if (targetType === "POST") {
							actionUrl = activity.Post
								? `/posts/${
										activity.Post.id || activity.Post.id
								  }#comment-${targetId}`
								: "";
							targetContent = activity.Post
								? {
										title: activity.Post.title,
										type: "comment",
										parentType: "post",
								  }
								: null;
						} else {
							// If it's a reply to a comment, we need the post ID as well
							actionUrl = activity.Post
								? `/posts/${
										activity.Post.id || activity.Post.id
								  }#comment-${targetId}`
								: "";
							targetContent = activity.Post
								? {
										title: activity.Post.title,
										type: "comment",
										parentType: "comment",
								  }
								: null;
						}
						break;

					case "COMMENT_LIKED":
						actionText = `${userName} liked your comment`;
						actionUrl = activity.Post
							? `/posts/${
									activity.Post.id || activity.Post.id
							  }#comment-${targetId}`
							: "";
						targetContent = activity.Post
							? {
									title: activity.Post.title,
									type: "comment",
									parentType: "post",
							  }
							: null;
						break;

					default:
						actionText =
							activity.message || `${userName} interacted with your content`;
						// If we have a post reference, use it
						if (activity.Post) {
							actionUrl = `/posts/${activity.Post.id || activity.Post.id}`;
							targetContent = {
								title: activity.Post.title,
								type: "post",
							};
						}
				}
			}

			// Return enhanced notification with navigation data
			return {
				...notification,
				actionText,
				actionUrl,
				targetContent,
				// Format the date for easier consumption by frontend
				createdAt: notification.createdAt.toISOString(),
			};
		});

	const nextCursor =
		notifications.length > limit ? notifications.pop()!.id : null;

	return NextResponse.json({
		data: processedNotifications,
		nextCursor,
	});
}

/* -------------------------------------------------------------- */
/* PATCH /api/v1/notifications                                    */
/* -------------------------------------------------------------- */
/* Request body:
     { id: number }       - Mark single notification as read
     { all: true }        - Mark all notifications as read
*/
export async function PATCH(req: Request) {
	/* ---------- auth ---------- */
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const userId = Number(session.user.id);

	try {
		const body = await req.json();

		// Mark all as read
		if (body.all === true) {
			await prisma.notification.updateMany({
				where: {
					recipientId: userId,
					isRead: false,
				},
				data: {
					isRead: true,
					readAt: new Date(),
				},
			});

			return NextResponse.json({ success: true });
		}

		// Mark single notification as read
		else if (body.id) {
			// Verify notification belongs to this user before updating
			const notification = await prisma.notification.findFirst({
				where: {
					id: Number(body.id),
					recipientId: userId,
				},
			});

			if (!notification) {
				return NextResponse.json(
					{ error: "Notification not found" },
					{ status: 404 }
				);
			}

			await prisma.notification.update({
				where: { id: Number(body.id) },
				data: {
					isRead: true,
					readAt: new Date(),
				},
			});

			return NextResponse.json({ success: true });
		}

		return NextResponse.json(
			{ error: "Missing id or all parameter" },
			{ status: 400 }
		);
	} catch (error) {
		console.error("Error marking notification as read:", error);
		return NextResponse.json(
			{ error: "Failed to mark notification as read" },
			{ status: 500 }
		);
	}
}

/* -------------------------------------------------------------- */
/* DELETE /api/v1/notifications                                   */
/* -------------------------------------------------------------- */
/* Query params:
     ?id=123  - Delete the notification with this ID
*/
export async function DELETE(req: Request) {
	/* ---------- auth ---------- */
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const userId = Number(session.user.id);

	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Missing notification id" },
				{ status: 400 }
			);
		}

		// Verify notification belongs to this user before deleting
		const notification = await prisma.notification.findFirst({
			where: {
				id: Number(id),
				recipientId: userId,
			},
		});

		if (!notification) {
			return NextResponse.json(
				{ error: "Notification not found" },
				{ status: 404 }
			);
		}

		await prisma.notification.delete({
			where: { id: Number(id) },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting notification:", error);
		return NextResponse.json(
			{ error: "Failed to delete notification" },
			{ status: 500 }
		);
	}
}
