'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { PageFlip, SizeType } from 'page-flip'
import * as pdfjs from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'
import './FlipBookStyle2.css'
import { MdFullscreen } from 'react-icons/md'

// Ensure worker is configured
if (typeof window !== 'undefined') {
  // Use the local worker file which we guaranteed matches the installed version
  pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs'
}

interface PageFlipBookProps {
  pdfUrl: string
  align?: 'center' | 'start'
}

const PageFlipBook: React.FC<PageFlipBookProps> = ({ pdfUrl, align = 'center' }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const bookContainerRef = useRef<HTMLDivElement>(null)
  const pageFlipRef = useRef<PageFlip | null>(null)
  // Store the PDF document in a ref to persist across re-renders without re-loading
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null)
  const pagesRef = useRef<HTMLDivElement[]>([])
  const renderingRef = useRef<Set<number>>(new Set())
  const renderTasksRef = useRef<Map<number, any>>(new Map()) // Store render tasks to cancel them
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreenTab, setIsFullscreenTab] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Container dimensions state
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // 1. Handle Fullscreen Check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsFullscreenTab(window.location.pathname === '/flipbook')
    }
  }, [])

  const toggleFullScreen = () => {
    const newTab = window.open('', '_blank')
    if (newTab) {
      newTab.localStorage.setItem('pdfUrl', pdfUrl)
      newTab.location.href = '/flipbook'
    }
  }

  // 2. Load PDF Document (Only once when URL changes)
  useEffect(() => {
    let isMounted = true

    const loadPdfDocument = async () => {
      if (!pdfUrl) return

      try {
        setIsLoading(true)
        setError(null)
        
        // Clean up previous document if exists
        if (pdfDocRef.current) {
          pdfDocRef.current.destroy()
          pdfDocRef.current = null
        }

        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
          rangeChunkSize: 65536, // 64KB chunks for better streaming
          disableAutoFetch: true, // Don't fetch the whole file automatically
          disableStream: false,   // Allow streaming
        })
        const pdf = await loadingTask.promise
        
        if (isMounted) {
          pdfDocRef.current = pdf
          setTotalPages(pdf.numPages)
          // We don't set loading false here yet, we wait for layout
        }
      } catch (err: any) {
        console.error('Error loading PDF:', err)
        console.error('PDF URL:', pdfUrl)
        if (isMounted) {
          let msg = 'Gagal memuat dokumen PDF.'
          if (err.name === 'MissingPDFException') {
            msg += ' File tidak ditemukan (404).'
          } else if (err.name === 'InvalidPDFException') {
            msg += ' File rusak atau bukan PDF valid.'
          } else {
            msg += ` Error: ${err.message || err}`
          }
          setError(msg)
          setIsLoading(false)
        }
      }
    }

    loadPdfDocument()

    return () => {
      isMounted = false
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy()
        pdfDocRef.current = null
      }
    }
  }, [pdfUrl])

  // 3. Handle Resize & Dimensions
  const updateDimensions = useCallback(() => {
    if (!wrapperRef.current) return

    let containerWidth = wrapperRef.current.clientWidth
    const containerHeight = wrapperRef.current.clientHeight || window.innerHeight * 0.8
    const isMobile = window.innerWidth < 768
    const isLg = window.innerWidth >= 1024
    
    // Adjust width for left alignment offset on desktop
    const desktopOffset = 64 // Match lg:pl-16 (64px)
    if (align === 'start' && isLg) {
      containerWidth -= desktopOffset
    }

    // Page aspect ratio (Width / Height)
    // A4 is 1 / 1.414 = 0.707. Here we use 400/533 = 0.75
    const aspectRatio = 0.75 

    let pageWidth, pageHeight

    if (!isMobile) {
      // Desktop: Double page view (Side by side)
      // Total width needed = 2 * pageWidth
      // Available area: containerWidth x containerHeight
      
      // Try fitting by height first
      pageHeight = containerHeight * 0.95 // 5% margin
      pageWidth = pageHeight * aspectRatio

      // Check if it overflows width
      if (pageWidth * 2 > containerWidth) {
        pageWidth = (containerWidth * 0.95) / 2
        pageHeight = pageWidth / aspectRatio
      }
    } else {
      // Mobile: Single page view
      pageHeight = containerHeight * 0.95
      pageWidth = pageHeight * aspectRatio

      if (pageWidth > containerWidth) {
        pageWidth = containerWidth * 0.95
        pageHeight = pageWidth / aspectRatio
      }
    }

    setDimensions({ width: Math.floor(pageWidth), height: Math.floor(pageHeight) })
  }, [isFullscreenTab])

  useEffect(() => {
    // Initial update
    updateDimensions()
    
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
      // Debounce resize to improve INP
      resizeTimeoutRef.current = setTimeout(() => {
          requestAnimationFrame(updateDimensions)
      }, 200)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
    }
  }, [updateDimensions])

  // 4. Render Single Page
  const renderPage = useCallback(async (pageIndex: number) => {
    if (!pdfDocRef.current || !pagesRef.current[pageIndex]) return
    if (renderingRef.current.has(pageIndex)) return

    // Cancel any existing render task for this page
    if (renderTasksRef.current.has(pageIndex)) {
      try {
        renderTasksRef.current.get(pageIndex).cancel()
      } catch (e) {
        // Ignore cancel errors
      }
      renderTasksRef.current.delete(pageIndex)
    }

    const pageWrapper = pagesRef.current[pageIndex]
    // If canvas exists, assume rendered
    if (pageWrapper.querySelector('canvas')) return

    try {
      renderingRef.current.add(pageIndex)
      const page = await pdfDocRef.current.getPage(pageIndex + 1)
      
      // Use device pixel ratio for sharp rendering
      const pixelRatio = window.devicePixelRatio || 1
      const viewport = page.getViewport({ scale: 1.5 * pixelRatio }) // Slightly higher scale for zoom quality

      // Validate viewport dimensions
      if (viewport.width === 0 || viewport.height === 0) {
          console.error(`Invalid viewport for page ${pageIndex}:`, viewport)
          return
      }

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (context) {
        canvas.width = viewport.width
        canvas.height = viewport.height
        // Scale down via CSS to fit container
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        
        const renderTask = page.render({ canvasContext: context, viewport })
        renderTasksRef.current.set(pageIndex, renderTask)

        await renderTask.promise

        if (!pageWrapper.querySelector('canvas')) {
          pageWrapper.innerHTML = '' // Clear loading placeholder if any
          pageWrapper.appendChild(canvas)
        }
      }
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error(`Error rendering page ${pageIndex}:`, err)
      }
    } finally {
      renderingRef.current.delete(pageIndex)
      renderTasksRef.current.delete(pageIndex)
    }
  }, [])

  const clearPage = useCallback((pageIndex: number) => {
    if (!pagesRef.current[pageIndex]) return
    
    const pageWrapper = pagesRef.current[pageIndex]
    if (pageWrapper.querySelector('canvas')) {
       // Explicitly clear content and references
       pageWrapper.innerHTML = ''
       // Force style reset if needed
    }
  }, [])

  const updateVisiblePages = useCallback((current: number) => {
    if (!pdfDocRef.current) return
    
    const total = pdfDocRef.current.numPages
    const RANGE = 2 // Render current +/- 2 pages
    
    // Render priority pages
    for (let i = Math.max(0, current - RANGE); i < Math.min(total, current + RANGE + 1); i++) {
      renderPage(i)
    }

    // Cleanup distant pages to save memory
    const CLEANUP_RANGE = 4
    for (let i = 0; i < total; i++) {
      if (i < current - CLEANUP_RANGE || i > current + CLEANUP_RANGE) {
        clearPage(i)
      }
    }
  }, [renderPage, clearPage])

  // 5. Initialize FlipBook (Runs when Dimensions & PDF are ready)
  useEffect(() => {
    if (!pdfDocRef.current || dimensions.width === 0 || !bookContainerRef.current) return

    const initBook = async () => {
      try {
        // Destroy existing instance
        if (pageFlipRef.current) {
          pageFlipRef.current.destroy()
          pageFlipRef.current = null
        }

        const container = bookContainerRef.current
        if (!container) return

        // Reset container content
        container.innerHTML = ''
        pagesRef.current = []

        // Create page wrappers
        for (let i = 0; i < totalPages; i++) {
          const pageWrapper = document.createElement('div')
          pageWrapper.className = 'page' // Must match CSS for shading/shadows
          pageWrapper.dataset.density = 'hard'
          // Initial size
          pageWrapper.style.width = `${dimensions.width}px`
          pageWrapper.style.height = `${dimensions.height}px`
          
          container.appendChild(pageWrapper)
          pagesRef.current.push(pageWrapper)
        }

        const isMobile = window.innerWidth < 768

        const pageFlip = new PageFlip(container, {
          width: dimensions.width,
          height: dimensions.height,
          size: 'fixed' as SizeType,
          maxShadowOpacity: 0.5,
          showCover: true,
          mobileScrollSupport: false, // Set false to prevent conflicts with touch swipe
          usePortrait: isMobile, // Single page on mobile
          startPage: currentPage > 1 ? currentPage - 1 : 0, // Restore page
          flippingTime: 400, // Smooth transition 400ms
          clickEventForward: true,
          useMouseEvents: true,
        })

        pageFlip.loadFromHTML(pagesRef.current)
        pageFlipRef.current = pageFlip

        // Event Listeners
        pageFlip.on('flip', (e: any) => {
          const newIndex = e.data as number
          setCurrentPage(newIndex + 1)
          updateVisiblePages(newIndex)
        })

        // Trigger initial render
        updateVisiblePages(currentPage - 1)
        
        setIsLoading(false)
      } catch (err) {
        console.error('Error initializing FlipBook:', err)
        setIsLoading(false)
      }
    }

    initBook()

    return () => {
      if (pageFlipRef.current) {
        pageFlipRef.current.destroy()
        pageFlipRef.current = null
      }
      // Cancel all pending renders
      renderTasksRef.current.forEach((task) => {
        try {
            task.cancel()
        } catch(e) {}
      })
      renderTasksRef.current.clear()
      pagesRef.current = []
    }
    // Re-run when dimensions change (resize) or PDF loads (totalPages)
  }, [dimensions, totalPages, updateVisiblePages]) 
  // Note: We don't include currentPage in dependency to avoid re-init on flip

  const goToPage = () => {
    if (!pageFlipRef.current) return
    const target = Math.min(Math.max(1, currentPage), totalPages)
    // PageFlip is 0-indexed
    try {
        pageFlipRef.current.turnToPage(target - 1)
    } catch (e) {
        console.error("Flip error", e)
    }
  }

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>

  return (
    <div ref={wrapperRef} className={`relative w-full h-full flex flex-col ${align === 'center' ? 'items-center' : 'items-center lg:items-start lg:pl-16'} justify-center gap-4 hide-scrollbar overflow-hidden`}>
      {/* Controls */}
      {!isLoading && (
        <div className="flex flex-wrap items-center justify-center gap-2 z-10 bg-white/80 p-2 rounded-lg backdrop-blur-sm shadow-sm">
          <span className="text-sm font-medium">Halaman</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && goToPage()}
              onBlur={goToPage}
              className="w-16 border rounded px-2 py-1 text-center"
            />
            <span className="text-sm text-gray-500">/ {totalPages}</span>
          </div>
          <button
            onClick={goToPage}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Go
          </button>
        </div>
      )}

      {/* Fullscreen Toggle */}
      {!isFullscreenTab && !isLoading && (
        <button
          onClick={toggleFullScreen}
          className="absolute top-0 right-0 p-2 rounded-full bg-gray-800/60 text-white hover:bg-gray-800/80 transition z-20"
          title="Buka Fullscreen"
        >
          <MdFullscreen size={24} />
        </button>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gray-50/50">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600 font-medium">Memuat buku...</p>
        </div>
      )}

      {/* Book Container */}
      <div 
        className="book-wrapper relative hide-scrollbar"
        style={{
           width: dimensions.width,
           height: dimensions.height,
           // Hide until ready to prevent layout shift ugliness
           opacity: isLoading ? 0 : 1, 
           transition: 'opacity 0.3s ease'
        }}
      >
        <div 
          ref={bookContainerRef} 
          className="book-container shadow-2xl" 
          style={{ visibility: 'visible' }} // Override CSS visibility: hidden
        />
      </div>
    </div>
  )
}

export default PageFlipBook
