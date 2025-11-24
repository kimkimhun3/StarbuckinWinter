'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'

export default function AdminCommentsPage() {
  const { token } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [allComments, setAllComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  useEffect(() => {
    if (token) {
      apiClient.setToken(token)
      loadData()
    }
  }, [token])

  const loadData = async () => {
    try {
      const { posts: allPosts } = await apiClient.getPosts(true)
      setPosts(allPosts)

      // Load comments for all posts
      const commentsPromises = allPosts.map((post: any) =>
        apiClient.getComments(post.id)
      )
      const commentsResults = await Promise.all(commentsPromises)
      
      const comments = commentsResults.flatMap((result, index) =>
        result.comments.map((comment: any) => ({
          ...comment,
          post: allPosts[index],
        }))
      )

      setAllComments(comments)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (commentId: string) => {
    try {
      await apiClient.approveComment(commentId)
      setAllComments(
        allComments.map((c) =>
          c.id === commentId ? { ...c, approved: true } : c
        )
      )
    } catch (error) {
      alert('Failed to approve comment')
      console.error('Approve error:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      await apiClient.deleteComment(commentId)
      setAllComments(allComments.filter((c) => c.id !== commentId))
    } catch (error) {
      alert('Failed to delete comment')
      console.error('Delete error:', error)
    }
  }

  const filteredComments = allComments.filter((comment) => {
    if (filter === 'pending') return !comment.approved
    if (filter === 'approved') return comment.approved
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Comments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Moderate and manage all comments on your blog
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4">
        <div className="sm:hidden">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setFilter('all')}
              className={`${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              All ({allComments.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`${
                filter === 'pending'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Pending ({allComments.filter((c) => !c.approved).length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`${
                filter === 'approved'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Approved ({allComments.filter((c) => c.approved).length})
            </button>
          </nav>
        </div>
      </div>

      {/* Comments List */}
      <div className="mt-8">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No comments found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white shadow rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.author.name || comment.author.email}
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          comment.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {comment.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      On: <span className="font-medium">{comment.post.title}</span>
                    </p>
                    <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {!comment.approved && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}