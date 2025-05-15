// A comprehensive test script for the fuzzy search API
const baseUrl = "http://localhost:3000";

async function testSearch(query) {
	try {
		console.log(`\n--- Testing search with query: "${query}" ---`);
		const response = await fetch(
			`${baseUrl}/api/v1/search?q=${encodeURIComponent(query)}&limit=10`
		);

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		console.log("Posts found:", data.posts.length);
		console.log("Users found:", data.users.length);
		console.log("Tags found:", data.tags.length);

		// Print post titles
		if (data.posts.length > 0) {
			console.log("\nPost titles:");
			data.posts.forEach((post) => {
				console.log(`- ${post.title} (Score: ${post.score.toFixed(2)})`);
			});
		}

		// Print user names
		if (data.users.length > 0) {
			console.log("\nUser names:");
			data.users.forEach((user) => {
				console.log(`- ${user.name} (Score: ${user.score.toFixed(2)})`);
			});
		}

		// Print tags
		if (data.tags.length > 0) {
			console.log("\nTags:");
			console.log(data.tags.join(", "));
		}

		return data;
	} catch (error) {
		console.error("Error testing search:", error);
		return null;
	}
}

// Run multiple tests with different queries
async function runTests() {
	// Test exact matches
	await testSearch("javascript");

	// Test partial matches
	await testSearch("java");

	// Test misspelled words
	await testSearch("javascrpt");

	// Test user search
	await testSearch("test user");

	// Test with typos in user names
	await testSearch("tesr usr");

	// Test mixed search
	await testSearch("react");

	// Test with two-character query (minimum length)
	await testSearch("js");
}

// Wait for server to start
setTimeout(runTests, 3000);
