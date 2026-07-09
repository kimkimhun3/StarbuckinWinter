'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import RandomMessageForm, {
  RandomMessageFormValues,
} from '@/components/admin/RandomMessageForm'

export default function NewRandomMessagePage() {
  const { token } = useAuth()
  const router = useRouter()

  const handleSubmit = async (values: RandomMessageFormValues) => {
    if (token) {
      apiClient.setToken(token)
    }
    await apiClient.createRandomMessage(values)
    router.push('/admin/messages')
  }

  return (
    <RandomMessageForm
      heading="New Message"
      subheading="Add a place with a photo, a short description, gallery images and an optional memo"
      submitLabel="Create"
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
