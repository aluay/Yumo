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
import { NotificationPayload } from "@/lib/validation";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationMenu() {
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
				<Button
					variant="ghost"
					size="icon"
					className="relative rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent">
					<Bell className="h-[1.2rem] w-[1.2rem]" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] font-semibold">
							{unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-[350px] max-h-[75vh] overflow-hidden shadow-lg border-border p-0">
				<DropdownMenuLabel className="flex justify-between items-center py-3 px-4 border-b">
					<span className="font-semibold text-base">Notifications</span>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleMarkAllAsRead}
							className="h-8 px-2 text-xs hover:bg-primary/10 hover:text-primary transition-colors duration-150">
							<CheckCheck className="mr-1 h-3.5 w-3.5" />
							Mark all read
						</Button>
					)}{" "}
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="m-0 p-0" />

				<ScrollArea className="h-[400px] py-1">
					{loading && notifications.length === 0 ? (
						<div className="flex justify-center items-center h-24">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : error ? (
						<div className="p-4 text-center text-destructive">{error}</div>
					) : notifications.length > 0 ? (
						<div className="px-1 py-0.5">
							{notifications.map((notification) => (
								<div key={notification.id} className="relative group">
									<DropdownMenuItem
										className={cn(
											"flex flex-col items-start p-3 my-0.5 rounded-md cursor-pointer border-l-2 hover:bg-accent/70 transition-all duration-150",
											!notification.isRead
												? "border-l-primary bg-primary/5"
												: "border-l-transparent"
										)}
										onClick={() => handleNotificationClick(notification)}>
										<div className="flex justify-between w-full">
											<span
												className={cn(
													"font-semibold text-sm",
													!notification.isRead && "text-primary"
												)}>
												{notification.activity?.type.split("_").join(" ") ||
													"Notification"}
											</span>
											<span className="text-xs text-muted-foreground">
												{formatTimestamp(notification.createdAt)}
											</span>
										</div>

										<p className="text-sm text-foreground/80 mt-1 line-clamp-2">
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
						</div>
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
