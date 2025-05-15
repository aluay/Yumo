import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  
  if (q.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  try {
    // Simple search without pg_trgm or custom functions
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
        status: 'PUBLISHED',
        deletedAt: null
      },
      select: {
        id: true,
        title: true,
        tags: true,
        likeCount: true,
        bookmarkCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      take: 10
    });

    // Extract tags from posts that contain the search query
    const allTags = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => {
        if (tag.toLowerCase().includes(q.toLowerCase())) {
          allTags.add(tag);
        }
      });
    });
    
    const tags = Array.from(allTags).slice(0, 10);

    return NextResponse.json({ posts, users, tags });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
