'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import PublicNav from '@/components/PublicNav'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TableOfContents from '@/components/TableOfContents'
import Link from 'next/link'
import ShareButton from '@/components/Hero/ShareButton'

// Translation function using Next.js API route with Google Translate
async function translateToJapanese(text: string, mode: 'title' | 'content' = 'title'): Promise<string> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, mode })
    })
    
    if (!response.ok) {
      throw new Error('Translation request failed')
    }
    
    const data = await response.json()
    return data.translation || text
  } catch (error) {
    console.error('Translation failed:', error)
    return text // Fallback to original text
  }
}

// Helper function to generate slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Helper function to extract headings from markdown
function extractHeadings(markdown: string): string[] {
  const headings: string[] = []
  const lines = markdown.split('\n')
  
  lines.forEach(line => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      headings.push(match[2])
    }
  })
  
  return headings
}

// BilingualTitle Component with dynamic divider height - Always side-by-side
function BilingualTitle({ 
  japaneseTitle, 
  englishTitle, 
  isTranslating 
}: { 
  japaneseTitle: string
  englishTitle: string
  isTranslating: boolean
}) {
  const japaneseRef = useRef<HTMLDivElement>(null)
  const englishRef = useRef<HTMLDivElement>(null)
  const [dividerHeight, setDividerHeight] = useState(0)

  useEffect(() => {
    const updateDividerHeight = () => {
      const japaneseHeight = japaneseRef.current?.offsetHeight || 0
      const englishHeight = englishRef.current?.offsetHeight || 0
      const maxHeight = Math.max(japaneseHeight, englishHeight)
      setDividerHeight(maxHeight)
    }

    updateDividerHeight()
    window.addEventListener('resize', updateDividerHeight)
    
    return () => window.removeEventListener('resize', updateDividerHeight)
  }, [japaneseTitle, englishTitle, isTranslating])

  return (
    <div className="relative max-w-6xl mx-auto px-2 sm:px-4">
      <div className="flex items-start w-full">
        {/* LEFT SIDE - Japanese Title (Vertical) */}
        <div className="flex-1 flex justify-end pr-3 sm:pr-6 md:pr-8 lg:pr-12">
          {isTranslating ? (
            <div className="animate-pulse bg-gray-200 h-48 sm:h-56 md:h-64 w-10 sm:w-12 md:w-16 rounded"></div>
          ) : (
            <div ref={japaneseRef} className="flex gap-1 sm:gap-2 md:gap-3" style={{ direction: 'rtl' }}>
              {(() => {
                const chars = japaneseTitle.split('');
                const charsPerColumn = 8;
                const totalColumns = Math.ceil(chars.length / charsPerColumn);
                const columns = [];
                
                for (let i = 0; i < totalColumns; i++) {
                  const columnChars = chars.slice(i * charsPerColumn, (i + 1) * charsPerColumn);
                  if (columnChars.length > 0) {
                    columns.push(columnChars);
                  }
                }
                
                return columns.map((columnChars, colIndex) => (
                  <div key={colIndex} className="flex flex-col">
                    {columnChars.map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className="inline-block text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-serif text-gray-700"
                        style={{
                          fontFamily: "'Noto Serif JP', 'Yu Mincho', 'YuMincho', serif",
                          writingMode: 'horizontal-tb',
                          textOrientation: 'upright',
                          lineHeight: '1.3',
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* Vertical Divider Line - DYNAMIC HEIGHT */}
        <div 
          className="w-px bg-gray-400 flex-shrink-0 transition-all duration-300"
          style={{ height: dividerHeight > 0 ? `${dividerHeight}px` : 'auto' }}
        ></div>

        {/* RIGHT SIDE - English Title (Horizontal) */}
        <div className="flex-1 flex justify-start pl-3 sm:pl-6 md:pl-8 lg:pl-12 items-center">
          <h1 
            ref={englishRef}
            className="text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-normal text-gray-700 leading-relaxed"
            style={{
              fontFamily: "'Georgia', serif",
            }}
          >
            {englishTitle}
          </h1>
        </div>
      </div>
    </div>
  )
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { user, token } = useAuth()
  const [post, setPost] = useState<any>(null)
  const [relatedPosts, setRelatedPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentSuccess, setCommentSuccess] = useState(false)
  const [japaneseTitle, setJapaneseTitle] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  
  // Language switching state
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ja'>('en')
  const [translatedContent, setTranslatedContent] = useState('')
  const [isTranslatingContent, setIsTranslatingContent] = useState(false)
  const [headingIdMap, setHeadingIdMap] = useState<Map<string, string>>(new Map())
  
  // Love and view count state
  const [loveCount, setLoveCount] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [isLoving, setIsLoving] = useState(false)
  const [hasLoved, setHasLoved] = useState(false)

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ja' | null
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    // Ensure fonts are loaded before rendering
    if (document.fonts) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true)
      })
    } else {
      setFontsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadPost()
  }, [slug])

  // Auto-translate when post loads if user preference is Japanese
  useEffect(() => {
    const autoTranslate = async () => {
      if (post && currentLanguage === 'ja' && !translatedContent) {
        setIsTranslatingContent(true)
        
        // Translate content
        const translated = await translateToJapanese(post.content, 'content')
        setTranslatedContent(translated)
        
        // Create heading ID map
        const englishHeadings = extractHeadings(post.content)
        const japaneseHeadings = extractHeadings(translated)
        
        const map = new Map<string, string>()
        japaneseHeadings.forEach((japHeading, index) => {
          if (englishHeadings[index]) {
            const id = generateSlug(englishHeadings[index])
            map.set(japHeading, id)
          }
        })
        
        setHeadingIdMap(map)
        setIsTranslatingContent(false)
      }
    }

    autoTranslate()
  }, [post, currentLanguage])

  const loadPost = async () => {
    try {
      const { post } = await apiClient.getPostBySlug(slug)
      setPost(post)
      setLoveCount(post.loveCount || 0)
      setViewCount(post.viewCount || 0)
      
      // Reset translated content when loading new post
      setTranslatedContent('')
      setHeadingIdMap(new Map())
      
      // Translate title to Japanese
      setIsTranslating(true)
      const translated = await translateToJapanese(post.title, 'title')
      setJapaneseTitle(translated)
      setIsTranslating(false)
      
      // Increment view count when post loads
      try {
        await apiClient.incrementViewCount(post.id)
        setViewCount((prev) => prev + 1)
      } catch (err) {
        console.error('Failed to increment view count:', err)
      }
      
      // Load related posts after getting the current post
      await loadRelatedPosts(post.id)
    } catch (error) {
      setError('Post not found')
      console.error('Failed to load post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoveClick = async () => {
    if (!post || hasLoved || isLoving) return
    
    setIsLoving(true)
    try {
      await apiClient.incrementLoveCount(post.id)
      setLoveCount((prev) => prev + 1)
      setHasLoved(true)
      
      // Store in localStorage to prevent multiple loves from same browser
      localStorage.setItem(`loved_${post.id}`, 'true')
    } catch (error) {
      console.error('Failed to increment love count:', error)
    } finally {
      setIsLoving(false)
    }
  }

  useEffect(() => {
    // Check if user has already loved this post
    if (post?.id) {
      const loved = localStorage.getItem(`loved_${post.id}`) === 'true'
      setHasLoved(loved)
    }
  }, [post?.id])

  const loadRelatedPosts = async (currentPostId: string) => {
    try {
      const response = await apiClient.getPublicPosts()
      const allPosts = response.posts || []
      
      const otherPosts = allPosts.filter((p: any) => p.id !== currentPostId)
      const shuffled = otherPosts.sort(() => 0.5 - Math.random())
      const randomPosts = shuffled.slice(0, 4)
      
      setRelatedPosts(randomPosts)
    } catch (error) {
      console.error('Failed to load related posts:', error)
    }
  }

  const handleLanguageSwitch = async () => {
    if (currentLanguage === 'en') {
      // Switch to Japanese
      if (!translatedContent) {
        setIsTranslatingContent(true)
        const translated = await translateToJapanese(post.content, 'content')
        setTranslatedContent(translated)
        
        // Create heading ID map
        const englishHeadings = extractHeadings(post.content)
        const japaneseHeadings = extractHeadings(translated)
        
        const map = new Map<string, string>()
        japaneseHeadings.forEach((japHeading, index) => {
          if (englishHeadings[index]) {
            const id = generateSlug(englishHeadings[index])
            map.set(japHeading, id)
          }
        })
        
        setHeadingIdMap(map)
        setIsTranslatingContent(false)
      }
      setCurrentLanguage('ja')
      // Save language preference
      localStorage.setItem('preferredLanguage', 'ja')
    } else {
      // Switch back to English
      setCurrentLanguage('en')
      // Save language preference
      localStorage.setItem('preferredLanguage', 'en')
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !token) {
      alert('Please login to comment')
      return
    }

    if (!commentContent.trim()) {
      return
    }

    setIsSubmittingComment(true)
    setCommentSuccess(false)

    try {
      apiClient.setToken(token)
      await apiClient.createComment(post.id, commentContent)
      setCommentContent('')
      setCommentSuccess(true)
      
      setTimeout(() => {
        loadPost()
        setCommentSuccess(false)
      }, 2000)
    } catch (error) {
      alert('Failed to submit comment')
      console.error('Comment error:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (isLoading || !fontsLoaded) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The post you're looking for doesn't exist.</p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const defaultImage = "https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200"
  
  // Get the content to display based on current language
  const displayContent = currentLanguage === 'ja' ? translatedContent : post.content

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Language Switcher Button - Fixed Bottom Left */}
      <button
        onClick={handleLanguageSwitch}
        disabled={isTranslatingContent}
        className="fixed bottom-6 left-6 z-50 flex items-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transform hover:scale-105"
        aria-label="Switch language"
      >
        {isTranslatingContent ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium text-sm">翻訳中...</span>
          </>
        ) : (
          <>
            <span className="font-medium text-sm">{currentLanguage === 'en' ? '日本語' : 'English'}</span>
          </>
        )}
      </button>

      {/* Japanese-Style Hero Section - Centered Image with Bilingual Titles Below */}
      {post.coverImage && (
        <div className="w-full py-8 sm:py-12 md:py-16 px-2 sm:px-4">
          <div className="max-w-4xl mx-auto">
            {/* Centered Cover Image - No border */}
            <div className="mb-4 sm:mb-6">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto"
                style={{ 
                  maxHeight: '500px',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Image Caption/Source with Date and Location */}
            <div className="text-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 md:mb-8 space-y-1">
              <p className="font-medium">凛</p>
              <p>
                {new Date(post.createdAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} · 中野 · 東京
              </p>
            </div>

            {/* Bilingual Title Section - Always Side by Side */}
            <BilingualTitle 
              japaneseTitle={japaneseTitle} 
              englishTitle={post.title}
              isTranslating={isTranslating}
            />
          </div>
        </div>
      )}

      {/* Post Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        {/* Post Content with Table of Contents */}
        <article className="mb-8">
          <div className="p-6 sm:p-8 md:p-12">
            {/* Post Meta Information - Single Line with Share Button */}
            <div className="pb-4 mb-6 border-b border-gray-200">
              <div className="flex items-center justify-between gap-2">
                {/* Left side - Meta info */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm overflow-hidden">
                  {/* Author - Always visible */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 font-medium text-[10px] sm:text-xs">
                        {(post.authorName || post.author?.name || 'A')[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 truncate max-w-[80px] sm:max-w-none">
                      {post.authorName || post.author?.name || 'Anonymous'}
                    </span>
                  </div>
                  
                  <span className="text-gray-300 hidden sm:inline flex-shrink-0">•</span>
                  
                  {/* Date */}
                  <div className="flex items-center gap-1 text-gray-600 flex-shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <time className="hidden sm:inline">
                      {new Date(post.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </time>
                    <time className="sm:hidden text-[11px]">
                      {new Date(post.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </time>
                  </div>
                  
                  <span className="text-gray-300 hidden sm:inline flex-shrink-0">•</span>
                  
                  {/* View Count */}
                  <div className="flex items-center gap-1 text-gray-600 flex-shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-[11px] sm:text-xs">{viewCount}</span>
                  </div>
                  
                  <span className="text-gray-300 hidden sm:inline flex-shrink-0">•</span>
                  
                  {/* Comments Count */}
                  <div className="flex items-center gap-1 text-gray-600 flex-shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span className="text-[11px] sm:text-xs">{post.comments.length}</span>
                  </div>
                  
                  <span className="text-gray-300 hidden sm:inline flex-shrink-0">•</span>
                  
                  {/* Love Button */}
                  <button
                    onClick={handleLoveClick}
                    disabled={hasLoved || isLoving}
                    title={hasLoved ? 'You loved this post' : 'Love this post'}
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-200 flex-shrink-0
                      ${hasLoved 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                      }
                      ${isLoving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <svg 
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${hasLoved ? 'fill-red-600' : 'fill-none'} transition-all`}
                      fill={hasLoved ? 'currentColor' : 'none'}
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                    <span className="font-medium text-[11px] sm:text-xs">{loveCount}</span>
                  </button>
                </div>

                {/* Right side - Share Button */}
                <ShareButton 
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  title={post.title}
                  imageUrl={post.coverImage}
                />
              </div>
            </div>

            {/* Post Body with Table of Contents */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Table of Contents - Sidebar on large desktop */}
              <aside className="xl:col-span-3 hidden xl:block">
                <TableOfContents 
                  key={currentLanguage} 
                  content={displayContent}
                  headingIdMap={currentLanguage === 'ja' ? headingIdMap : undefined}
                />
              </aside>

              {/* Main Content */}
              <div className="xl:col-span-8">
                {/* Table of Contents - Mobile/Tablet (above content) */}
                <div className="xl:hidden mb-6">
                  <TableOfContents 
                    key={currentLanguage} 
                    content={displayContent}
                    headingIdMap={currentLanguage === 'ja' ? headingIdMap : undefined}
                  />
                </div>

                {/* Loading state while translating */}
                {isTranslatingContent ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-600">翻訳中...</p>
                    </div>
                  </div>
                ) : (
                  /* Post Body - Responsive Typography */
                  <div className="prose-content">
                    <MarkdownRenderer 
                      key={currentLanguage} 
                      content={displayContent}
                      headingIdMap={currentLanguage === 'ja' ? headingIdMap : undefined}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="max-w-3xl mx-auto sm:p-8 mb-8">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string, index: number) => (
                <Link
                  key={index}
                  href={`/all?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 transition-colors text-sm font-medium"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="max-w-3xl mx-auto sm:p-8 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-7 h-7 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Comments ({post.comments.length})
          </h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    required
                  />
                  {commentSuccess && (
                    <p className="text-green-600 text-sm mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {user.role === 'ADMIN' 
                        ? 'Comment posted!' 
                        : 'Comment submitted for approval!'}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !commentContent.trim()}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isSubmittingComment ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Posting...
                        </span>
                      ) : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-6 border border-indigo-200 rounded-lg text-center">
              <p className="text-gray-700 mb-3 text-sm sm:text-base">
                コメントするには、ログインまたは新規登録してください
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link 
                  href={`/login?redirect=${encodeURIComponent(`/blog/${post.slug}`)}`}
                  className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors text-center"
                >
                  ログイン
                </Link>
                <span className="hidden sm:inline text-gray-400">または</span>
                <Link 
                  href={`/register?redirect=${encodeURIComponent(`/blog/${post.slug}`)}`}
                  className="w-full sm:w-auto px-6 py-2 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors text-center"
                >
                  新規登録
                </Link>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {post.comments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p className="mt-4 text-gray-500 font-medium">No comments yet</p>
                <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
              </div>
            ) : (
              post.comments.map((comment: any) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {comment.author.name?.[0]?.toUpperCase() || 'A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-semibold text-gray-900">
                          {comment.author.name || 'Anonymous'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <time className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                      <p className="mt-2 text-gray-700 leading-relaxed break-words">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* More Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <div className="border-t border-gray-200 pt-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
                More Posts
              </h2>
              
              {/* Responsive Grid: 2 cols on mobile, 2 cols on tablets, 4 cols on desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id} 
                    href={`/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <article className="h-full flex flex-col">
                      {/* Image - Smaller on mobile */}
                      <div className="aspect-[4/3] overflow-hidden rounded-md sm:rounded-lg mb-2 sm:mb-4">
                        <img
                          src={relatedPost.coverImage || defaultImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      
                      {/* Content - Adjusted text sizes for mobile */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                          {relatedPost.title}
                        </h3>
                        
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3 flex-1">
                          {relatedPost.excerpt || relatedPost.description || ''}
                        </p>
                        
                        <div className="flex items-center text-[10px] sm:text-xs text-gray-500">
                          <time className="truncate">
                            {new Date(relatedPost.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </time>
                          {relatedPost.comments && relatedPost.comments.length > 0 && (
                            <>
                              <span className="mx-1 sm:mx-2">•</span>
                              <span className="truncate">{relatedPost.comments.length} comments</span>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Back to Blog Link */}
        <div className="mb-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all posts
          </Link>
        </div>
      </div>
    </div>
  )
}