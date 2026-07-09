'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface RandomMessageFormValues {
  title: string
  description: string
  coverImage: string
  memo: string
  images: string[]
  published: boolean
}

interface RandomMessageFormProps {
  heading: string
  subheading: string
  initialValues: RandomMessageFormValues
  submitLabel: string
  onSubmit: (values: RandomMessageFormValues) => Promise<void>
}

const inputClass =
  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border'

export default function RandomMessageForm({
  heading,
  subheading,
  initialValues,
  submitLabel,
  onSubmit,
}: RandomMessageFormProps) {
  const [values, setValues] = useState<RandomMessageFormValues>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (patch: Partial<RandomMessageFormValues>) =>
    setValues((prev) => ({ ...prev, ...patch }))

  const updateImage = (index: number, url: string) => {
    const next = [...values.images]
    next[index] = url
    update({ images: next })
  }

  const addImage = () => update({ images: [...values.images, ''] })

  const removeImage = (index: number) =>
    update({ images: values.images.filter((_, i) => i !== index) })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!values.title.trim() || !values.coverImage.trim()) {
      setError('Title and cover image URL are required')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...values,
        images: values.images.filter((url) => url.trim().length > 0),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
          <p className="mt-2 text-sm text-gray-700">{subheading}</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/messages"
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

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Title / place name */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Place / Title *
              </label>
              <input
                type="text"
                id="title"
                required
                className={inputClass}
                placeholder="e.g., Mt. Takao summit"
                value={values.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Short Description
              </label>
              <input
                type="text"
                id="description"
                className={inputClass}
                placeholder="A short line shown on the card"
                value={values.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </div>

            {/* Cover image URL */}
            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                Cover Image URL *
              </label>
              <input
                type="url"
                id="coverImage"
                required
                className={inputClass}
                placeholder="https://example.com/photo.jpg"
                value={values.coverImage}
                onChange={(e) => update({ coverImage: e.target.value })}
              />
              {values.coverImage.trim() && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={values.coverImage}
                  alt="Cover preview"
                  className="mt-3 h-32 w-auto rounded-md object-cover border border-gray-200"
                />
              )}
            </div>

            {/* Memo (the handwritten message — optional) */}
            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-gray-700">
                Memo (the message — optional)
              </label>
              <textarea
                id="memo"
                rows={4}
                className={inputClass}
                placeholder="What the hiker wrote in the notebook. Leave empty if none yet."
                value={values.memo}
                onChange={(e) => update({ memo: e.target.value })}
              />
            </div>

            {/* Gallery image URLs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Image URLs
              </label>
              <div className="space-y-3">
                {values.images.length === 0 && (
                  <p className="text-sm text-gray-400">
                    No gallery images yet. Add photos that appear when the card is opened.
                  </p>
                )}
                {values.images.map((url, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="url"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                      placeholder="https://example.com/photo.jpg"
                      value={url}
                      onChange={(e) => updateImage(index, e.target.value)}
                    />
                    {url.trim() && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="h-12 w-12 flex-shrink-0 rounded object-cover border border-gray-200"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="flex-shrink-0 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addImage}
                className="mt-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                + Add image URL
              </button>
            </div>

            {/* Published toggle */}
            <div className="flex items-center">
              <input
                id="published"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={values.published}
                onChange={(e) => update({ published: e.target.checked })}
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                Visible on the landing page
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
