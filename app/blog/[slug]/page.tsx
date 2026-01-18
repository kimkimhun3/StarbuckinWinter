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
  
  console.log('=== METADATA GENERATION START ===')
  console.log('Slug:', slug)
  console.log('ENV NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
  console.log('ENV exists?:', !!process.env.NEXT_PUBLIC_SITE_URL)
  
  try {
    const { post } = await apiClient.getPostBySlug(slug)
    
    if (!post) {
      console.error('❌ Post not found:', slug)
      return {
        title: 'Post Not Found | みちへしらない',
        description: 'The requested blog post could not be found.',
      }
    }
    
    console.log('✅ Post found:', post.id)
    console.log('Post title:', post.title)
    console.log('Post coverImage (raw):', post.coverImage)
    console.log('CoverImage type:', typeof post.coverImage)
    console.log('CoverImage is empty?:', !post.coverImage || post.coverImage.trim() === '')
    
    const { english, japanese } = parseBilingualTitle(post.title)
    
    const caption = `${new Date(post.createdAt).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} · 中野 · 東京`
    
    // Use hardcoded URL for now to test
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://starbuckin-winter.vercel.app'
    const postUrl = `${siteUrl}/blog/${slug}`
    
    console.log('Site URL:', siteUrl)
    
    // Process cover image URL
    let coverImageUrl = `${siteUrl}/og-default.jpg` // Fallback default
    
    if (post.coverImage && post.coverImage.trim()) {
      const img = post.coverImage.trim()
      console.log('Processing image:', img)
      
      if (img.startsWith('http://') || img.startsWith('https://')) {
        coverImageUrl = img
        console.log('✅ Using absolute URL:', coverImageUrl)
      } else {
        coverImageUrl = img.startsWith('/') ? `${siteUrl}${img}` : `${siteUrl}/${img}`
        console.log('✅ Converted to absolute URL:', coverImageUrl)
      }
    } else {
      console.log('⚠️ No coverImage found, using fallback')
    }
    
    console.log('Final coverImageUrl:', coverImageUrl)
    console.log('=== METADATA GENERATION END ===')
    
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
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://starbuckin-winter.vercel.app'}/og-default.jpg`,
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://starbuckin-winter.vercel.app'}/og-default.jpg`],
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