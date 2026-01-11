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
}

export default function TableOfContents({ content, headingIdMap }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

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
          // Find the entry that is most visible
          let maxRatio = 0
          let mostVisibleEntry: IntersectionObserverEntry | null = null

          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
              maxRatio = entry.intersectionRatio
              mostVisibleEntry = entry
            }
          })

          if (mostVisibleEntry) {
            setActiveId(mostVisibleEntry.target.id)
          }
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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    
    const element = document.getElementById(id)
    
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
    }
}

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 sticky top-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        Table of Contents
      </h2>
      
      <nav>
        <ul className="space-y-2">
          {headings.map((heading) => (
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
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}