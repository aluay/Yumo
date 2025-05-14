import { getUserProfile } from "@/lib/api/api";
import PageLayout from "@/components/layouts/PageLayout";
import RichContentViewer from "@/components/shared/RichContentViewer";
import PostCard from "@/components/shared/PostCard";
import { formatDistanceToNow } from "date-fns";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Pencil,
	User,
	Calendar,
	Link as LinkIcon,
	Mail,
	MessageSquare,
	FileText,
} from "lucide-react";
import { JSONContent } from "novel";
import UserFollowedTags from "@/components/shared/UserFollowedTags";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowUserButton from "@/components/shared/FollowUserButton";

export default async function userPage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const session = await auth();
	const { userId } = await params;
	const decodedUserId = decodeURIComponent(userId);
	const profile = await getUserProfile(Number(decodedUserId));
	const isOwnProfile = Number(session?.user?.id) === profile?.id;
	if (!profile) return null;

	// Use follower/following data directly from profile
	const followerCount = profile.followerCount;
	const followingCount = profile.followingCount;

	return (
		<PageLayout>
			{/* Hero section with profile cover */}
			<div className="relative w-full h-24 sm:h-34 md:h-44 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg mb-16 overflow-visible">
				{/* Background pattern overlay */}
				<div
					className="absolute inset-0 opacity-10"
					style={{
						backgroundImage:
							"url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 2 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 2 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 2 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
					}}></div>
				{/* Edit button */}
				{isOwnProfile && (
					<div className="absolute top-4 right-4">
						<Button
							size="sm"
							variant="secondary"
							asChild
							className="backdrop-blur-sm bg-white/20 hover:bg-white/30 transition-all duration-200">
							<Link
								href={`/users/${profile.id}/edit`}
								className="flex items-center gap-1">
								<Pencil className="h-4 w-4" />
								<span className="hidden sm:inline">Edit Profile</span>
							</Link>
						</Button>
					</div>
				)}
				{/* Follow button (not own profile) */}
				{!isOwnProfile && profile?.id && (
					<div className="absolute top-4 right-4">
						<FollowUserButton 
							userId={profile.id} 
							initialIsFollowing={Array.isArray(profile.followers) && !!session?.user?.id && profile.followers.some(f => f.id === Number(session.user.id))}
						/>
					</div>
				)}
				{/* Avatar */}
				<div className="absolute left-1/2 -bottom-[40px] transform -translate-x-1/2 transition-transform duration-300 hover:scale-105 z-10">
					<Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-md">
						<AvatarImage
							src={profile?.image ?? "/placeholder.png"}
							alt={profile?.name ?? "User Profile"}
						/>
						<AvatarFallback>
							{profile?.name?.slice(0, 2).toUpperCase() || "UN"}
						</AvatarFallback>
					</Avatar>
				</div>
			</div>
			<div className="max-w-4xl mx-auto px-4">
				{/* Profile info section */}
				<div className="mt-10 sm:mt-12 flex flex-col items-center text-center animate-fade-in">
					<h1 className="text-2xl sm:text-3xl font-bold">{profile?.name}</h1>
					{/* Follower/Following counts and modals */}
					<div className="flex gap-4 justify-center mt-2">
						<FollowerFollowingStats
							followerCount={followerCount}
							followingCount={followingCount}
						/>
					</div>
					<div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 items-center justify-center">
						{profile?.email && profile?.showEmail && (
							<div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
								<Mail className="h-4 w-4 mr-1" />
								<span>{profile.email}</span>
							</div>
						)}
						{profile?.website && (
							<div className="flex items-center text-sm">
								<LinkIcon className="h-4 w-4 mr-1" />
								<Link
									href={profile.website}
									className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
									target="_blank"
									rel="noopener noreferrer">
									{profile.website.replace(/^https?:\/\/(www\.)?/, "")}
								</Link>
							</div>
						)}
					</div>
					{profile?.bio && (
						<p className="text-sm text-muted-foreground mt-3 max-w-xl">
							{profile.bio}
						</p>
					)}
				</div>
				{/* Tabs for content sections */}
				<Tabs defaultValue="about" className="mt-10 animate-fade-in">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="about">
							<User className="h-4 w-4 mr-1" />
							About
						</TabsTrigger>
						<TabsTrigger value="posts">
							<FileText className="h-4 w-4 mr-1" />
							Posts {profile?.posts?.length ? `(${profile.posts.length})` : ""}
						</TabsTrigger>
						<TabsTrigger value="comments">
							<MessageSquare className="h-4 w-4 mr-1" />
							Comments{" "}
							{profile?.comments?.length ? `(${profile.comments.length})` : ""}
						</TabsTrigger>
					</TabsList>
					{/* Posts Tab */}
					<TabsContent
						value="posts"
						className="mt-4 sm:mt-6 space-y-4 animate-fade-up">
						<h2 className="text-xl font-semibold">Posts</h2>{" "}
						{profile?.posts?.length ? (
							<div className="mx-auto w-full max-w-xl grid gap-4 place-items-center">
								{profile.posts.map((post, index) => (
									<div
										key={post.id}
										className="transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md w-full"
										style={{ animationDelay: `${index * 50}ms` }}>
										<PostCard post={post} />
									</div>
								))}
							</div>
						) : (
							<Card className="border border-muted">
								<CardContent className="flex flex-col items-center justify-center py-10">
									<FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
									<p className="text-muted-foreground">No posts yet.</p>
									{isOwnProfile && (
										<Button
											variant="outline"
											size="sm"
											className="mt-4"
											asChild>
											<Link href="/posts/new">Create your first post</Link>
										</Button>
									)}
								</CardContent>
							</Card>
						)}
					</TabsContent>{" "}
					{/* Comments Tab */}
					<TabsContent
						value="comments"
						className="mt-6 space-y-4 animate-fade-up">
						<h2 className="text-xl font-semibold">Recent Comments</h2>
						{profile?.comments?.length ? (
							<div className="grid gap-4">
								{profile.comments.map((comment, index) => (
									<Card
										key={comment.id}
										className="overflow-hidden border border-muted hover:border-muted-foreground/20 transition-all duration-300 hover:shadow-md"
										style={{ animationDelay: `${index * 50}ms` }}>
										<CardHeader className="pb-2 bg-muted/30">
											<Link href={`/posts/${comment.post.id}`}>
												<CardTitle className="text-lg hover:text-primary transition-colors">
													{comment.post.title}
												</CardTitle>
											</Link>
										</CardHeader>
										<CardContent className="pt-4">
											<div className="prose-sm dark:prose-invert max-w-none">
												<RichContentViewer
													content={comment.content as JSONContent}
												/>
											</div>
										</CardContent>
										<CardFooter className="pt-0 text-xs text-muted-foreground border-t mt-2 pt-2 flex justify-between">
											<div className="flex items-center">
												<Calendar className="h-3 w-3 mr-1" />
												<span>
													{formatDistanceToNow(new Date(comment.createdAt), {
														addSuffix: true,
													})}
												</span>
											</div>
											<Link
												href={`/posts/${comment.post.id}`}
												className="text-primary hover:underline transition-colors">
												View post
											</Link>
										</CardFooter>
									</Card>
								))}
							</div>
						) : (
							<Card className="border border-muted">
								<CardContent className="flex flex-col items-center justify-center py-10">
									<MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
									<p className="text-muted-foreground">No comments yet.</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>{" "}
					{/* About Tab */}
					<TabsContent value="about" className="mt-6 space-y-4 animate-fade-up">
						<h2 className="text-xl font-semibold">About</h2>
						<Card className="border border-muted overflow-hidden">
							<CardHeader className="bg-muted/30">
								<CardTitle className="text-lg">Profile Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6 pt-6">
								{/* Rich Content */}
								{profile?.pageContent ? (
									<div className="prose dark:prose-invert max-w-none">
										<RichContentViewer content={profile.pageContent} />
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-8 text-center px-4">
										<User className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
										<p className="text-muted-foreground">
											No additional information provided.
										</p>
										{isOwnProfile && (
											<Button
												variant="outline"
												size="sm"
												className="mt-4"
												asChild>
												<Link href={`/users/${profile.id}/edit`}>
													Add information
												</Link>
											</Button>
										)}
									</div>
								)}{" "}
								{/* Followed Tags */}
								<UserFollowedTags userId={Number(decodedUserId)} />
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</PageLayout>
	);
}

function FollowerFollowingStats({
  followerCount,
  followingCount,
}: {
  followerCount: number;
  followingCount: number;
}) {
  return (
    <>
      <span className="text-sm">
        <b>{followerCount}</b> Followers
      </span>
      <span className="text-sm">
        <b>{followingCount}</b> Following
      </span>
    </>
  );
}
