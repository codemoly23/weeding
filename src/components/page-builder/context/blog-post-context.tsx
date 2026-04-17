"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { BlogPostData } from "@/lib/page-builder/types";

const BlogPostContext = createContext<BlogPostData | null>(null);

export function BlogPostProvider({
  post,
  children,
}: {
  post: BlogPostData;
  children: ReactNode;
}) {
  return (
    <BlogPostContext.Provider value={post}>{children}</BlogPostContext.Provider>
  );
}

/**
 * Returns the current blog post when rendered inside a BlogPostProvider,
 * or null when rendered outside (e.g., on a non-blog-detail page).
 */
export function useBlogPostContext(): BlogPostData | null {
  return useContext(BlogPostContext);
}
