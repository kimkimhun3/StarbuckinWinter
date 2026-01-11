'use client'

import { useState, KeyboardEvent, useRef, useEffect } from 'react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  placeholder?: string
}

export default function TagInput({ 
  tags, 
  onChange, 
  maxTags = 7,
  placeholder = 'Type a tag and press space...'
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags.length - 1)
    }
  }

  const addTag = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && tags.length < maxTags) {
      // Don't add duplicate tags
      if (!tags.includes(trimmedValue)) {
        onChange([...tags, trimmedValue])
      }
      setInputValue('')
    }
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const handleBlur = () => {
    // Add tag when input loses focus if there's text
    if (inputValue.trim()) {
      addTag()
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 min-h-[42px]">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] border-none outline-none text-sm"
            maxLength={30}
          />
        )}
      </div>
      {tags.length >= maxTags && (
        <p className="mt-1 text-xs text-gray-500">Maximum {maxTags} tags reached</p>
      )}
      {tags.length < maxTags && (
        <p className="mt-1 text-xs text-gray-500">
          {tags.length} / {maxTags} tags. Press space to add a tag.
        </p>
      )}
    </div>
  )
}

