'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'

export default function CollectionsPage() {
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const { posts } = await apiClient.getPublicPosts()
      
      // Count posts per tag
      const tagMap = new Map<string, number>()
      posts.forEach((post: any) => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach((tag: string) => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
          })
        }
      })
      
      // Convert to array and sort by count
      const tagArray = Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
      
      setTags(tagArray)
    } catch (error) {
      console.error('Failed to load tags:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Collections
          </h1>
          <p className="text-lg text-gray-600">
            コレクション
          </p>
        </div>

        {/* Tags Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : tags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/all?tag=${encodeURIComponent(tag)}`}
                className="group block"
              >
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-indigo-300">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      #{tag}
                    </h3>
                    <span className="bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
                      {count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {count} {count === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-gray-500">まだコレクションがありません</p>
            <p className="text-sm text-gray-400 mt-2">No collections yet</p>
          </div>
        )}

        {/* Back to Home Link */}
        <div className="flex justify-center mt-12">
          <Link 
            href="/"
            className="text-sm sm:text-base text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-2 border-b border-gray-700 hover:border-gray-900 pb-1"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}