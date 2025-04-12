// Import the Prisma client
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	// Sample scripts to insert
	const scripts = [
		{
			title: "Hello World in Python",
			content: {
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text", text: 'print("Hello, World!")' }],
					},
				],
			},
			language: "Python",
			tags: ["beginner", "hello world"],
		},
		{
			title: "Simple Express Server",
			content: {
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [
							{
								type: "text",
								text: 'const express = require("express"); const app = express(); app.listen(3000);',
							},
						],
					},
				],
			},
			language: "JavaScript",
			tags: ["node", "server", "express"],
		},
		{
			title: "SQL Select Example",
			content: {
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [
							{
								type: "text",
								text: "SELECT * FROM users WHERE active = true;",
							},
						],
					},
				],
			},
			language: "SQL",
			tags: ["sql", "query"],
		},
	];

	// Insert scripts into the database
	for (const script of scripts) {
		await prisma.script.create({
			data: {
				title: script.title,
				content: script.content,
				language: script.language,
				tags: script.tags,
				// Optional: add authorId if you want to associate with a user
			},
		});
	}

	console.log("Seed data inserted successfully.");
}

// Execute the seeding and handle errors
main()
	.catch((e) => {
		console.error("Error seeding data:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
