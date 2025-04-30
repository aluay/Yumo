import { ActivityType } from "@prisma/client";

interface LogParams {
	userId: number;
	type: ActivityType;
	targetId: number;
	message?: string;
}

const BASE_URL =
	typeof window === "undefined"
		? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
		: "";

export async function logActivity({
	userId,
	type,
	targetId,
	message,
}: LogParams) {
	try {
		await fetch(`${BASE_URL}/api/activity`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId, type, targetId, message }),
		});
	} catch (err) {
		console.error("Failed to log activity:", err);
	}
}

export async function deleteActivity(
	userId: number,
	type: ActivityType,
	targetId: number
) {
	try {
		await fetch(`${BASE_URL}/api/activity`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId, type, targetId }),
		});
	} catch (err) {
		console.error("Failed to delete activity:", err);
	}
}
