'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import PublicNav from '@/components/PublicNav'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import Link from 'next/link'

// Simple translation function (you can replace this with a real API like Google Translate or DeepL)
async function translateToJapanese(text: string): Promise<string> {
  try {
    // Using a free translation API - you can replace with Google Translate API, DeepL, etc.
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ja`
    )
    const data = await response.json()
    return data.responseData.translatedText || text
  } catch (error) {
    console.error('Translation failed:', error)
    return text // Fallback to original text
  }
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
                // Adjust columns based on screen size and text length
                const totalColumns = chars.length > 30 ? 4 : 3;
                const charsPerColumn = Math.ceil(chars.length / totalColumns);
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
                        className="inline-block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-serif text-gray-700"
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
            className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-normal text-gray-700 leading-relaxed"
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

  useEffect(() => {
    loadPost()
  }, [slug])

  const loadPost = async () => {
    try {
      const { post } = await apiClient.getPostBySlug(slug)
      setPost(post)
      
      // Translate title to Japanese
      setIsTranslating(true)
      const translated = await translateToJapanese(post.title)
      setJapaneseTitle(translated)
      setIsTranslating(false)
      
      // Load related posts after getting the current post
      await loadRelatedPosts(post.id)
    } catch (error) {
      setError('Post not found')
      console.error('Failed to load post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRelatedPosts = async (currentPostId: string) => {
    try {
      // Fetch all public posts
      const response = await apiClient.getPublicPosts()
      const allPosts = response.posts || []
      
      // Filter out current post
      const otherPosts = allPosts.filter((p: any) => p.id !== currentPostId)
      
      // Shuffle and take 3 random posts
      const shuffled = otherPosts.sort(() => 0.5 - Math.random())
      const randomPosts = shuffled.slice(0, 3)
      
      setRelatedPosts(randomPosts)
    } catch (error) {
      console.error('Failed to load related posts:', error)
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

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Japanese-Style Hero Section - Centered Image with Bilingual Titles Below */}
      {post.coverImage && (
        <div className="w-full bg-gradient-to-b from-gray-100 to-white py-8 sm:py-12 md:py-16 px-2 sm:px-4">
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

            {/* Image Caption/Source */}
            <p className="text-center text-xs sm:text-sm text-gray-500 mb-8 sm:mb-10 md:mb-12">
              Kimhoon Rin
            </p>

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Post Content Card */}
        <article className=" mb-8">
          <div className="p-6 sm:p-8 md:p-12">
            {/* Post Meta Information */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 pb-6 mb-8">
              {/* Author */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-medium text-sm">
                    {post.author.name?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="font-medium text-gray-900">{post.author.name || 'Anonymous'}</span>
              </div>
              
              <span className="text-gray-400">•</span>
              
              {/* Date */}
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time className="text-gray-600">
                  {new Date(post.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
              </div>
              
              <span className="text-gray-400">•</span>
              
              {/* Comments Count */}
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="text-gray-600">
                  {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                </span>
              </div>
            </div>

            {/* Post Body - Responsive Typography */}
            <div className="prose-content">
              <MarkdownRenderer content={post.content} />
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="sm:p-8 mb-8">
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
            <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 text-center">
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id} 
                    href={`/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <article className="h-full flex flex-col">
                      {/* Image */}
                      <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4">
                        <img
                          src={relatedPost.coverImage || defaultImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {relatedPost.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-1">
                          {relatedPost.excerpt || relatedPost.description || ''}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <time>
                            {new Date(relatedPost.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </time>
                          {relatedPost.comments && relatedPost.comments.length > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{relatedPost.comments.length} comments</span>
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