// Get scripts from API and return them as JSON
export const getScripts = async () => {
	try {
		const res = await fetch("/api/scripts");
		if (!res.ok) throw new Error("Failed to fetch scripts");
		const data = await res.json();
		return data;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.error("An unexpected error occurred");
		}
		return [];
	}
};

// Get all scripts that belong to the currently authenticated user
export const getUserScripts = async (userId: number) => {
	try {
		const res = await fetch(`/api/scripts/user/${userId}`);
		console.log(userId);
		if (!res.ok) throw new Error("Failed to fetch scripts");
		const data = await res.json();
		return data;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.error("An unexpected error occurred");
		}
		return [];
	}
};
