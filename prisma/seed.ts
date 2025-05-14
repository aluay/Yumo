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
import { JSONContent } from "@tiptap/react";

const sampleTags = [
	"javascript",
	"react",
	"typescript",
	"node",
	"webdev",
	"css",
	"frontend",
	"backend",
	"api",
	"mongodb",
	"postgres",
	"auth",
	"devtools",
	"testing",
	"design",
];

const sampleTitles = [
	"10 Things I Wish I Knew Before Learning JavaScript",
	"How I Built a Real-Time Chat App with Socket.io",
	"Understanding React Hooks by Building a Todo App",
	"From Zero to Production: My Fullstack Project Journey",
	"Design Patterns Every Backend Developer Should Know",
];

const sampleDescriptions = [
	"A quick rundown of lessons and pitfalls while learning JavaScript.",
	"Exploring the challenges and joys of building a chat app.",
	"Learning React hooks through hands-on experience.",
	"How I went from idea to deployed app — tips included.",
	"Useful backend architecture techniques for real-world apps.",
];

function getRandomTiptapContent(): JSONContent {
	return {
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [
					{
						type: "text",
						text: faker.lorem.paragraphs(2),
					},
				],
			},
		],
	};
}

function getRandomTags(): string[] {
	return faker.helpers
		.shuffle(sampleTags)
		.slice(0, faker.number.int({ min: 2, max: 4 }));
}

function getRandomPost() {
	const index = faker.number.int({ min: 0, max: sampleTitles.length - 1 });
	return {
		title: sampleTitles[index],
		description: sampleDescriptions[index],
		content: getRandomTiptapContent(),
		tags: getRandomTags(),
	};
}

export async function seedPostsForUsers() {
	const users = await prisma.user.findMany({
		where: {
			email: { endsWith: "@dev.local" },
		},
	});

	for (const user of users) {
		for (let i = 1; i <= 1; i++) {
			const post = getRandomPost();

			await prisma.post.create({
				data: {
					...post,
					authorId: user.id,
				},
			});
		}

		console.log(`Seeded posts for ${user.email}`);
	}
}

// import { faker } from "@faker-js/faker";

// async function seedPostsForUsers() {
// 	const users = await prisma.user.findMany({
// 		where: {
// 			email: {
// 				endsWith: "@dev.local",
// 			},
// 		},
// 	});

// 	for (const user of users) {
// 		for (let i = 1; i <= 5; i++) {
// 			await prisma.post.create({
// 				data: {
// 					// Generate a random, realistic-looking title
// 					title: faker.lorem.sentence(),

// 					// Short random description
// 					description: faker.lorem.sentences(2),

// 					// Fake TipTap JSON content (simplified)
// 					content: {
// 						type: "doc",
// 						content: [
// 							{
// 								type: "paragraph",
// 								content: [{ type: "text", text: faker.lorem.paragraph() }],
// 							},
// 						],
// 					},

// 					// Generate random tags (pick from predefined or faker words)
// 					tags: [faker.hacker.noun(), faker.hacker.verb()],

// 					authorId: user.id,
// 				},
// 			});
// 		}

// 		console.log(`Seeded posts for ${user.email}`);
// 	}
// }

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
