import { cache } from 'react'
import prisma from '@/lib/prisma'

/**
 * Server-only cached fetcher for a post by slug.
 * Uses React cache() so multiple calls in the same request (e.g. metadata + page) hit DB once.
 */
export const getPostBySlugCached = cache(async (slug: string) => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      comments: {
        where: { approved: true },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!post || !post.published) return null
  return post
})
