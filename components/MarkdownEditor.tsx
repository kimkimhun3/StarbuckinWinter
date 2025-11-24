'use client'

import { useEffect, useRef, useState } from 'react'
import SimpleMDE from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'

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

  const options = {
    spellChecker: false,
    placeholder,
    status: false,
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
      'preview',
      '|',
      'guide',
    ],
    previewRender: (text: string) => {
      setShowPreview(true)
      return text
    },
  }

  if (!mounted) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
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
          <SimpleMDE value={value} onChange={onChange} options={options} />
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
        <summary className="cursor-pointer font-medium">Markdown Cheatsheet</summary>
        <div className="mt-2 space-y-2 pl-4">
          <p><code># Heading 1</code> - Large heading</p>
          <p><code>## Heading 2</code> - Medium heading</p>
          <p><code>### Heading 3</code> - Small heading</p>
          <p><code>**bold text**</code> - Bold text</p>
          <p><code>*italic text*</code> - Italic text</p>
          <p><code>[Link text](url)</code> - Hyperlink</p>
          <p><code>![Alt text](image-url)</code> - Image</p>
          <p><code>`code`</code> - Inline code</p>
          <p><code>```language</code> - Code block (replace language with js, python, etc.)</p>
          <p><code>- Item</code> - Bullet list</p>
          <p><code>1. Item</code> - Numbered list</p>
          <p><code>&gt; Quote</code> - Blockquote</p>
          <p><code>---</code> - Horizontal rule</p>
        </div>
      </details>
    </div>
  )
}