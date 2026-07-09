'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

interface RandomMessage {
  id: string
  title: string
  description?: string | null
  coverImage: string
  memo?: string | null
  images: string[]
  published: boolean
  createdAt: string
}

export default function AdminMessagesPage() {
  const { token } = useAuth()
  const [messages, setMessages] = useState<RandomMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token) {
      apiClient.setToken(token)
      loadMessages()
    }
  }, [token])

  const loadMessages = async () => {
    try {
      const { messages: all } = await apiClient.getRandomMessages(true)
      setMessages(all)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }
    try {
      await apiClient.deleteRandomMessage(id)
      setMessages(messages.filter((m) => m.id !== id))
    } catch (error) {
      alert('Failed to delete message')
      console.error('Delete error:', error)
    }
  }

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
          <h1 className="text-2xl font-semibold text-gray-900">A Random Message</h1>
          <p className="mt-2 text-sm text-gray-700">
            Notes and photos collected from hikers along the way
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/messages/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Add New
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Place
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Photos
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Memo
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                        No entries yet.{' '}
                        <Link
                          href="/admin/messages/new"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          Add your first one
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    messages.map((message) => (
                      <tr key={message.id}>
                        <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center gap-3">
                            {message.coverImage && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={message.coverImage}
                                alt={message.title}
                                className="h-10 w-10 flex-shrink-0 rounded object-cover border border-gray-200"
                              />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {message.title}
                              </div>
                              {message.description && (
                                <div className="text-gray-500 truncate max-w-xs">
                                  {message.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              message.published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {message.published ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {(message.images?.length || 0) + 1}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {message.memo ? (
                            <span className="truncate block max-w-xs">{message.memo}</span>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            href={`/admin/messages/${message.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(message.id, message.title)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
