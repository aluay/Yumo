import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/utils";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

// Seed test users
async function seedTestUsers() {
	const totalUsers = 5;

	for (let i = 1; i <= totalUsers; i++) {
		const username = `test${i}`;
		const email = `${username}@dev.local`;

		await prisma.user.upsert({
			where: { email },
			update: {},
			create: {
				email,
				name: `Test User ${i}`,
				image: `https://i.pravatar.cc/150?u=test${i}`,
			},
		});

		console.log(`Seeded user: ${email}`);
	}
}

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
					slug: slugify(post.title),
				},
			});
		}

		console.log(`Seeded posts for ${user.email}`);
	}
}

export async function backfillSlugs() {
	const posts = await prisma.post.findMany({ where: { slug: undefined } });
	for (const post of posts) {
		const baseSlug = slugify(post.title);
		let slug = baseSlug;
		while (
			await prisma.post.findFirst({ where: { slug, NOT: { id: post.id } } })
		) {
			slug = `${baseSlug}-${nanoid(6)}`;
		}
		await prisma.post.update({ where: { id: post.id }, data: { slug } });
		console.log(`Backfilled slug for post ${post.id}: ${slug}`);
	}
}

async function main() {
	await seedTestUsers();
	await seedPostsForUsers();
	await backfillSlugs();
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
