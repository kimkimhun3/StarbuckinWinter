'use client'

import { useEffect, useState, use } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import GalleryEntryForm, {
  GalleryEntryFormValues,
} from '@/components/admin/GalleryEntryForm'

export default function EditMomentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { token } = useAuth()
  const router = useRouter()
  const [initialValues, setInitialValues] =
    useState<GalleryEntryFormValues | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      apiClient.setToken(token)
      loadMoment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id])

  const loadMoment = async () => {
    try {
      const { moment } = await apiClient.getMoment(id)
      setInitialValues({
        title: moment.title || '',
        description: moment.description || '',
        coverImage: moment.coverImage || '',
        memo: moment.memo || '',
        images: moment.images || [],
        published: moment.published,
      })
    } catch (err) {
      setError('Failed to load moment')
      console.error('Load error:', err)
    }
  }

  const handleSubmit = async (values: GalleryEntryFormValues) => {
    await apiClient.updateMoment(id, values)
    router.push('/admin/moments')
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
    <GalleryEntryForm
      heading="Edit Moment"
      subheading="Update this moment, its gallery images and message"
      cancelHref="/admin/moments"
      submitLabel="Save changes"
      titleLabel="Title / Caption"
      titlePlaceholder="e.g., Vol.06"
      memoLabel="Message (optional)"
      memoPlaceholder="A note about this moment. Leave empty if none."
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  )
}
