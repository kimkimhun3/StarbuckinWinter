import type { Metadata } from 'next'
import { apiClient } from '@/lib/api-client'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every 60 seconds

// Helper function to parse bilingual title
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

// Generate metadata for SEO and social sharing
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const { post } = await apiClient.getPostBySlug(slug)
    
    // Parse bilingual title
    const { english, japanese } = parseBilingualTitle(post.title)
    
    // Create caption from post data
    const caption = `${new Date(post.createdAt).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} · 中野 · 東京`
    
    // Get the site URL from environment variable
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const postUrl = `${siteUrl}/blog/${slug}`
    
    // Ensure image URL is absolute for social media sharing
    // Post coverImage is stored as a string URL in the database
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
    
    // Log for debugging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Metadata] Post ${slug}:`)
      console.log(`  - coverImage from DB:`, post.coverImage)
      console.log(`  - Final coverImageUrl:`, coverImageUrl)
    }
    
    // Prepare the description
    const description = post.excerpt || post.description || caption
    
    return {
      title: `${english} | ${japanese}`, // Bilingual title in tab
      description: description,
      
      // Open Graph metadata for Facebook, LinkedIn, etc.
      openGraph: {
        title: english, // Use English title for OG
        description: caption, // Using caption for social preview
        images: [
          {
            url: coverImageUrl,
            width: 1200,
            height: 630,
            alt: english,
            type: 'image/jpeg', // Help social platforms understand the image type
          },
        ],
        url: postUrl,
        type: 'article',
        siteName: 'みちへしらない (Unknown Roads)',
        locale: 'ja_JP',
        ...(post.createdAt && {
          publishedTime: new Date(post.createdAt).toISOString(),
        }),
        ...(post.updatedAt && {
          modifiedTime: new Date(post.updatedAt).toISOString(),
        }),
        authors: post.authorName || post.author?.name || 'Anonymous',
      },
      
      // Twitter Card metadata (X/Twitter uses different format)
      twitter: {
        card: 'summary_large_image',
        title: english,
        description: caption,
        images: [coverImageUrl], // Twitter images can be string array or object
        creator: '@your_twitter_handle', // Optional: Add your Twitter handle
      },
      
      // Additional metadata
      alternates: {
        canonical: postUrl,
      },
    }
  } catch (error) {
    // Silent fallback - don't log expected errors during development
    const formattedSlug = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    return {
      title: `${formattedSlug} | みちへしらない`,
      description: 'Travel blog exploring Japan and beyond',
    }
  }
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}