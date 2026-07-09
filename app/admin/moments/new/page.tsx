'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import GalleryEntryForm, {
  GalleryEntryFormValues,
} from '@/components/admin/GalleryEntryForm'

export default function NewMomentPage() {
  const { token } = useAuth()
  const router = useRouter()

  const handleSubmit = async (values: GalleryEntryFormValues) => {
    if (token) {
      apiClient.setToken(token)
    }
    await apiClient.createMoment(values)
    router.push('/admin/moments')
  }

  return (
    <GalleryEntryForm
      heading="New Moment"
      subheading="Add a photo with a title, gallery images and an optional message"
      cancelHref="/admin/moments"
      submitLabel="Create"
      titleLabel="Title / Caption"
      titlePlaceholder="e.g., Vol.06"
      memoLabel="Message (optional)"
      memoPlaceholder="A note about this moment. Leave empty if none."
      initialValues={{
        title: '',
        description: '',
        coverImage: '',
        memo: '',
        images: [],
        published: true,
      }}
      onSubmit={handleSubmit}
    />
  )
}
