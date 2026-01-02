'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <article className="prose prose-slate lg:prose-lg xl:prose-xl max-w-none
      prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
      prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight
      prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
      prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6
      prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-5
      prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
      prose-a:text-indigo-600 prose-a:no-underline prose-a:font-medium hover:prose-a:underline hover:prose-a:text-indigo-800 prose-a:transition-colors
      prose-strong:text-gray-900 prose-strong:font-semibold
      prose-em:text-gray-800 prose-em:italic
      prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:shadow-lg prose-pre:my-6
      prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:rounded-r-lg prose-blockquote:my-6
      prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:space-y-2
      prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:space-y-2
      prose-li:text-gray-700 prose-li:leading-relaxed
      prose-li:marker:text-indigo-500
      prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:w-full prose-img:h-auto
      prose-hr:border-gray-300 prose-hr:my-10 prose-hr:border-t-2
      prose-table:border-collapse prose-table:w-full prose-table:my-6 prose-table:text-sm
      prose-thead:bg-gray-100
      prose-th:border prose-th:border-gray-300 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900
      prose-td:border prose-td:border-gray-300 prose-td:p-3 prose-td:text-gray-700
      prose-tr:border-b prose-tr:border-gray-200 hover:prose-tr:bg-gray-50
      prose-video:rounded-xl prose-video:shadow-lg prose-video:my-8 prose-video:w-full
      ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Images - responsive and with lazy loading
          img: ({ node, ...props }) => {
            // Check if width or height is specified
            const hasCustomSize = props.width || props.height;
            
            return (
              <img
                {...props}
                className={`rounded-xl shadow-lg object-cover my-8 ${
                  hasCustomSize ? 'mx-auto' : 'w-full'
                } h-auto`}
                loading="lazy"
                alt={props.alt || 'Blog image'}
                style={{
                  maxWidth: '100%',
                  width: props.width ? `${props.width}` : undefined,
                  height: props.height ? `${props.height}` : undefined,
                }}
              />
            );
          },
          
          // Links - external links open in new tab
          a: ({ node, ...props }) => {
            const isExternal = props.href?.startsWith('http');
            return (
              <a
                {...props}
                className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors duration-200"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              />
            );
          },
          
          // Blockquotes - enhanced styling
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-indigo-500 bg-indigo-50 pl-6 pr-4 py-4 italic text-gray-700 rounded-r-lg my-6"
            />
          ),
          
          // Code blocks - with language label
          pre: ({ node, ...props }) => (
            <div className="relative my-6">
              <pre
                {...props}
                className="bg-gray-900 text-gray-100 rounded-xl p-6 overflow-x-auto shadow-lg"
              />
            </div>
          ),
          
          // Inline code
          code: ({ node, inline, ...props }: any) => {
            if (inline) {
              return (
                <code
                  {...props}
                  className="text-pink-600 bg-gray-100 px-2 py-1 rounded text-sm font-mono"
                />
              );
            }
            return <code {...props} />;
          },
          
          // Tables - enhanced styling
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-gray-300">
              <table {...props} className="min-w-full divide-y divide-gray-300" />
            </div>
          ),
          
          // Headings - with anchor links
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-4xl font-bold mb-6 mt-8 text-gray-900 leading-tight" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-3xl font-bold mb-5 mt-8 pb-2 border-b border-gray-200 text-gray-900" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-2xl font-bold mb-4 mt-6 text-gray-900" />
          ),
          
          // Paragraphs
          p: ({ node, ...props }) => (
            <p {...props} className="text-gray-700 leading-relaxed mb-6 text-base" />
          ),
          
          // Lists
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc pl-6 mb-6 space-y-2" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal pl-6 mb-6 space-y-2" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="text-gray-700 leading-relaxed" />
          ),
          
          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr {...props} className="border-gray-300 my-10 border-t-2" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}