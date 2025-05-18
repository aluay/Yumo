import { ActivityLog } from "@/lib/validation/post";

/**
 * Fetches recent activities of the current user.
 *
 * @param {Object} options - The options for fetching activities
 * @param {number} [options.limit=10] - The maximum number of activities to fetch
 * @param {number|null} [options.cursor=null] - The cursor for pagination
 * @returns {Promise<{ activities: ActivityLog[], nextCursor: number | null }>} The activities and next cursor
 */
export async function getUserActivities({
	limit = 10,
	cursor = null,
}: {
	limit?: number;
	cursor?: number | null;
} = {}): Promise<{
	activities: ActivityLog[];
	nextCursor: number | null;
}> {
	try {
		// Build query params
		const params = new URLSearchParams({
			limit: limit.toString(),
		});

		if (cursor) {
			params.append("cursor", cursor.toString());
		}

		const response = await fetch(
			`/api/v1/activity/users/me?${params.toString()}`
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to fetch activities");
		}

		const { data, nextCursor } = await response.json();

		return {
			activities: data,
			nextCursor,
		};
	} catch (error) {
		console.error("Error fetching user activities:", error);
		return {
			activities: [],
			nextCursor: null,
		};
	}
}
