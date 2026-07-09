import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'

// GET /api/moments - List published entries (public)
// GET /api/moments?all=true - List all entries including hidden (admin only)
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

    const moments = await prisma.moment.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ moments })
  } catch (error) {
    console.error('Get moments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/moments - Create a new entry (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, coverImage, memo, images, published, order } =
      await request.json()

    // Validate input: a moment needs a title and a cover picture. Memo is optional.
    if (!title || !coverImage) {
      return NextResponse.json(
        { error: 'Title and cover image are required' },
        { status: 400 }
      )
    }

    const moment = await prisma.moment.create({
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

    return NextResponse.json({ moment }, { status: 201 })
  } catch (error) {
    console.error('Create moment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
