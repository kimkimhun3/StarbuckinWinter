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
        title: 'Unknown Road| しらないみちへ',
        description: 'The requested blog post could not be found.',
      }
    }
    
    const { english, japanese } = parseBilingualTitle(post.title)
    
    const caption = `${new Date(post.createdAt).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} · 中野 · 東京`
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const postUrl = `${siteUrl}/blog/${slug}`
    
    // Process cover image URL
    let coverImageUrl = `${siteUrl}/og-default.jpg` // Fallback default
    
    if (post.coverImage && post.coverImage.trim()) {
      const img = post.coverImage.trim()
      if (img.startsWith('http://') || img.startsWith('https://')) {
        coverImageUrl = img
      } else {
        coverImageUrl = img.startsWith('/') ? `${siteUrl}${img}` : `${siteUrl}/${img}`
      }
    }
    
    // IMPORTANT: Log for debugging (visible in Vercel logs)
    console.log(`[Metadata] Slug: ${slug}`)
    console.log(`[Metadata] Title: ${english}`)
    console.log(`[Metadata] Raw coverImage: ${post.coverImage}`)
    console.log(`[Metadata] Processed coverImageUrl: ${coverImageUrl}`)
    console.log(`[Metadata] Site URL: ${siteUrl}`)
    
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
        siteName: 'しらないみちへ (Unknown Roads)',
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
    console.error(`[Metadata] Error generating metadata for ${slug}:`, error)
    
    const formattedSlug = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    return {
      title: `${formattedSlug} | しらないみちへ`,
      description: 'Travel blog exploring Japan and beyond',
      openGraph: {
        title: formattedSlug,
        description: 'Travel blog exploring Japan and beyond',
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-default.jpg`,
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-default.jpg`],
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