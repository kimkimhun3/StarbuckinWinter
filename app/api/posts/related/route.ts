import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/posts/related?postId=xxx&limit=4
 * Returns related posts (excludes current). Light payload: no full content.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '4', 10) || 4, 10)

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      )
    }

    const current = await prisma.post.findUnique({
      where: { id: postId },
      select: { tags: true },
    })

    if (!current) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const tags = (current.tags || []).filter(Boolean)
    const hasTags = tags.length > 0

    const related = await prisma.post.findMany({
      where: {
        published: true,
        id: { not: postId },
        ...(hasTags && {
          tags: { hasSome: tags },
        }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        createdAt: true,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    if (related.length >= limit) {
      return NextResponse.json({ posts: related })
    }

    const excludeIds = new Set([postId, ...related.map((p) => p.id)])
    const rest = await prisma.post.findMany({
      where: {
        published: true,
        id: { notIn: Array.from(excludeIds) },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        createdAt: true,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit - related.length,
    })

    const posts = [...related, ...rest]
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Related posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
