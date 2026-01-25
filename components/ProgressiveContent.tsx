'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface ProgressiveContentProps {
  content: string
  headingIdMap?: Map<string, string>
  chunkSize?: number // Words per chunk
}

// ✅ NEW: Export handle type for TypeScript
export interface ProgressiveContentHandle {
  loadAllContent: () => void
}

// ✅ CHANGED: Use forwardRef to expose methods
const ProgressiveContent = forwardRef<ProgressiveContentHandle, ProgressiveContentProps>(
  ({ content, headingIdMap, chunkSize = 200 }, ref) => {
    const [visibleChunks, setVisibleChunks] = useState(1)
    const [chunks, setChunks] = useState<string[]>([])
    const loadMoreRef = useRef<HTMLDivElement>(null)

    // ✅ NEW: Expose method to parent component
    useImperativeHandle(ref, () => ({
      loadAllContent: () => {
        setVisibleChunks(chunks.length)
      }
    }))

    useEffect(() => {
      // Split content into chunks by paragraphs
      const paragraphs = content.split('\n\n').filter(p => p.trim())
      const contentChunks: string[] = []
      let currentChunk = ''
      let wordCount = 0
      
      paragraphs.forEach((paragraph) => {
        const paragraphWords = paragraph.split(/\s+/).length
        
        if (wordCount + paragraphWords > chunkSize && currentChunk.length > 0) {
          contentChunks.push(currentChunk)
          currentChunk = paragraph
          wordCount = paragraphWords
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph
          wordCount += paragraphWords
        }
      })
      
      if (currentChunk) {
        contentChunks.push(currentChunk)
      }
      
      setChunks(contentChunks)
    }, [content, chunkSize])

    useEffect(() => {
      // Load more chunks when user scrolls near the bottom
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && visibleChunks < chunks.length) {
            // Load next chunk
            setVisibleChunks((prev) => prev + 1)
          }
        },
        { 
          rootMargin: '500px', // Start loading 500px before reaching the trigger
          threshold: 0.01
        }
      )

      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current)
      }

      return () => observer.disconnect()
    }, [visibleChunks, chunks.length])

    return (
      <div>
        {/* Render visible chunks */}
        {chunks.slice(0, visibleChunks).map((chunk, index) => (
          <div key={index}>
            <MarkdownRenderer 
              content={chunk} 
              headingIdMap={index === 0 ? headingIdMap : undefined} // Only apply map to first chunk
            />
          </div>
        ))}
        
        {/* Loading trigger and indicator */}
        {visibleChunks < chunks.length && (
          <div ref={loadMoreRef} className="py-8 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-500">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium">Loading more...</span>
            </div>
          </div>
        )}
        
        {/* All content loaded */}
        {visibleChunks >= chunks.length && chunks.length > 1 && (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-400">✓ All content loaded</p>
          </div>
        )}
      </div>
    )
  }
)

ProgressiveContent.displayName = 'ProgressiveContent'

export default ProgressiveContent