import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'

// GET /api/posts - List all published posts (public)
// GET /api/posts?all=true - List all posts including drafts (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get('all') === 'true'

    let where = {}

    if (!showAll) {
      // Public: only show published posts
      where = { published: true }
    } else {
      // Admin: check authentication
      const user = getAuthUser(request)
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      // Show all posts including drafts
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ posts })

  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create a new post (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = getAuthUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, content, excerpt, coverImage, published, authorName, tags } = await request.json()

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Validate tags (max 7 tags)
    if (tags && Array.isArray(tags) && tags.length > 7) {
      return NextResponse.json(
        { error: 'Maximum 7 tags allowed' },
        { status: 400 }
      )
    }

    // Helper function to parse bilingual title and get English part
    function parseBilingualTitle(title: string): string {
      const delimiters = ['|', '/', ' - ']
      
      for (const delimiter of delimiters) {
        if (title.includes(delimiter)) {
          const parts = title.split(delimiter).map(part => part.trim())
          if (parts.length >= 2) {
            return parts[0] // Return English part (first part)
          }
        }
      }
      
      return title // If no delimiter found, return whole title
    }

    // Generate slug from English title only
    function generateSlugFromTitle(titleText: string): string {
      return titleText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters, keep letters, numbers, spaces, and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
        .trim()
    }

    const englishTitle = parseBilingualTitle(title)
    let baseSlug = generateSlugFromTitle(englishTitle)
    
    // Check for uniqueness and handle collisions
    let slug = baseSlug
    let counter = 0
    let isUnique = false
    
    while (!isUnique) {
      const existingPost = await prisma.post.findUnique({
        where: { slug }
      })
      
      if (!existingPost) {
        isUnique = true
      } else {
        counter++
        slug = `${baseSlug}-${counter}`
      }
      
      // Safety check to prevent infinite loop
      if (counter > 1000) {
        throw new Error('Unable to generate unique slug')
      }
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published: published || false,
        publishedAt: published ? new Date() : null,
        authorId: user.userId,
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

    return NextResponse.json({ post }, { status: 201 })

  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}