import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'

// GET /api/moments/[id] - Get a single entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const moment = await prisma.moment.findUnique({
      where: { id },
    })

    if (!moment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Hidden entries are only visible to admins
    if (!moment.published) {
      const user = getAuthUser(request)
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ moment })
  } catch (error) {
    console.error('Get moment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/moments/[id] - Update an entry (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = getAuthUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, coverImage, memo, images, published, order } =
      await request.json()

    const existing = await prisma.moment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!title || !coverImage) {
      return NextResponse.json(
        { error: 'Title and cover image are required' },
        { status: 400 }
      )
    }

    const moment = await prisma.moment.update({
      where: { id },
      data: {
        title,
        description: description || null,
        coverImage,
        memo: memo || null,
        images:
          images && Array.isArray(images)
            ? images.filter((url: string) => url.trim().length > 0)
            : [],
        published: published ?? existing.published,
        order: typeof order === 'number' ? order : existing.order,
      },
    })

    return NextResponse.json({ moment })
  } catch (error) {
    console.error('Update moment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/moments/[id] - Delete an entry (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = getAuthUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.moment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.moment.delete({ where: { id } })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Delete moment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
