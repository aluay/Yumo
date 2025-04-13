// Get scripts from API and return them as JSON
const getScripts = async () => {
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
export default getScripts;
