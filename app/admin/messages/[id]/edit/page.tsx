'use client'

import { useEffect, useState, use } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import RandomMessageForm, {
  RandomMessageFormValues,
} from '@/components/admin/RandomMessageForm'

export default function EditRandomMessagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { token } = useAuth()
  const router = useRouter()
  const [initialValues, setInitialValues] =
    useState<RandomMessageFormValues | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      apiClient.setToken(token)
      loadMessage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id])

  const loadMessage = async () => {
    try {
      const { message } = await apiClient.getRandomMessage(id)
      setInitialValues({
        title: message.title || '',
        description: message.description || '',
        coverImage: message.coverImage || '',
        memo: message.memo || '',
        images: message.images || [],
        published: message.published,
      })
    } catch (err) {
      setError('Failed to load message')
      console.error('Load error:', err)
    }
  }

  const handleSubmit = async (values: RandomMessageFormValues) => {
    await apiClient.updateRandomMessage(id, values)
    router.push('/admin/messages')
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      </div>
    )
  }

  if (!initialValues) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <RandomMessageForm
      heading="Edit Message"
      subheading="Update this place, its gallery images and memo"
      submitLabel="Save changes"
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  )
}
