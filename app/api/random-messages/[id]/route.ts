import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'

// GET /api/random-messages/[id] - Get a single entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const message = await prisma.randomMessage.findUnique({
      where: { id },
    })

    if (!message) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Hidden entries are only visible to admins
    if (!message.published) {
      const user = getAuthUser(request)
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Get random message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/random-messages/[id] - Update an entry (admin only)
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

    const existing = await prisma.randomMessage.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!title || !coverImage) {
      return NextResponse.json(
        { error: 'Title and cover image are required' },
        { status: 400 }
      )
    }

    const message = await prisma.randomMessage.update({
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

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Update random message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/random-messages/[id] - Delete an entry (admin only)
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

    const existing = await prisma.randomMessage.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.randomMessage.delete({ where: { id } })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Delete random message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
