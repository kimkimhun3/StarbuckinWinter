import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'

// GET /api/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params  // Await params first
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        comments: {
          where: { approved: true },
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // If post is not published, only admin can see it
    if (!post.published) {
      const user = getAuthUser(request)
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - Update post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params  // Await params first
    
    // Check authentication
    const user = getAuthUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, content, excerpt, coverImage, published, authorName, tags } = await request.json()

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Validate tags (max 7 tags)
    if (tags && Array.isArray(tags) && tags.length > 7) {
      return NextResponse.json(
        { error: 'Maximum 7 tags allowed' },
        { status: 400 }
      )
    }

    // Update post
    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        excerpt,
        coverImage,
        published,
        publishedAt: published && !existingPost.published ? new Date() : existingPost.publishedAt,
        authorName: authorName || null,
        tags: tags && Array.isArray(tags) ? tags.filter((tag: string) => tag.trim().length > 0).slice(0, 7) : []
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Delete post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params  // Await params first
    
    // Check authentication
    const user = getAuthUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Delete post (comments will be cascade deleted)
    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Post deleted successfully' })

  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}