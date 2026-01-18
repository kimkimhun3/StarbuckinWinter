'use client'

import { useEffect, useRef, useState, memo } from 'react'

// Global cache to track loaded images across component re-renders
const loadedImagesCache = new Set<string>()

interface LazyImageProps {
  src: string
  alt: string
  width?: string | number
  height?: string | number
  className?: string
  style?: React.CSSProperties
}

function LazyImageComponent({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  style 
}: LazyImageProps) {
  // Use cache to determine initial loaded state
  const wasPreviouslyLoaded = loadedImagesCache.has(src)
  const [isLoaded, setIsLoaded] = useState(wasPreviouslyLoaded)
  const [isInView, setIsInView] = useState(wasPreviouslyLoaded) // If already loaded, show immediately
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)
  const imageElementRef = useRef<HTMLImageElement | null>(null)

  // Mark image as loaded in cache when it loads
  useEffect(() => {
    if (wasPreviouslyLoaded && !isInView) {
      setIsInView(true)
    }
  }, [wasPreviouslyLoaded, isInView])

  useEffect(() => {
    // If already cached, don't need observer
    if (loadedImagesCache.has(src)) {
      return
    }

    // Intersection Observer to detect when image enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect() // Stop observing once visible
          }
        })
      },
      {
        rootMargin: '300px', // Start loading 300px before image enters viewport
        threshold: 0.01
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src])

  // Determine if image has custom size (should be centered)
  const hasCustomSize = width || height
  const imageWidth = width ? (typeof width === 'number' ? `${width}px` : width) : '100%'
  const imageHeight = height ? (typeof height === 'number' ? `${height}px` : height) : 'auto'

  return (
    <div 
      ref={imgRef} 
      className={`relative ${hasCustomSize ? 'mx-auto' : 'w-full'}`}
      style={{
        width: hasCustomSize ? imageWidth : '100%',
        maxWidth: '100%',
        ...style
      }}
    >
      {/* Minimal Skeleton Placeholder - Only shows border/outline */}
      {!isLoaded && !hasError && isInView && (
        <div 
          className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-transparent"
          style={{
            width: imageWidth,
            height: imageHeight === 'auto' ? '200px' : imageHeight,
          }}
        >
          {/* Small loading icon */}
          <svg 
            className="w-8 h-8 text-gray-300 animate-pulse" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      )}
      
      {/* Error State - Minimal */}
      {hasError && (
        <div 
          className="border-2 border-dashed border-red-200 rounded-xl p-8 text-center bg-red-50"
          style={{
            width: imageWidth,
            minHeight: '150px',
          }}
        >
          <svg 
            className="w-8 h-8 text-red-400 mx-auto mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <p className="text-red-500 text-xs">Image failed to load</p>
        </div>
      )}
      
      {/* Actual Image - Centered and properly sized */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-500 ${className} ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: imageWidth,
            height: imageHeight,
            maxWidth: '100%',
            display: 'block',
            margin: hasCustomSize ? '0 auto' : undefined,
            ...style
          }}
          ref={(el) => {
            imageElementRef.current = el
            // Check if image is already loaded (cached in browser)
            if (el && el.complete && el.naturalHeight !== 0 && !isLoaded) {
              setIsLoaded(true)
              loadedImagesCache.add(src)
            }
          }}
          onLoad={() => {
            setIsLoaded(true)
            loadedImagesCache.add(src) // Cache loaded images
          }}
          onError={() => {
            setHasError(true)
            console.error(`Failed to load image: ${src}`)
          }}
        />
      )}
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders when parent re-renders
// Only re-render if props actually change
const LazyImage = memo(LazyImageComponent, (prevProps, nextProps) => {
  // Only re-render if src, alt, width, or height changes
  return (
    prevProps.src === nextProps.src &&
    prevProps.alt === nextProps.alt &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.className === nextProps.className &&
    JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
  )
})

LazyImage.displayName = 'LazyImage'

export default LazyImage