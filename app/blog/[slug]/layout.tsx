import type { Metadata } from 'next'
import { apiClient } from '@/lib/api-client'

// Generate metadata for SEO and social sharing
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const { post } = await apiClient.getPostBySlug(slug)
    
    // Create caption from post data
    const caption = `${new Date(post.createdAt).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} · 中野 · 東京`
    
    // Get the site URL from environment variable or use a default
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
    const postUrl = `${siteUrl}/blog/${slug}`
    
    // Prepare the description
    const description = post.excerpt || post.description || caption
    
    return {
      title: post.title,
      description: description,
      
      // Open Graph metadata for Facebook, LinkedIn, etc.
      openGraph: {
        title: post.title,
        description: caption, // Using caption for social preview
        images: [
          {
            url: post.coverImage || `${siteUrl}/default-og-image.jpg`,
            width: 1200,
            height: 630,
            alt: post.title,
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
      
      // Twitter Card metadata
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: caption,
        images: [post.coverImage || `${siteUrl}/default-og-image.jpg`],
        creator: '@your_twitter_handle', // Optional: Add your Twitter handle
      },
      
      // Additional metadata
      alternates: {
        canonical: postUrl,
      },
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error)
    return {
      title: 'Post Not Found',
      description: 'The blog post you are looking for could not be found.',
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
