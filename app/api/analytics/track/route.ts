// app/api/analytics/track/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendPageViewNotification } from '@/lib/email'

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

    // Get post title if tracking a specific post
    let postTitle = null
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { title: true },
      })
      
      if (post) {
        postTitle = post.title
        // Increment view count
        await prisma.post.update({
          where: { id: postId },
          data: { viewCount: { increment: 1 } },
        })
      }
    }

    // Send email notification asynchronously (don't block the response)
    sendPageViewNotification({
      path,
      city: decodedCity,
      country,
      countryRegion,
      postTitle,
    }).catch((error) => {
      console.error('Email notification error:', error)
    })

    return NextResponse.json({ success: true, id: pageView.id })
  } catch (error) {
    console.error('Analytics track error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}