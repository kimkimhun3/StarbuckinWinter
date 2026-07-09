import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'

// GET /api/random-messages - List published entries (public)
// GET /api/random-messages?all=true - List all entries including hidden (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get('all') === 'true'

    let where = {}

    if (!showAll) {
      // Public: only show published entries
      where = { published: true }
    } else {
      // Admin: check authentication
      const user = getAuthUser(request)
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const messages = await prisma.randomMessage.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get random messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/random-messages - Create a new entry (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, coverImage, memo, images, published, order } =
      await request.json()

    // Validate input: a place needs a name and a cover picture. Memo is optional.
    if (!title || !coverImage) {
      return NextResponse.json(
        { error: 'Title and cover image are required' },
        { status: 400 }
      )
    }

    const message = await prisma.randomMessage.create({
      data: {
        title,
        description: description || null,
        coverImage,
        memo: memo || null,
        images:
          images && Array.isArray(images)
            ? images.filter((url: string) => url.trim().length > 0)
            : [],
        published: published ?? true,
        order: typeof order === 'number' ? order : 0,
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Create random message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
