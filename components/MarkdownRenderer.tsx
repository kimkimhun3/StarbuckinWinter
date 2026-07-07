'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'
import LazyImage from './LazyImage'

interface MarkdownRendererProps {
  content: string
  headingIdMap?: Map<string, string> // Map of Japanese heading text to English ID
}

export default function MarkdownRenderer({ content, headingIdMap }: MarkdownRendererProps) {
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const getHeadingId = (children: any): string => {
    const text = children?.toString() || ''
    
    // If we have a heading ID map and this text is in it, use the mapped ID
    if (headingIdMap && headingIdMap.has(text)) {
      return headingIdMap.get(text)!
    }
    
    // Otherwise, generate slug from the text (works for English)
    return generateSlug(text)
  }

  return (
    <article className="prose prose-slate lg:prose-lg xl:prose-xl max-w-none
      prose-headings:font-medium prose-headings:text-[#2F2F2F] prose-headings:tracking-tight
      prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight
      prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-[#E5E1D6]
      prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6
      prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-5
      prose-p:text-[#3F3F3F] prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
      prose-a:text-[#3E4A61] prose-a:no-underline prose-a:font-medium hover:prose-a:underline hover:prose-a:text-[#2E3749] prose-a:transition-colors
      prose-strong:text-[#2F2F2F] prose-strong:font-semibold
      prose-em:text-[#3F3F3F] prose-em:italic
      prose-code:text-[#A63A32] prose-code:bg-[#F0ECE1] prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-[#2B2B28] prose-pre:text-gray-100 prose-pre:rounded-sm prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:shadow-lg prose-pre:my-6
      prose-blockquote:border-l-4 prose-blockquote:border-[#3E4A61] prose-blockquote:bg-[#3E4A61]/5 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:text-[#3F3F3F] prose-blockquote:rounded-r-sm prose-blockquote:my-6
      prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:space-y-2
      prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:space-y-2
      prose-li:text-[#3F3F3F] prose-li:leading-relaxed
      prose-li:marker:text-[#3E4A61]
      prose-img:rounded-sm prose-img:shadow-lg prose-img:my-8 prose-img:w-full prose-img:h-auto
      prose-hr:border-[#D4CFC4] prose-hr:my-10 prose-hr:border-t-2
      prose-table:border-collapse prose-table:w-full prose-table:my-6 prose-table:text-sm
      prose-thead:bg-[#F0ECE1]
      prose-th:border prose-th:border-[#D4CFC4] prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:text-[#2F2F2F]
      prose-td:border prose-td:border-[#D4CFC4] prose-td:p-3 prose-td:text-[#3F3F3F]
      prose-tr:border-b prose-tr:border-[#E5E1D6] hover:prose-tr:bg-[#F5F1E8]
      prose-video:rounded-sm prose-video:shadow-lg prose-video:my-8 prose-video:w-full
      ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Images - WITH LAZY LOADING (UPDATED!)
          img: ({ node, ...props }) => {
            const hasCustomSize = props.width || props.height;
            
            return (
              <LazyImage
                src={typeof props.src === 'string' ? props.src : (props.src ? URL.createObjectURL(props.src) : '')}
                alt={props.alt || 'Blog image'}
                width={props.width}
                height={props.height}
                className={`rounded-xl shadow-lg object-cover my-8 ${
                  hasCustomSize ? 'mx-auto' : 'w-full'
                } h-auto`}
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
                className="text-[#3E4A61] hover:text-[#2E3749] hover:underline font-medium transition-colors duration-200"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              />
            );
          },

          // Blockquotes - enhanced styling
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-[#3E4A61] bg-[#3E4A61]/5 pl-6 pr-4 py-4 italic text-[#3F3F3F] rounded-r-sm my-6"
            />
          ),

          // Code blocks
          pre: ({ node, ...props }) => (
            <div className="relative my-6">
              <pre
                {...props}
                className="bg-[#2B2B28] text-gray-100 rounded-sm p-6 overflow-x-auto shadow-lg"
              />
            </div>
          ),

          // Inline code
          code: ({ node, inline, ...props }: any) => {
            if (inline) {
              return (
                <code
                  {...props}
                  className="text-[#A63A32] bg-[#F0ECE1] px-2 py-1 rounded text-sm font-mono"
                />
              );
            }
            return <code {...props} />;
          },

          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-sm border border-[#D4CFC4]">
              <table {...props} className="min-w-full divide-y divide-[#D4CFC4]" />
            </div>
          ),

          // Headings - with mapped IDs
          h1: ({ node, children, ...props }) => {
            const id = getHeadingId(children)
            return (
              <h1 {...props} id={id} className="text-4xl font-medium mb-6 mt-8 text-[#2F2F2F] leading-tight scroll-mt-24">
                {children}
              </h1>
            )
          },
          h2: ({ node, children, ...props }) => {
            const id = getHeadingId(children)
            return (
              <h2 {...props} id={id} className="text-3xl font-medium mb-5 mt-8 pb-2 border-b border-[#E5E1D6] text-[#2F2F2F] scroll-mt-24">
                {children}
              </h2>
            )
          },
          h3: ({ node, children, ...props }) => {
            const id = getHeadingId(children)
            return (
              <h3 {...props} id={id} className="text-2xl font-medium mb-4 mt-6 text-[#2F2F2F] scroll-mt-24">
                {children}
              </h3>
            )
          },

          // Paragraphs
          p: ({ node, ...props }) => (
            <p {...props} className="text-[#3F3F3F] leading-relaxed mb-6 text-base" />
          ),

          // Lists
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc pl-6 mb-6 space-y-2" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal pl-6 mb-6 space-y-2" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="text-[#3F3F3F] leading-relaxed" />
          ),

          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr {...props} className="border-[#D4CFC4] my-10 border-t-2" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}