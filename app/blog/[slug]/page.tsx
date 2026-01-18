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
    // Post coverImage is stored as a string URL in the database (e.g., https://countrysidestays-japan.com/img/article/shobara/story_mv.jpg)
    const getAbsoluteImageUrl = (imageUrl: string | null | undefined): string => {
      // Check if coverImage exists and is not empty
      if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        // Return default image if no cover image provided
        return `${siteUrl}/og-default.jpg`
      }
      
      const trimmedUrl = imageUrl.trim()
      
      // If already absolute URL (starts with http:// or https://), use as is
      // This is the most common case - user pastes full URL like https://countrysidestays-japan.com/img/article/shobara/story_mv.jpg
      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return trimmedUrl
      }
      
      // Otherwise, make it absolute by prepending siteUrl
      // Handles relative paths like /images/photo.jpg
      return trimmedUrl.startsWith('/') ? `${siteUrl}${trimmedUrl}` : `${siteUrl}/${trimmedUrl}`
    }
    
    // Get cover image URL from post - this comes directly from database
    const coverImageUrl = getAbsoluteImageUrl(post.coverImage)
    
    // Debug logging (can be removed in production)
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

// Server Component that renders the Client Component
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  // Pass the slug to the client component
  return <BlogPostClient slug={slug} />
}