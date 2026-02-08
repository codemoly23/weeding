import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET single published blog post by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!post || post.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}
