// import { getUserProfile } from "@/lib/api/api";
// import PageLayout from "@/components/layouts/PageLayout";
// import RichContentViewer from "@/components/shared/RichContentViewer";
// import PostCard from "@/components/shared/PostCard";
// import { formatDistanceToNow } from "date-fns";
// import { auth } from "@/lib/auth";
// import Image from "next/image";
// import Link from "next/link";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";
// import { Pencil } from "lucide-react";
// import { JSONContent } from "novel";

// export default async function Dashboard() {
// 	const session = await auth();
// 	const userId = Number(session?.user?.id) ?? null;
// 	const profile = await getUserProfile(userId);

// 	return (
// 		<PageLayout>
// 			<div className="flex flex-row-reverse gap-2">
// 				{Number(session?.user?.id) === profile?.id && (
// 					<Button size="icon" asChild>
// 						<Link href={`/profile/${profile.id}/edit`}>
// 							<Pencil />
// 						</Link>
// 					</Button>
// 				)}
// 			</div>
// 			<div className="max-w-4xl mx-auto p-4 space-y-8 bg-background rounded-md">
// 				{/* Profile header */}
// 				<div className="flex flex-col items-center md:flex-row md:items-start md:space-x-6 text-center md:text-left">
// 					<Image
// 						src={profile?.image ?? "/placeholder.png"}
// 						alt={profile?.name ?? "User Profile Image"}
// 						width={100}
// 						height={100}
// 						className="rounded-full object-cover border"
// 					/>
// 					<div className="mt-4 md:mt-0 space-y-1">
// 						<h1 className="text-2xl font-bold">{profile?.name}</h1>
// 						<p className="text-sm text-muted-foreground">{profile?.email}</p>
// 						{profile?.website && (
// 							<Link
// 								href={`${profile.website}`}
// 								className="text-base font-medium text-gray-800 dark:text-gray-200">
// 								{profile.website}
// 							</Link>
// 						)}
// 						{profile?.bio && (
// 							<p className="text-sm text-gray-600 dark:text-gray-400">
// 								{profile.bio}
// 							</p>
// 						)}
// 					</div>
// 				</div>

// 				{/* Rich content */}
// 				{profile?.pageContent && (
// 					<div className="prose dark:prose-invert max-w-none">
// 						<RichContentViewer content={profile.pageContent} />
// 					</div>
// 				)}
// 				<Separator />
// 				{/* Posts */}
// 				<div>
// 					{/* <h2 className="text-xl font-semibold mb-2">Posts</h2> */}
// 					<div className="space-y-3">
// 						{profile?.posts?.length ? (
// 							profile.posts.map((post) => (
// 								<PostCard key={post.id} post={post} />
// 							))
// 						) : (
// 							<p className="text-sm text-muted-foreground">No posts yet.</p>
// 						)}
// 					</div>
// 				</div>

// 				{/* Recent Comments */}
// 				<div>
// 					<h2 className="text-xl font-semibold mb-2">Recent Comments</h2>
// 					<div className="space-y-3">
// 						{profile?.comments?.length ? (
// 							profile.comments.map((comment) => (
// 								<div
// 									key={comment.id}
// 									className="border rounded-lg p-3 text-sm text-gray-800 dark:text-gray-200">
// 									<h2 className="scroll-m-20 font-bold tracking-tight first:mt-0">
// 										<Link
// 											href={`/posts/${comment.post.id}`}
// 											className="hover:text-blue-500 transition-colors">
// 											{comment.post.title}
// 										</Link>
// 									</h2>
// 									<RichContentViewer content={comment.content as JSONContent} />
// 									<p className="text-xs text-muted-foreground mt-1">
// 										Posted{" "}
// 										{formatDistanceToNow(new Date(comment.createdAt), {
// 											addSuffix: true,
// 										})}
// 									</p>
// 								</div>
// 							))
// 						) : (
// 							<p className="text-sm text-muted-foreground">No comments yet.</p>
// 						)}
// 					</div>
// 				</div>
// 			</div>
// 		</PageLayout>
// 	);
// }
