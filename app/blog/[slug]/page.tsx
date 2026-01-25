import type { Metadata } from 'next'
import { apiClient } from '@/lib/api-client'
import { notFound } from 'next/navigation'
import BlogPostClient from './BlogPostClient'

export const dynamic = 'force-dynamic'
export const revalidate = 60

function parseBilingualTitle(title: string): { english: string; japanese: string } {
  const delimiters = ['|', '/', ' - ']
  
  for (const delimiter of delimiters) {
    if (title.includes(delimiter)) {
      const parts = title.split(delimiter).map(part => part.trim())
      if (parts.length >= 2) {
        return {
          english: parts[0],
          japanese: parts[1]
        }
      }
    }
  }
  
  return {
    english: title,
    japanese: title
  }
}

// Generate metadata - THIS RUNS ON THE SERVER
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const { post } = await apiClient.getPostBySlug(slug)
    
    if (!post) {
      return {
        title: 'Post Not Found | みちへしらない',
        description: 'The requested blog post could not be found.',
      }
    }
    
    const { english, japanese } = parseBilingualTitle(post.title)
    
    const caption = `${new Date(post.createdAt).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} · 中野 · 東京`
    
    // Get the site URL from environment variable
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://starbuckin-winter.vercel.app'
    const postUrl = `${siteUrl}/blog/${slug}`
    
    // Ensure image URL is absolute for social media sharing
    const getAbsoluteImageUrl = (imageUrl: string | null | undefined): string => {
      if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        return `${siteUrl}/og-default.jpg`
      }
      
      const trimmedUrl = imageUrl.trim()
      
      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return trimmedUrl
      }
      
      return trimmedUrl.startsWith('/') ? `${siteUrl}${trimmedUrl}` : `${siteUrl}/${trimmedUrl}`
    }
    
    const coverImageUrl = getAbsoluteImageUrl(post.coverImage)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Metadata] Post ${slug}:`)
      console.log(`  - coverImage from DB:`, post.coverImage)
      console.log(`  - Final coverImageUrl:`, coverImageUrl)
    }
    
    const description = post.excerpt || post.description || caption
    
    return {
      title: `${english} | ${japanese}`,
      description: description,
      
      openGraph: {
        title: english,
        description: description,
        images: [
          {
            url: coverImageUrl,
            width: 1200,
            height: 630,
            alt: english,
            type: 'image/jpeg',
          },
        ],
        url: postUrl,
        type: 'article',
        siteName: 'みちへしらない (Unknown Roads)',
        locale: 'ja_JP',
        publishedTime: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
        modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
        authors: [post.authorName || post.author?.name || 'Anonymous'],
      },
      
      twitter: {
        card: 'summary_large_image',
        title: english,
        description: description,
        images: [coverImageUrl],
        creator: '@your_twitter_handle',
      },
      
      alternates: {
        canonical: postUrl,
      },
      
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    console.error('❌ Error generating metadata:', error)
    
    const formattedSlug = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    return {
      title: `${formattedSlug} | みちへしらない`,
      description: 'Travel blog exploring Japan and beyond',
      openGraph: {
        title: formattedSlug,
        description: 'Travel blog exploring Japan and beyond',
        images: [
          {
            url: 'https://res.cloudinary.com/duvusa8ck/image/upload/v1768729098/profile_anvogi.png',
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        images: ['https://res.cloudinary.com/duvusa8ck/image/upload/v1768729098/profile_anvogi.png'],
      },
    }
  }
}

// ✅ NEW: Server Component that FETCHES DATA and passes to client
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  try {
    // ✅ Fetch post data on server (only once!)
    const { post } = await apiClient.getPostBySlug(slug)
    
    if (!post) {
      notFound()
    }
    
    // ✅ Pass initial data to client component - NO DOUBLE FETCH!
    return <BlogPostClient slug={slug} initialPost={post} />
  } catch (error) {
    console.error('❌ Error loading post:', error)
    notFound()
  }
}