import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/posts/[id]/view - Increment view count (public, no auth required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Only allow incrementing view count for published posts
    if (!post.published) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Increment view count
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ 
      post: {
        id: updatedPost.id,
        viewCount: updatedPost.viewCount
      }
    })

  } catch (error) {
    console.error('Increment view count error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

