'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MarkdownEditor from '@/components/MarkdownEditor'
import TagInput from '@/components/TagInput'

export default function NewPostPage() {
  const { token } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    published: false,
    authorName: '',
    tags: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (token) {
        apiClient.setToken(token)
      }

      await apiClient.createPost({
        ...formData,
        published: publish,
      })

      router.push('/admin/posts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Post</h1>
          <p className="mt-2 text-sm text-gray-700">
            Write a new blog post in Markdown format
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/posts"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <form className="mt-8 space-y-6">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Excerpt */}
            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-gray-700"
              >
                Excerpt
              </label>
              <input
                type="text"
                id="excerpt"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="A short summary of your post"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label
                htmlFor="coverImage"
                className="block text-sm font-medium text-gray-700"
              >
                Cover Image URL
              </label>
              <input
                type="url"
                id="coverImage"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="https://example.com/image.jpg"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData({ ...formData, coverImage: e.target.value })
                }
              />
            </div>

            {/* Author Name */}
            <div>
              <label
                htmlFor="authorName"
                className="block text-sm font-medium text-gray-700"
              >
                Author Name
              </label>
              <input
                type="text"
                id="authorName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Author name (e.g., Kimhoon)"
                value={formData.authorName}
                onChange={(e) =>
                  setFormData({ ...formData, authorName: e.target.value })
                }
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (max 7)
              </label>
              <TagInput
                tags={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                maxTags={7}
                placeholder="Type a tag and press space..."
              />
            </div>

            {/* Content - Markdown Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content * (Markdown)
              </label>
<MarkdownEditor
  value={formData.content}
  onChange={(content) => setFormData({ ...formData, content })}
  placeholder={`# Welcome to Tokyo!

Start writing your amazing travel story here...

## Tips:
- Use **bold** and *italic* for emphasis
- Add images with ![alt](url)
- Create code blocks with triple backticks`}
/>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6 space-x-3">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:bg-gray-100"
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}