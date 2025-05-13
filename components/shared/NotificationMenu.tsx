"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, MailOpen, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import {
	getUserNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	deleteNotification,
} from "@/lib/api/api";
import { NotificationPayload } from "@/lib/validation/post";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NotificationMenu() {
	const { data: session } = useSession();
	const userId = session?.user?.id ? Number(session.user.id) : undefined;
	const router = useRouter();
	const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [cursor, setCursor] = useState<number | null>(null);
	const [hasMore, setHasMore] = useState(false);

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	// Fetch notifications when component mounts or userId changes
	useEffect(() => {
		const fetchNotifications = async () => {
			if (!userId) return;

			setLoading(true);
			setError(null);

			try {
				const response = await getUserNotifications({
					limit: 10,
					includeRead: true,
				});

				setNotifications(response.notifications);
				setCursor(response.nextCursor);
				setHasMore(response.nextCursor !== null);
			} catch (err) {
				console.error("Failed to fetch notifications:", err);
				setError("Failed to load notifications");
			} finally {
				setLoading(false);
			}
		};

		fetchNotifications();
	}, [userId]);

	console.log("Notifications:", notifications);
	// Load more notifications
	const loadMoreNotifications = async () => {
		if (!userId || !cursor || loading) return;

		setLoading(true);

		try {
			const response = await getUserNotifications({
				limit: 10,
				cursor,
				includeRead: true,
			});

			setNotifications((prev) => [...prev, ...response.notifications]);
			setCursor(response.nextCursor);
			setHasMore(response.nextCursor !== null);
		} catch (err) {
			console.error("Failed to load more notifications:", err);
		} finally {
			setLoading(false);
		}
	};

	// Format timestamp to relative time (e.g., "2 hours ago")
	const formatTimestamp = (timestamp: string) => {
		try {
			return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
		} catch (err) {
			console.error("Error formatting timestamp:", err);
			return "Unknown time";
		}
	};

	// Handle marking a notification as read
	const handleMarkAsRead = async (id: number) => {
		try {
			const success = await markNotificationAsRead(id);

			if (success) {
				setNotifications(
					notifications.map((notification) =>
						notification.id === id
							? { ...notification, isRead: true }
							: notification
					)
				);
			} else {
				throw new Error("Failed to mark notification as read");
			}
		} catch (err) {
			console.error("Error marking notification as read:", err);
		}
	};

	// Handle marking all notifications as read
	const handleMarkAllAsRead = async () => {
		if (!userId) return;

		try {
			const success = await markAllNotificationsAsRead();

			if (success) {
				setNotifications(
					notifications.map((notification) => ({
						...notification,
						isRead: true,
					}))
				);
			} else {
				throw new Error("Failed to mark all notifications as read");
			}
		} catch (err) {
			console.error("Error marking all notifications as read:", err);
		}
	};

	// Handle deleting a notification
	const handleDeleteNotification = async (id: number) => {
		try {
			const success = await deleteNotification(id);

			if (success) {
				setNotifications(
					notifications.filter((notification) => notification.id !== id)
				);
			} else {
				throw new Error("Failed to delete notification");
			}
		} catch (err) {
			console.error("Error deleting notification:", err);
		}
	};

	// Function to handle clicking on a notification
	const handleNotificationClick = async (notification: NotificationPayload) => {
		// If not already read, mark as read
		if (!notification.isRead) {
			await handleMarkAsRead(notification.id);
		}

		// Close the dropdown menu programmatically if needed
		// For example, you might need to set some state to close it

		// Navigate to the target URL if available
		if (notification.actionUrl) {
			router.push(notification.actionUrl);
		}
	};

	// If no session or user ID, don't render the menu
	if (!userId) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
							{unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<DropdownMenuLabel className="flex justify-between items-center">
					<span>Notifications</span>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleMarkAllAsRead}
							className="h-8 px-2 text-xs">
							<CheckCheck className="mr-1 h-4 w-4" />
							Mark all as read
						</Button>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				<ScrollArea className="h-[300px]">
					{loading && notifications.length === 0 ? (
						<div className="flex justify-center items-center h-20">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : error ? (
						<div className="p-4 text-center text-destructive">{error}</div>
					) : notifications.length > 0 ? (
						<>
							{notifications.map((notification) => (
								<div key={notification.id}>
									<DropdownMenuItem
										className={cn(
											"flex flex-col items-start p-4 cursor-pointer", // Make it look clickable
											!notification.isRead && "bg-muted/50"
										)}
										onClick={() => handleNotificationClick(notification)}>
										<div className="flex justify-between w-full">
											<span className="font-medium">
												{notification.activity?.type.split("_").join(" ") ||
													"Notification"}
											</span>
										</div>

										<p className="text-sm text-muted-foreground mt-1">
											{notification.actionText}
										</p>

										{/* Show target content if available */}
										{notification.targetContent && (
											<Link
												href={notification.actionUrl}
												className="mt-1 text-sm p-2 rounded bg-muted w-full hover:bg-background">
												{/* <div className="mt-1 text-sm p-2 rounded bg-muted w-full"> */}
												{notification.targetContent.title}
												{/* </div> */}
											</Link>
										)}
										<span className="text-xs text-muted-foreground">
											{formatTimestamp(notification.createdAt)}
										</span>
										<div className="flex gap-2 mt-2">
											{!notification.isRead && (
												<Button
													variant="outline"
													size="sm"
													onClick={(e) => {
														e.stopPropagation(); // Prevent triggering the parent click
														handleMarkAsRead(notification.id);
													}}
													className="h-8 px-2 text-xs">
													<MailOpen className="mr-1 h-4 w-4" />
													Mark as read
												</Button>
											)}
											<Button
												variant="outline"
												size="sm"
												onClick={(e) => {
													e.stopPropagation(); // Prevent triggering the parent click
													handleDeleteNotification(notification.id);
												}}
												className="h-8 px-2 text-xs text-destructive hover:text-destructive">
												<Trash2 className="mr-1 h-4 w-4" />
												Delete
											</Button>
										</div>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
								</div>
							))}

							{hasMore && (
								<div className="p-2 flex justify-center">
									<Button
										variant="ghost"
										size="sm"
										onClick={loadMoreNotifications}
										disabled={loading}
										className="w-full h-8 text-xs">
										{loading ? (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										) : (
											"Load more"
										)}
									</Button>
								</div>
							)}
						</>
					) : (
						<div className="p-4 text-center text-muted-foreground">
							No notifications
						</div>
					)}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default NotificationMenu;
