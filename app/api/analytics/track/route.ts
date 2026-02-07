import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/analytics/track - Record a page view with geo data from Vercel headers
export async function POST(request: NextRequest) {
  try {
    const { path, postId } = await request.json()

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }

    // Extract Vercel geo IP headers
    const city = request.headers.get('x-vercel-ip-city') || null
    const country = request.headers.get('x-vercel-ip-country') || null
    const countryRegion = request.headers.get('x-vercel-ip-country-region') || null

    // Decode URI-encoded city names (Vercel encodes them)
    const decodedCity = city ? decodeURIComponent(city) : null

    // Create the page view record
    const pageView = await prisma.pageView.create({
      data: {
        path,
        postId: postId || null,
        city: decodedCity,
        country,
        countryRegion,
      },
    })

    // If tracking a specific post, also increment the post's viewCount
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          viewCount: { increment: 1 },
        },
      })
    }

    return NextResponse.json({ success: true, id: pageView.id })
  } catch (error) {
    console.error('Analytics track error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
