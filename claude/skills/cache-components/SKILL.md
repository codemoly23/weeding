---
name: cache-components
description: This skill should be used when the user asks about "component caching", "React cache", "unstable_cache", "revalidate", "ISR", "static generation", "dynamic rendering", "caching strategies", "data cache", "full route cache", or mentions "cache()", "revalidatePath", "revalidateTag". Provides guidance for Next.js caching and component optimization.
---

# Next.js Caching & Component Optimization

Guides you through implementing effective caching strategies in Next.js applications.

## Caching Overview

Next.js has four caching mechanisms:

| Mechanism        | What                              | Where  | Purpose                     | Duration              |
| ---------------- | --------------------------------- | ------ | --------------------------- | --------------------- |
| Request Memoization | Return values of functions     | Server | Re-use data in React tree   | Per-request lifecycle |
| Data Cache       | Data                              | Server | Store data across requests  | Persistent            |
| Full Route Cache | HTML and RSC payload              | Server | Reduce rendering cost       | Persistent            |
| Router Cache     | RSC Payload                       | Client | Reduce server requests      | Session               |

## Server Component Caching

### Using `cache()` for Request Memoization

```tsx
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  const user = await db.user.findUnique({ where: { id } });
  return user;
});

// Call multiple times - only executes once per request
const user1 = await getUser(id);
const user2 = await getUser(id); // Returns memoized result
```

### Using `unstable_cache` for Data Cache

```tsx
import { unstable_cache } from 'next/cache';

const getCachedUser = unstable_cache(
  async (id: string) => {
    return await db.user.findUnique({ where: { id } });
  },
  ['user-cache'],
  {
    tags: ['user'],
    revalidate: 3600, // 1 hour
  }
);
```

## Revalidation Strategies

### Time-based Revalidation

```tsx
// In fetch
fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }
});

// In route segment config
export const revalidate = 3600;
```

### On-demand Revalidation

```tsx
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate a specific path
revalidatePath('/blog');

// Revalidate by tag
revalidateTag('posts');
```

## Static vs Dynamic Rendering

### Force Static Generation

```tsx
export const dynamic = 'force-static';
export const revalidate = false;
```

### Force Dynamic Rendering

```tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

## Component Optimization Patterns

### Streaming with Suspense

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>My Page</h1>
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
```

### Parallel Data Fetching

```tsx
async function Page() {
  // Start both fetches in parallel
  const userPromise = getUser();
  const postsPromise = getPosts();

  // Wait for both
  const [user, posts] = await Promise.all([
    userPromise,
    postsPromise
  ]);

  return <div>...</div>;
}
```

## Best Practices

1. **Use Server Components by default**: They're automatically cached
2. **Colocate data fetching**: Fetch data where it's used
3. **Use tags for granular revalidation**: Tag related data for efficient cache invalidation
4. **Implement Suspense boundaries**: Improve perceived performance with streaming
5. **Avoid unnecessary client components**: Only use `'use client'` when needed

## Debugging Cache

```tsx
// Check if data is cached
export const dynamic = 'force-dynamic'; // Temporarily disable cache

// Log cache hits
console.log('Fetching data at:', new Date().toISOString());
```
