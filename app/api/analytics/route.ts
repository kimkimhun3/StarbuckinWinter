import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

// GET /api/analytics - Get analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request)

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30', 10)

    const since = new Date()
    since.setDate(since.getDate() - days)

    // Total page views in period
    const totalViews = await prisma.pageView.count({
      where: { createdAt: { gte: since } },
    })

    // Views by country
    const viewsByCountry = await prisma.pageView.groupBy({
      by: ['country'],
      where: { createdAt: { gte: since }, country: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    })

    // Views by city
    const viewsByCity = await prisma.pageView.groupBy({
      by: ['city', 'country'],
      where: { createdAt: { gte: since }, city: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    })

    // Views by path (top pages)
    const viewsByPath = await prisma.pageView.groupBy({
      by: ['path'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    })

    // Views per day for chart
    const viewsPerDay = await prisma.$queryRaw<
      { date: string; count: bigint }[]
    >`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "PageView"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    // Top posts by views in period
    const topPosts = await prisma.pageView.groupBy({
      by: ['postId'],
      where: { createdAt: { gte: since }, postId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    // Fetch post titles for top posts
    const postIds = topPosts
      .map((p) => p.postId)
      .filter((id): id is string => id !== null)
    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: { id: true, title: true, slug: true },
    })
    const postMap = new Map(posts.map((p) => [p.id, p]))

    const topPostsWithTitles = topPosts.map((p) => ({
      postId: p.postId,
      views: p._count.id,
      title: postMap.get(p.postId!)?.title || 'Unknown',
      slug: postMap.get(p.postId!)?.slug || '',
    }))

    // Recent views (latest 50)
    const recentViews = await prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        post: { select: { title: true, slug: true } },
      },
    })

    return NextResponse.json({
      totalViews,
      days,
      viewsByCountry: viewsByCountry.map((v) => ({
        country: v.country,
        views: v._count.id,
      })),
      viewsByCity: viewsByCity.map((v) => ({
        city: v.city,
        country: v.country,
        views: v._count.id,
      })),
      viewsByPath: viewsByPath.map((v) => ({
        path: v.path,
        views: v._count.id,
      })),
      viewsPerDay: viewsPerDay.map((v) => ({
        date: v.date,
        views: Number(v.count),
      })),
      topPosts: topPostsWithTitles,
      recentViews: recentViews.map((v) => ({
        id: v.id,
        path: v.path,
        city: v.city,
        country: v.country,
        countryRegion: v.countryRegion,
        createdAt: v.createdAt,
        postTitle: v.post?.title || null,
      })),
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
