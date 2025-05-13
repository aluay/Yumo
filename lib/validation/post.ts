import { z } from "zod";
import type { JSONContent } from "@tiptap/react";
import { ActivityType } from "@prisma/client";

/*-----------------------------------------------------------------*/
/*-----------------------------POSTS-------------------------------*/
/*-----------------------------------------------------------------*/
// INPUT – for create / update mutations
export const postInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string(),
	/* Novel stores JSON; accept null for drafts */
	content: z.custom<JSONContent | null>(
		(val) => {
			if (val === null) return true; // allow null
			return typeof val === "object" && (val as JSONContent).type === "doc";
		},
		{ message: "Invalid Novel document" }
	),
	tags: z.array(z.string()),
	status: z.enum(["DRAFT", "PUBLISHED"]),
});

// PAYLOAD – what the API returns to the client
export const postPayloadSchema = postInputSchema.extend({
	id: z.number(),
	createdAt: z.string(), // ISO timestamps – keep as string to avoid TZ drift
	updatedAt: z.string(),
	// deletedAt: z.string().nullable(), // soft‑delete marker
	likes: z.array(z.object({ userId: z.number() })),
	likeCount: z.number(),
	bookmarks: z.array(z.object({ userId: z.number() })),
	bookmarkCount: z.number(),
	author: z.object({
		id: z.number(),
		name: z.string(),
		image: z.string(),
	}),
	/* comment counter via Prisma’s _count include */
	_count: z.object({
		comments: z.number(),
	}),
});

// Types inferred from the schemas
export type PostInput = z.infer<typeof postInputSchema>;
export type PostPayload = z.infer<typeof postPayloadSchema>;

/*-----------------------------------------------------------------*/
/*-----------------------------COMMENTS----------------------------*/
/*-----------------------------------------------------------------*/
// INPUT – for create/update
export const commentInputSchema = z.object({
	content: z.custom<JSONContent | null>(
		(val) => {
			if (val === null) return true; // allow null
			return typeof val === "object" && (val as JSONContent).type === "doc";
		},
		{ message: "Invalid Novel document" }
	),
	postId: z.number(),
	parentId: z.number().optional(),
});

// FORWARD DECLARE the schema variable type first
type CommentPayload = z.infer<typeof commentInputSchema> & {
	id: number;
	authorId: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	likeCount: number;
	replyCount: number;
	reportCount: number;
	author: {
		id: number;
		name: string;
		image: string | null;
	};
	post: {
		id: number;
		title: string;
	};
	likes?: { userId: number }[];
	reports?: { userId: number }[];
	replies?: CommentPayload[];
};

// EXPLICITLY declare the schema with `z.ZodType<CommentPayload>`
export const commentPayloadSchema: z.ZodType<CommentPayload> =
	commentInputSchema.extend({
		id: z.number(),
		authorId: z.number(),
		createdAt: z.string(),
		updatedAt: z.string(),
		deletedAt: z.string().nullable(),
		likeCount: z.number(),
		replyCount: z.number(),
		reportCount: z.number(),
		author: z.object({
			id: z.number(),
			name: z.string(),
			image: z.string().nullable(),
		}),
		post: z.object({
			id: z.number(),
			title: z.string(),
		}),
		likes: z.array(z.object({ userId: z.number() })).optional(),
		reports: z.array(z.object({ userId: z.number() })).optional(),
		replies: z.lazy(() => z.array(commentPayloadSchema)).optional(),
	});

// Types inferred from schemas
export type CommentInput = z.infer<typeof commentInputSchema>;
export type commentPayloadSchemaType = z.infer<typeof commentPayloadSchema>;

/*-----------------------------------------------------------------*/
/*-----------------------------PROFILE----------------------------*/
/*-----------------------------------------------------------------*/
// INPUT – for update profile edits
export const profileInputSchema = z.object({
	name: z.string().min(2).max(60),
	website: z.string().max(100).optional().nullable(),
	bio: z.string().max(1000).optional().nullable(),
	image: z.union([z.string().url(), z.literal(""), z.null(), z.undefined()]),
	pageContent: z
		.custom<JSONContent | null>(
			(val) => {
				if (val === null) return true;
				return typeof val === "object" && (val as JSONContent).type === "doc";
			},
			{ message: "Invalid Novel document" }
		)
		.optional()
		.nullable(),
});

export const likeSchema = z.object({
	commentId: z.number(),
});

/*-----------------------------------------------------------------*/
/*-----------------------------ACTIVITY----------------------------*/
/*-----------------------------------------------------------------*/
export const activitySchema = z.object({
	type: z.enum([
		"POST_CREATED",
		"POST_LIKED",
		"POST_BOOKMARKED",
		"COMMENT_POSTED",
		"COMMENT_LIKED",
	]),
	targetType: z.enum(["POST", "COMMENT", "USER"]),
	targetId: z.number().int().positive(),
	message: z.string().max(300).optional(),
	mentionedUserIds: z.array(z.number().int().positive()).optional(),
});

export type activitySchemaType = z.infer<typeof activitySchema>;

export const deleteSchema = z.object({
	userId: z.number(),
	type: z.enum([
		"POST_CREATED",
		"POST_LIKED",
		"POST_BOOKMARKED",
		"COMMENT_POSTED",
		"COMMENT_LIKED",
	]),
	targetId: z.number(),
});

export type deleteSchemaType = z.infer<typeof deleteSchema>;

export type ActivityLog = {
	id: number;
	userId: number;
	type: ActivityType;
	targetId: number;
	message: string | null;
	createdAt: Date;
	Post?: {
		id: number;
		title: string;
	};
	mentions?: {
		user: {
			id: number;
			name: string;
			image: string | null;
		};
	}[];
};

export interface UserProfileInterface {
	id: number;
	name: string;
	email: string;
	image: string | null;

	website: string | null;
	bio: string | null;
	pageContent: JSONContent | null;

	posts: PostPayload[];
	comments: commentPayloadSchemaType[];
	// Activity: ActivityLog[];
	// postLikes: PostLike[];
	// postBookmarks: PostBookmark[];
	// commentLikes: CommentLike[];

	createdAt: Date;
	updatedAt: Date;
}

export interface PostLike {
	userId: number;
	postId: number;
	createdAt: Date;
	post: {
		id: number;
		title: string;
	};
	user: {
		id: number;
		name: string;
		image: string | null;
	};
}

export interface PostBookmark {
	userId: number;
	postId: number;
	createdAt: Date;
	post: {
		id: number;
		title: string;
	};
	user: {
		id: number;
		name: string;
		image: string | null;
	};
}

export interface CommentLike {
	userId: number;
	commentId: number;
	createdAt: Date;
	comment: {
		id: number;
		content: JSONContent;
	};
	user: {
		id: number;
		name: string;
		image: string | null;
	};
}

/*-----------------------------------------------------------------*/
/*-----------------------------NOTIFICATION------------------------*/
/*-----------------------------------------------------------------*/
export const notificationSchema = z.object({
	id: z.number().int().positive(),
	recipientId: z.number().int().positive(),
	activityId: z.number().int().positive(),
	isRead: z.boolean().default(false),
	createdAt: z.date().or(z.string().datetime()),
	readAt: z.date().or(z.string().datetime()).nullable().optional(),

	// Include the related activity data
	activity: activitySchema,
});

export interface NotificationPayload {
	id: number;
	recipientId: number;
	isRead: boolean;
	createdAt: string;
	readAt: string | null;
	activity?: {
		id: number;
		userId: number;
		type: string;
		targetId: number;
		targetType: string;
		message?: string | null;
		createdAt: string;
		title: string;
		description: string;
		user: {
			id: number;
			name: string;
			image?: string;
		};
	};
	relatedContent?: {
		type: string;
		id: number;
		title: string;
	};
	actionText: string;
	actionUrl: string;
	targetContent?: {
		title: string;
		type: string;
		parentType?: string;
	};
}
