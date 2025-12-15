'use client'

import { useEffect, useState, use } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import PublicNav from '@/components/PublicNav'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import Link from 'next/link'

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { user, token } = useAuth()
  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentSuccess, setCommentSuccess] = useState(false)

  useEffect(() => {
    loadPost()
  }, [slug])

  const loadPost = async () => {
    try {
      const { post } = await apiClient.getPostBySlug(slug)
      setPost(post)
    } catch (error) {
      setError('Post not found')
      console.error('Failed to load post:', error)
    } finally {
      setIsLoading(false)
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
      
      // Reload post to show new comment (if admin) or show success message
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
      <div className="min-h-screen bg-gray-50">
        <PublicNav />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNav />
        <div className="max-w-4xl mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The post you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />

      {/* Cover Image */}
      {post.coverImage && (
        <div className="w-full h-96 bg-gray-900">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover opacity-90"
          />
        </div>
      )}

      {/* Post Content */}
      <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Post Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{post.author.name || 'Anonymous'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>{post.comments.length} comments</span>
              </div>
            </div>
          </header>

          {/* Post Body */}
          <div className="prose-content">
            <MarkdownRenderer content={post.content} />
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({post.comments.length})
          </h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              {commentSuccess && (
                <p className="text-green-600 text-sm mt-2">
                  {user.role === 'ADMIN' 
                    ? 'Comment posted!' 
                    : 'Comment submitted for approval!'}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isSubmittingComment ? 'Submitting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-md text-center">
              <p className="text-gray-600">
                Please{' '}
                <Link href="/admin/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  login
                </Link>
                {' '}to leave a comment.
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {post.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              post.comments.map((comment: any) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {comment.author.name?.[0]?.toUpperCase() || 'A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {comment.author.name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all posts
          </Link>
        </div>
      </article>
    </div>
  )
}