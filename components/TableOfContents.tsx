'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  headingIdMap?: Map<string, string> // Map of Japanese heading text to English ID
  onHeadingClick?: (id: string) => Promise<void>
}

export default function TableOfContents({ 
  content, 
  headingIdMap,
  onHeadingClick 
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isNavigating, setIsNavigating] = useState(false)
  
  // ✅ NEW: Collapse state for mobile
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // ✅ NEW: Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280) // xl breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const matches: TocItem[] = []
    let match
    const usedIds = new Map<string, number>() // Track duplicate IDs

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length // Number of # characters
      const text = match[2].trim()
      
      let baseId: string
      
      // If we have a heading ID map and this text is in it, use the mapped ID
      if (headingIdMap && headingIdMap.has(text)) {
        baseId = headingIdMap.get(text)!
      } else {
        // Otherwise, generate slug from the text (works for English)
        baseId = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim()
      }

      // Handle duplicate IDs by adding a suffix
      if (usedIds.has(baseId)) {
        const count = usedIds.get(baseId)! + 1
        usedIds.set(baseId, count)
        baseId = `${baseId}-${count}`
      } else {
        usedIds.set(baseId, 1)
      }

      matches.push({ id: baseId, text, level })
    }

    setHeadings(matches)
  }, [content, headingIdMap])

  useEffect(() => {
    if (headings.length === 0) return

    let observer: IntersectionObserver | null = null
    const elementsToObserve: Element[] = []

    const setupObserver = () => {
      // Check if all heading elements exist in the DOM
      const allElements = headings.map(({ id }) => document.getElementById(id)).filter(Boolean)
      
      if (allElements.length !== headings.length) {
        // Not all elements ready yet, try again after a short delay
        setTimeout(setupObserver, 50)
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries.filter(
            (entry) => entry.isIntersecting
          )

          if (visibleEntries.length === 0) return

          const mostVisibleEntry = visibleEntries.reduce((prev, curr) =>
            curr.intersectionRatio > prev.intersectionRatio ? curr : prev
          )

          setActiveId((mostVisibleEntry.target as HTMLElement).id)
        },
        {
          rootMargin: '-20% 0px -80% 0px',
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        }
      )

      // Observe all heading elements
      headings.forEach(({ id }) => {
        const element = document.getElementById(id)
        if (element) {
          elementsToObserve.push(element)
          observer?.observe(element)
        }
      })

      // Set the first heading as active initially
      if (headings.length > 0) {
        setActiveId(headings[0].id)
      }
    }

    // Start setup after a delay to ensure DOM is ready
    setTimeout(setupObserver, 200)

    // Cleanup function
    return () => {
      if (observer) {
        elementsToObserve.forEach((element) => {
          observer?.unobserve(element)
        })
        observer.disconnect()
      }
    }
  }, [headings])

  // Enhanced click handler with loading support
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    
    setIsNavigating(true)
    
    try {
      // Check if element exists
      let element = document.getElementById(id)
      
      if (!element) {
        // Element doesn't exist - trigger callback to load content
        if (onHeadingClick) {
          console.log(`🔄 Loading content for: ${id}`)
          await onHeadingClick(id)
          
          // Wait a bit for React to render
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Try to find element again
          element = document.getElementById(id)
        }
      }
      
      if (element) {
        const offset = 100 // Offset from top
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
        
        // Update active ID immediately on click
        setActiveId(id)
      } else {
        console.warn(`⚠️ Could not find element: ${id}`)
      }
    } finally {
      setIsNavigating(false)
    }
  }

  if (headings.length === 0) {
    return null
  }

  // ✅ NEW: Determine how many items to show when collapsed
  const COLLAPSED_LIMIT = 5 // Show only first 5 items on mobile when collapsed
  const displayedHeadings = isMobile && !isExpanded 
    ? headings.slice(0, COLLAPSED_LIMIT) 
    : headings
  const hasMore = headings.length > COLLAPSED_LIMIT

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 xl:sticky xl:top-8">
      {/* ✅ UPDATED: Header with expand/collapse button on mobile */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Table of Contents
          {/* Loading indicator */}
          {isNavigating && (
            <svg className="animate-spin ml-2 h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </h2>
        
        {/* ✅ NEW: Expand/Collapse button - only show on mobile when there are more items */}
        {isMobile && hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="xl:hidden flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            aria-label={isExpanded ? 'Show less' : 'Show more'}
          >
            <span>{isExpanded ? 'Less' : 'More'}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      
      <nav>
        <ul className="space-y-2">
          {displayedHeadings.map((heading) => (
            <li
              key={heading.id}
              style={{
                paddingLeft: `${(heading.level - 1) * 16}px`,
              }}
            >

              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`block text-sm hover:text-indigo-600 transition-colors ${
                  activeId === heading.id
                    ? 'text-indigo-600 font-semibold'
                    : 'text-gray-600'
                } ${isNavigating ? 'pointer-events-none opacity-50' : ''}`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
        
        {/* ✅ NEW: "Show More" text indicator on mobile */}
        {isMobile && !isExpanded && hasMore && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-center text-xs text-gray-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1"
            >
              <span>+ {headings.length - COLLAPSED_LIMIT} more section{headings.length - COLLAPSED_LIMIT !== 1 ? 's' : ''}</span>
            </button>
          </div>
        )}
      </nav>
    </div>
  )
  
  

  }