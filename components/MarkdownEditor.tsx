'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'easymde/dist/easymde.min.css'
import 'highlight.js/styles/github-dark.css'

// Import SimpleMDE dynamically to avoid SSR issues
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
})

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your post in Markdown...',
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Memoize onChange to prevent re-renders
  const handleChange = useCallback(
    (value: string) => {
      onChange(value)
    },
    [onChange]
  )

  // Memoize options to prevent SimpleMDE from re-initializing
const options = useMemo(
  () => ({
    spellChecker: false,
    placeholder,
    status: false,
    autofocus: false,
    maxHeight: "600px", // Add explicit max height
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      '|',
      'code',
      '|',
      'guide',
    ],
  }),
  [placeholder]
)

  if (!mounted) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[400px]">
        <p className="text-gray-500">Loading editor...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`${
              !showPreview
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`${
              showPreview
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Preview
          </button>
        </nav>
      </div>

      {/* Editor / Preview */}
      {!showPreview ? (
        <div className="markdown-editor">
          <SimpleMDE value={value} onChange={handleChange} options={options} />
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-6 bg-white min-h-[400px]">
          <article className="prose prose-sm sm:prose lg:prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {value}
            </ReactMarkdown>
          </article>
        </div>
      )}

      {/* Markdown Cheatsheet */}
      <details className="text-sm text-gray-600">
        <summary className="cursor-pointer font-medium hover:text-gray-900">
          📝 Markdown Cheatsheet
        </summary>
        <div className="mt-2 space-y-1 pl-4 text-xs bg-gray-50 p-3 rounded-md">
          <p><code className="bg-gray-200 px-1 rounded"># Heading 1</code> - Large heading</p>
          <p><code className="bg-gray-200 px-1 rounded">## Heading 2</code> - Medium heading</p>
          <p><code className="bg-gray-200 px-1 rounded">### Heading 3</code> - Small heading</p>
          <p><code className="bg-gray-200 px-1 rounded">**bold text**</code> - Bold text</p>
          <p><code className="bg-gray-200 px-1 rounded">*italic text*</code> - Italic text</p>
          <p><code className="bg-gray-200 px-1 rounded">[Link text](url)</code> - Hyperlink</p>
          <p><code className="bg-gray-200 px-1 rounded">![Alt text](image-url)</code> - Image</p>
          <p><code className="bg-gray-200 px-1 rounded">`code`</code> - Inline code</p>
          <p><code className="bg-gray-200 px-1 rounded">```language</code> - Code block (js, python, etc.)</p>
          <p><code className="bg-gray-200 px-1 rounded">- Item</code> - Bullet list</p>
          <p><code className="bg-gray-200 px-1 rounded">1. Item</code> - Numbered list</p>
          <p><code className="bg-gray-200 px-1 rounded">&gt; Quote</code> - Blockquote</p>
          <p><code className="bg-gray-200 px-1 rounded">---</code> - Horizontal rule</p>
        </div>
      </details>
    </div>
  )
}