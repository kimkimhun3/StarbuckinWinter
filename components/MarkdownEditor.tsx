'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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

  const handleChange = useCallback(
    (value: string) => {
      onChange(value)
    },
    [onChange]
  )

  const options = useMemo(
    () => ({
      spellChecker: false,
      placeholder,
      status: ['lines', 'words', 'cursor'],
      autofocus: false,
      minHeight: "400px",
      maxHeight: "600px",
      toolbar: [
        'bold',
        'italic',
        'strikethrough',
        '|',
        'heading-1',
        'heading-2',
        'heading-3',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'code',
        'table',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
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
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            ✏️ Write
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`${
              showPreview
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            👁️ Preview
          </button>
        </nav>
      </div>

      {/* Editor / Preview */}
      {!showPreview ? (
        <div className="markdown-editor">
          <SimpleMDE value={value} onChange={handleChange} options={options} />
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-8 bg-white min-h-[400px] max-h-[600px] overflow-y-auto">
          <article className="prose prose-slate lg:prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
            prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-6
            prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-5
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-indigo-800
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
            prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700
            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
            prose-li:mb-2 prose-li:text-gray-700
            prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
            prose-hr:border-gray-300 prose-hr:my-8
            prose-table:border-collapse prose-table:w-full
            prose-th:bg-gray-100 prose-th:border prose-th:border-gray-300 prose-th:p-3 prose-th:text-left prose-th:font-semibold
            prose-td:border prose-td:border-gray-300 prose-td:p-3">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                img: ({ node, ...props }) => {
                  const hasCustomSize = props.width || props.height;
                  
                  return (
                    <img
                      {...props}
                      className={`rounded-lg shadow-md object-cover ${
                        hasCustomSize ? 'mx-auto' : 'max-w-full'
                      } h-auto`}
                      loading="lazy"
                      style={{
                        maxWidth: '100%',
                        width: props.width ? `${props.width}` : undefined,
                        height: props.height ? `${props.height}` : undefined,
                      }}
                    />
                  );
                },
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                    target={props.href?.startsWith('http') ? '_blank' : undefined}
                    rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  />
                ),
              }}
            >
              {value}
            </ReactMarkdown>
          </article>
        </div>
      )}

      {/* Enhanced Markdown Guide */}
      <details className="text-sm text-gray-600 bg-gray-50 rounded-lg">
        <summary className="cursor-pointer font-medium hover:text-gray-900 p-4 rounded-lg hover:bg-gray-100 transition-colors">
          📖 Markdown Guide & Tips
        </summary>
        <div className="px-4 pb-4 space-y-4">
          {/* Headings */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Headings</h4>
            <div className="space-y-1 text-xs bg-white p-3 rounded-md border border-gray-200">
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded"># Heading 1</code> - Main title</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">## Heading 2</code> - Section title</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">### Heading 3</code> - Subsection title</p>
            </div>
          </div>

          {/* Text Formatting */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Text Formatting</h4>
            <div className="space-y-1 text-xs bg-white p-3 rounded-md border border-gray-200">
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">**bold text**</code> - Bold</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">*italic text*</code> - Italic</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">~~strikethrough~~</code> - Strikethrough</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">`code`</code> - Inline code</p>
            </div>
          </div>

          {/* Links & Images */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Links & Images</h4>
            <div className="space-y-1 text-xs bg-white p-3 rounded-md border border-gray-200">
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">[Link text](https://example.com)</code> - Hyperlink</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">![Alt text](image-url)</code> - Full width image</p>
              <p className="text-indigo-600 font-medium mt-2">Custom Image Sizes:</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">&lt;img src="url" width="400" /&gt;</code> - Fixed width (400px)</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">&lt;img src="url" width="50%" /&gt;</code> - Percentage width</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">&lt;img src="url" width="600" height="400" /&gt;</code> - Fixed dimensions</p>
            </div>
          </div>

          {/* Lists */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Lists</h4>
            <div className="space-y-1 text-xs bg-white p-3 rounded-md border border-gray-200">
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">- Item</code> or <code className="bg-gray-200 px-1.5 py-0.5 rounded">* Item</code> - Bullet list</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">1. Item</code> - Numbered list</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">- [ ] Task</code> - Task list (unchecked)</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">- [x] Task</code> - Task list (checked)</p>
            </div>
          </div>

          {/* Code Blocks */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Code Blocks</h4>
            <div className="space-y-1 text-xs bg-white p-3 rounded-md border border-gray-200">
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">```javascript</code> - Code block with syntax highlighting</p>
              <p className="text-gray-600 ml-4">Supported: javascript, python, java, css, html, bash, etc.</p>
            </div>
          </div>

          {/* Quotes & Tables */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Quotes & Tables</h4>
            <div className="space-y-1 text-xs bg-white p-3 rounded-md border border-gray-200">
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">&gt; Quote text</code> - Blockquote</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">| Header | Header |</code> - Table header</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">| --- | --- |</code> - Table separator</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">| Cell | Cell |</code> - Table row</p>
            </div>
          </div>

          {/* Other Elements */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Other Elements</h4>
            <div className="space-y-1 text-xs bg-white p-3 rounded-md border border-gray-200">
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">---</code> - Horizontal rule</p>
              <p><code className="bg-gray-200 px-1.5 py-0.5 rounded">&lt;br&gt;</code> - Line break</p>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-indigo-50 p-3 rounded-md border border-indigo-200">
            <h4 className="font-semibold text-indigo-800 mb-2">💡 Pro Tips</h4>
            <ul className="space-y-1 text-xs text-indigo-700 list-disc list-inside">
              <li>Leave blank lines between paragraphs for better spacing</li>
              <li>Use heading hierarchy (H1 → H2 → H3) for structure</li>
              <li>Add alt text to images for accessibility</li>
              <li>External links automatically open in new tabs</li>
              <li>Use HTML img tags for custom image sizes (width/height)</li>
              <li>Preview your post before publishing!</li>
            </ul>
          </div>
        </div>
      </details>
    </div>
  )
}