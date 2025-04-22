// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
// 	await prisma.script.deleteMany(); // Optional: clear existing scripts

// 	const scripts = [
// 		{
// 			title: "Fetch Data with Axios",
// 			description: "A simple example using Axios to fetch data from an API.",
// 			content: { type: "doc", content: [] },
// 			language: "javascript",
// 			tags: ["http", "axios", "api"],
// 			difficulty: "BEGINNER",
// 			dependencies: ["axios"],
// 			status: "PUBLISHED",
// 			likes: 10,
// 			views: 500,
// 			authorId: 1,
// 		},
// 		{
// 			title: "File Upload in Flask",
// 			description: "Script to handle file uploads in a Flask server.",
// 			content: { type: "doc", content: [] },
// 			language: "python",
// 			tags: ["flask", "upload", "backend"],
// 			difficulty: "INTERMEDIATE",
// 			dependencies: ["flask"],
// 			status: "PUBLISHED",
// 			likes: 25,
// 			views: 1200,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Basic CRUD with Prisma",
// 			description: "Create, read, update, and delete records using Prisma ORM.",
// 			content: { type: "doc", content: [] },
// 			language: "typescript",
// 			tags: ["prisma", "orm", "crud"],
// 			difficulty: "BEGINNER",
// 			dependencies: ["@prisma/client"],
// 			status: "PUBLISHED",
// 			likes: 42,
// 			views: 3000,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Dockerizing a Node.js App",
// 			description:
// 				"Dockerfile and tips for containerizing a basic Node.js server.",
// 			content: { type: "doc", content: [] },
// 			language: "javascript",
// 			tags: ["docker", "nodejs", "container"],
// 			difficulty: "ADVANCED",
// 			dependencies: ["express"],
// 			status: "PUBLISHED",
// 			likes: 18,
// 			views: 880,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Simple Rust CLI",
// 			description: "Scaffold a basic CLI tool in Rust using clap.",
// 			content: { type: "doc", content: [] },
// 			language: "rust",
// 			tags: ["cli", "rust", "tooling"],
// 			difficulty: "INTERMEDIATE",
// 			dependencies: ["clap"],
// 			status: "PUBLISHED",
// 			likes: 8,
// 			views: 420,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Fetch Data with Axios",
// 			description: "A simple example using Axios to fetch data from an API.",
// 			content: { type: "doc", content: [] },
// 			language: "javascript",
// 			tags: ["http", "axios", "api"],
// 			difficulty: "BEGINNER",
// 			dependencies: ["axios"],
// 			status: "PUBLISHED",
// 			likes: 10,
// 			views: 500,
// 			authorId: 1,
// 		},
// 		{
// 			title: "File Upload in Flask",
// 			description: "Script to handle file uploads in a Flask server.",
// 			content: { type: "doc", content: [] },
// 			language: "python",
// 			tags: ["flask", "upload", "backend"],
// 			difficulty: "INTERMEDIATE",
// 			dependencies: ["flask"],
// 			status: "PUBLISHED",
// 			likes: 25,
// 			views: 1200,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Basic CRUD with Prisma",
// 			description: "Create, read, update, and delete records using Prisma ORM.",
// 			content: { type: "doc", content: [] },
// 			language: "typescript",
// 			tags: ["prisma", "orm", "crud"],
// 			difficulty: "BEGINNER",
// 			dependencies: ["@prisma/client"],
// 			status: "PUBLISHED",
// 			likes: 42,
// 			views: 3000,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Dockerizing a Node.js App",
// 			description:
// 				"Dockerfile and tips for containerizing a basic Node.js server.",
// 			content: { type: "doc", content: [] },
// 			language: "javascript",
// 			tags: ["docker", "nodejs", "container"],
// 			difficulty: "ADVANCED",
// 			dependencies: ["express"],
// 			status: "PUBLISHED",
// 			likes: 18,
// 			views: 880,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Simple Rust CLI",
// 			description: "Scaffold a basic CLI tool in Rust using clap.",
// 			content: { type: "doc", content: [] },
// 			language: "rust",
// 			tags: ["cli", "rust", "tooling"],
// 			difficulty: "INTERMEDIATE",
// 			dependencies: ["clap"],
// 			status: "PUBLISHED",
// 			likes: 8,
// 			views: 420,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Fetch Data with Axios",
// 			description: "A simple example using Axios to fetch data from an API.",
// 			content: { type: "doc", content: [] },
// 			language: "javascript",
// 			tags: ["http", "axios", "api"],
// 			difficulty: "BEGINNER",
// 			dependencies: ["axios"],
// 			status: "PUBLISHED",
// 			likes: 10,
// 			views: 500,
// 			authorId: 1,
// 		},
// 		{
// 			title: "File Upload in Flask",
// 			description: "Script to handle file uploads in a Flask server.",
// 			content: { type: "doc", content: [] },
// 			language: "python",
// 			tags: ["flask", "upload", "backend"],
// 			difficulty: "INTERMEDIATE",
// 			dependencies: ["flask"],
// 			status: "PUBLISHED",
// 			likes: 25,
// 			views: 1200,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Basic CRUD with Prisma",
// 			description: "Create, read, update, and delete records using Prisma ORM.",
// 			content: { type: "doc", content: [] },
// 			language: "typescript",
// 			tags: ["prisma", "orm", "crud"],
// 			difficulty: "BEGINNER",
// 			dependencies: ["@prisma/client"],
// 			status: "PUBLISHED",
// 			likes: 42,
// 			views: 3000,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Dockerizing a Node.js App",
// 			description:
// 				"Dockerfile and tips for containerizing a basic Node.js server.",
// 			content: { type: "doc", content: [] },
// 			language: "javascript",
// 			tags: ["docker", "nodejs", "container"],
// 			difficulty: "ADVANCED",
// 			dependencies: ["express"],
// 			status: "PUBLISHED",
// 			likes: 18,
// 			views: 880,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Simple Rust CLI",
// 			description: "Scaffold a basic CLI tool in Rust using clap.",
// 			content: { type: "doc", content: [] },
// 			language: "rust",
// 			tags: ["cli", "rust", "tooling"],
// 			difficulty: "INTERMEDIATE",
// 			dependencies: ["clap"],
// 			status: "PUBLISHED",
// 			likes: 8,
// 			views: 420,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Fetch Data with Axios",
// 			description: "A simple example using Axios to fetch data from an API.",
// 			content: { type: "doc", content: [] },
// 			language: "javascript",
// 			tags: ["http", "axios", "api"],
// 			difficulty: "BEGINNER",
// 			dependencies: ["axios"],
// 			status: "PUBLISHED",
// 			likes: 10,
// 			views: 500,
// 			authorId: 1,
// 		},
// 		{
// 			title: "File Upload in Flask",
// 			description: "Script to handle file uploads in a Flask server.",
// 			content: { type: "doc", content: [] },
// 			language: "python",
// 			tags: ["flask", "upload", "backend"],
// 			difficulty: "INTERMEDIATE",
// 			dependencies: ["flask"],
// 			status: "PUBLISHED",
// 			likes: 25,
// 			views: 1200,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Basic CRUD with Prisma",
// 			description: "Create, read, update, and delete records using Prisma ORM.",
// 			content: { type: "doc", content: [] },
// 			language: "typescript",
// 			tags: ["prisma", "orm", "crud"],
// 			difficulty: "BEGINNER",
// 			dependencies: ["@prisma/client"],
// 			status: "PUBLISHED",
// 			likes: 42,
// 			views: 3000,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Dockerizing a Node.js App",
// 			description:
// 				"Dockerfile and tips for containerizing a basic Node.js server.",
// 			content: { type: "doc", content: [] },
// 			language: "javascript",
// 			tags: ["docker", "nodejs", "container"],
// 			difficulty: "ADVANCED",
// 			dependencies: ["express"],
// 			status: "PUBLISHED",
// 			likes: 18,
// 			views: 880,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Simple Rust CLI",
// 			description: "Scaffold a basic CLI tool in Rust using clap.",
// 			content: { type: "doc", content: [] },
// 			language: "rust",
// 			tags: ["cli", "rust", "tooling"],
// 			difficulty: "INTERMEDIATE",
// 			dependencies: ["clap"],
// 			status: "PUBLISHED",
// 			likes: 8,
// 			views: 420,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Fetch Data with Axios",
// 			description: "A simple example using Axios to fetch data from an API.",
// 			content: { type: "doc", content: [] },
// 			language: "javascript",
// 			tags: ["http", "axios", "api"],
// 			difficulty: "BEGINNER",
// 			dependencies: ["axios"],
// 			status: "PUBLISHED",
// 			likes: 10,
// 			views: 500,
// 			authorId: 1,
// 		},
// 		{
// 			title: "File Upload in Flask",
// 			description: "Script to handle file uploads in a Flask server.",
// 			content: { type: "doc", content: [] },
// 			language: "python",
// 			tags: ["flask", "upload", "backend"],
// 			difficulty: "INTERMEDIATE",
// 			dependencies: ["flask"],
// 			status: "PUBLISHED",
// 			likes: 25,
// 			views: 1200,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Basic CRUD with Prisma",
// 			description: "Create, read, update, and delete records using Prisma ORM.",
// 			content: { type: "doc", content: [] },
// 			language: "typescript",
// 			tags: ["prisma", "orm", "crud"],
// 			difficulty: "BEGINNER",
// 			dependencies: ["@prisma/client"],
// 			status: "PUBLISHED",
// 			likes: 42,
// 			views: 3000,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Dockerizing a Node.js App",
// 			description:
// 				"Dockerfile and tips for containerizing a basic Node.js server.",
// 			content: { type: "doc", content: [] },
// 			language: "javascript",
// 			tags: ["docker", "nodejs", "container"],
// 			difficulty: "ADVANCED",
// 			dependencies: ["express"],
// 			status: "PUBLISHED",
// 			likes: 18,
// 			views: 880,
// 			authorId: 1,
// 		},
// 		{
// 			title: "Simple Rust CLI",
// 			description: "Scaffold a basic CLI tool in Rust using clap.",
// 			content: { type: "doc", content: [] },
// 			language: "rust",
// 			tags: ["cli", "rust", "tooling"],
// 			difficulty: "INTERMEDIATE",
// 			dependencies: ["clap"],
// 			status: "PUBLISHED",
// 			likes: 8,
// 			views: 420,
// 			authorId: 1,
// 		},
// 	];

// 	await prisma.script.createMany({
// 		data: scripts,
// 	});

// 	console.log("✅ Seeded scripts!");
// }

// main()
// 	.catch((e) => {
// 		console.error("❌ Seed failed:", e);
// 		process.exit(1);
// 	})
// 	.finally(async () => {
// 		await prisma.$disconnect();
// 	});

// Seed test users
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
// 	const totalUsers = 20; // change this to seed more

// 	for (let i = 1; i <= totalUsers; i++) {
// 		const username = `test${i}`;
// 		const email = `${username}@dev.local`;

// 		await prisma.user.upsert({
// 			where: { email },
// 			update: {},
// 			create: {
// 				email,
// 				name: `Test User ${i}`,
// 				image: `https://i.pravatar.cc/150?u=test${i}`,
// 			},
// 		});

// 		console.log(`Seeded user: ${email}`);
// 	}
// }

// main()
// 	.then(() => {
// 		console.log("✅ Seed complete");
// 		return prisma.$disconnect();
// 	})
// 	.catch((e) => {
// 		console.error(e);
// 		prisma.$disconnect();
// 		process.exit(1);
// 	});

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedScriptsForUsers() {
	const users = await prisma.user.findMany({
		where: {
			email: {
				endsWith: "@dev.local",
			},
		},
	});

	const dummyContent = {
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [{ type: "text", text: "Sample content..." }],
			},
		],
	};

	const dummyTags = ["example", "demo"];
	const dummyCode = `console.log("Hello, world!");`;

	for (const user of users) {
		for (let i = 1; i <= 10; i++) {
			await prisma.script.create({
				data: {
					title: `Script ${i} by ${user.name}`,
					description: `This is a demo script for ${user.name}.`,
					code: dummyCode,
					content: dummyContent,
					language: "javascript",
					tags: dummyTags,
					difficulty: "BEGINNER",
					dependencies: [],
					authorId: user.id,
				},
			});
		}

		console.log(`Seeded 10 scripts for ${user.email}`);
	}
}

seedScriptsForUsers()
	.then(() => {
		console.log("✅ Seed complete");
		return prisma.$disconnect();
	})
	.catch((e) => {
		console.error(e);
		prisma.$disconnect();
		process.exit(1);
	});
