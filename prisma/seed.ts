import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Seed test users
// async function seedTestUsers() {
// 	const totalUsers = 5;

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

import { faker } from "@faker-js/faker";

const languages = [
	"javascript",
	"typescript",
	"python",
	"go",
	"rust",
	"java",
	"csharp",
	"php",
	"ruby",
	"kotlin",
];

async function seedPostsForUsers() {
	const users = await prisma.user.findMany({
		where: {
			email: {
				endsWith: "@dev.local",
			},
		},
	});

	for (const user of users) {
		for (let i = 1; i <= 5; i++) {
			await prisma.post.create({
				data: {
					// Generate a random, realistic-looking title
					title: faker.lorem.sentence(),

					// Short random description
					description: faker.lorem.sentences(2),

					// Keep your dummy code or generate random code snippet
					code: `console.log("${faker.hacker.phrase()}");`,

					// Fake TipTap JSON content (simplified)
					content: {
						type: "doc",
						content: [
							{
								type: "paragraph",
								content: [{ type: "text", text: faker.lorem.paragraph() }],
							},
						],
					},

					// Generate random tags (pick from predefined or faker words)
					tags: [faker.hacker.noun(), faker.hacker.verb()],

					// Random language (you can stick to 'javascript' or randomize)
					language: faker.helpers.arrayElement(languages),

					difficulty: faker.helpers.arrayElement([
						"BEGINNER",
						"INTERMEDIATE",
						"ADVANCED",
					]),
					dependencies: [],

					authorId: user.id,
				},
			});
		}

		console.log(`Seeded posts for ${user.email}`);
	}
}

async function main() {
	// await seedTestUsers();
	await seedPostsForUsers();
	console.log("Seeding complete.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
