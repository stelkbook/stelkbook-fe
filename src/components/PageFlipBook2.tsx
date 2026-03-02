'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { PageFlip, SizeType } from 'page-flip'
import * as pdfjs from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'
import './FlipBookStyle2.css'
import { MdFullscreen, MdRefresh } from 'react-icons/md'

// Ensure worker is configured
if (typeof window !== 'undefined') {
  // Use the local worker file which we guaranteed matches the installed version
  pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs'
}

interface PageFlipBookProps {
  pdfUrl: string
  align?: 'center' | 'start'
  showFullscreenButton?: boolean
}

const PageFlipBook: React.FC<PageFlipBookProps> = ({ pdfUrl, align = 'center', showFullscreenButton = true }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const bookContainerRef = useRef<HTMLDivElement>(null)
  const pageFlipRef = useRef<PageFlip | null>(null)
  // Store the PDF document in a ref to persist across re-renders without re-loading
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null)
  const pagesRef = useRef<HTMLDivElement[]>([])
  const renderingRef = useRef<Set<number>>(new Set())
  const renderTasksRef = useRef<Map<number, any>>(new Map()) // Store render tasks to cancel them
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreenTab, setIsFullscreenTab] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pdfAspectRatio, setPdfAspectRatio] = useState(0.75) // Default A4-ish
  
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

  const reloadBook = () => {
    window.location.reload()
  }

  // 2. Load PDF Document (Only once when URL changes)
  useEffect(() => {
    let isMounted = true

    const loadPdfDocument = async () => {
      if (!pdfUrl) return

      try {
        setIsLoading(true)
        setError(null)
        console.log("Loading PDF from:", pdfUrl);
        
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
          cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
          cMapPacked: true,
        })
        
        const pdf = await loadingTask.promise
        
        if (isMounted) {
          console.log("PDF Loaded successfully, pages:", pdf.numPages);
          pdfDocRef.current = pdf
          setTotalPages(pdf.numPages)
          
          // Determine aspect ratio from first page
          try {
            const page = await pdf.getPage(1)
            const viewport = page.getViewport({ scale: 1 })
            if (viewport.width > 0 && viewport.height > 0) {
                const ratio = viewport.width / viewport.height
                console.log("PDF Aspect Ratio detected:", ratio)
                setPdfAspectRatio(ratio)
            }
          } catch (e) {
            console.warn("Could not determine PDF aspect ratio, using default", e)
          }
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
    let containerHeight = wrapperRef.current.clientHeight

    // Ensure minimum dimensions to prevent collapse/disappearance
    // Use window height if container height is suspiciously small (e.g. collapsed flex)
    if (containerHeight < 400 || containerHeight === 0) {
       // If in fullscreen tab, use full window height
       // If embedded, try to use a reasonable default based on viewport
       const minHeight = Math.max(window.innerHeight * 0.6, 500);
       containerHeight = minHeight;
    }
    
    // Safety check for width
    if (containerWidth === 0) {
        containerWidth = window.innerWidth * 0.9;
    }

    // Threshold for switching to single page view
    // Increased to 1024px to support Tablets in Portrait mode better
    const isSinglePage = window.innerWidth < 1024 
    const isLg = window.innerWidth >= 1024
    
    // Adjust width for left alignment offset on desktop
    const desktopOffset = 64 // Match lg:pl-16 (64px)
    if (align === 'start' && isLg) {
      containerWidth -= desktopOffset
    }
    
    // Ensure positive width
    if (containerWidth <= 0) containerWidth = 300;

    let pageWidth, pageHeight

    if (!isSinglePage) {
      // Desktop: Double page view (Side by side)
      // Total width needed = 2 * pageWidth
      // Available area: containerWidth x containerHeight
      
      // Try fitting by height first
      pageHeight = containerHeight * 0.95 // 5% margin
      pageWidth = pageHeight * pdfAspectRatio

      // Check if it overflows width
      if (pageWidth * 2 > containerWidth) {
        // Fit by width
        pageWidth = (containerWidth * 0.95) / 2
        pageHeight = pageWidth / pdfAspectRatio
      }
    } else {
      // Mobile/Tablet Portrait: Single page view
      pageHeight = containerHeight * 0.95
      pageWidth = pageHeight * pdfAspectRatio

      if (pageWidth > containerWidth) {
        pageWidth = containerWidth * 0.95
        pageHeight = pageWidth / pdfAspectRatio
      }
    }

    // Ensure integer values to prevent sub-pixel rendering issues
    const newW = Math.floor(pageWidth);
    const newH = Math.floor(pageHeight);
    
    // Only update if dimensions changed significantly (> 5px) to prevent loop/flicker
    setDimensions(prev => {
        if (Math.abs(prev.width - newW) > 5 || Math.abs(prev.height - newH) > 5) {
            console.log("Updating dimensions:", { width: newW, height: newH });
            return { width: newW, height: newH };
        }
        return prev;
    });
  }, [isFullscreenTab, align, pdfAspectRatio])

  useEffect(() => {
    // Initial update
    updateDimensions()
    
    // Use ResizeObserver for robust detection of container size changes
    if (wrapperRef.current) {
        resizeObserverRef.current = new ResizeObserver((entries) => {
             // Debounce resize
            if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
            resizeTimeoutRef.current = setTimeout(() => {
                requestAnimationFrame(updateDimensions)
            }, 500) // Increased debounce time for stability (200->500ms)
        });
        resizeObserverRef.current.observe(wrapperRef.current);
    }
    
    // Fallback to window resize
    const handleWindowResize = () => {
         if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
            resizeTimeoutRef.current = setTimeout(() => {
                requestAnimationFrame(updateDimensions)
            }, 500)
    }
    window.addEventListener('resize', handleWindowResize)

    return () => {
      window.removeEventListener('resize', handleWindowResize)
      if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect()
      }
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
    // If canvas exists, assume rendered (unless dimensions changed drastically)
    if (pageWrapper.querySelector('canvas')) return

    try {
      renderingRef.current.add(pageIndex)
      // console.log(`Rendering page ${pageIndex + 1}...`);
      
      const page = await pdfDocRef.current.getPage(pageIndex + 1)
      
      const pixelRatio = window.devicePixelRatio || 1
      const unscaledViewport = page.getViewport({ scale: 1 })
      
      if (unscaledViewport.width === 0) throw new Error("Invalid PDF page width")

      const scaleX = dimensions.width / unscaledViewport.width
      const viewport = page.getViewport({ scale: scaleX * pixelRatio })

      if (viewport.width === 0 || viewport.height === 0) {
          console.error(`Invalid viewport for page ${pageIndex}:`, viewport)
          return
      }

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (context) {
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        canvas.style.display = 'block'
        
        const renderTask = page.render({ canvasContext: context, viewport })
        renderTasksRef.current.set(pageIndex, renderTask)

        await renderTask.promise
        // console.log(`Page ${pageIndex + 1} rendered successfully`);

        if (!pageWrapper.querySelector('canvas')) {
          pageWrapper.innerHTML = ''
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
  }, [dimensions])

  const clearPage = useCallback((pageIndex: number) => {
    if (!pagesRef.current[pageIndex]) return
    const pageWrapper = pagesRef.current[pageIndex]
    if (pageWrapper.querySelector('canvas')) {
       pageWrapper.innerHTML = ''
    }
  }, [])

  const updateVisiblePages = useCallback((current: number) => {
    if (!pdfDocRef.current) return
    const total = pdfDocRef.current.numPages
    const RANGE = 2
    
    for (let i = Math.max(0, current - RANGE); i < Math.min(total, current + RANGE + 1); i++) {
      renderPage(i)
    }

    const CLEANUP_RANGE = 4
    for (let i = 0; i < total; i++) {
      if (i < current - CLEANUP_RANGE || i > current + CLEANUP_RANGE) {
        clearPage(i)
      }
    }
  }, [renderPage, clearPage])
  
  // Use a ref to access updateVisiblePages inside useEffect without adding it as dependency
  // This prevents re-initialization loops if the function reference changes
  const updateVisiblePagesRef = useRef(updateVisiblePages);
  useEffect(() => {
    updateVisiblePagesRef.current = updateVisiblePages;
  }, [updateVisiblePages]);

  // 5. Initialize FlipBook (Runs when Dimensions & PDF are ready)
  useEffect(() => {
    if (!pdfDocRef.current || dimensions.width === 0 || dimensions.height === 0 || !bookContainerRef.current) return

    let isEffectMounted = true;

    const initBook = async () => {
      try {
        console.log("Initializing FlipBook instance with:", dimensions);
        
        // Don't destroy if we are just updating? No, page-flip needs destroy for size change.
        if (pageFlipRef.current) {
          pageFlipRef.current.destroy()
          pageFlipRef.current = null
        }

        const container = bookContainerRef.current
        if (!container || !isEffectMounted) return

        container.innerHTML = ''
        pagesRef.current = []

        for (let i = 0; i < totalPages; i++) {
          const pageWrapper = document.createElement('div')
          pageWrapper.className = 'page'
          pageWrapper.dataset.density = 'hard'
          pageWrapper.style.width = `${dimensions.width}px`
          pageWrapper.style.height = `${dimensions.height}px`
          pageWrapper.style.overflow = 'hidden'
          
          container.appendChild(pageWrapper)
          pagesRef.current.push(pageWrapper)
        }

        const usePortrait = window.innerWidth < 1024

        container.style.visibility = 'visible';
        container.style.display = 'block';

        const pageFlip = new PageFlip(container, {
          width: dimensions.width,
          height: dimensions.height,
          size: 'fixed' as SizeType,
          maxShadowOpacity: 0.5,
          showCover: true,
          mobileScrollSupport: false,
          usePortrait: usePortrait,
          startPage: currentPage > 1 ? currentPage - 1 : 0,
          flippingTime: 400,
          clickEventForward: true,
          useMouseEvents: true,
          swipeDistance: 30,
          drawShadow: true,
        })

        if (!isEffectMounted) {
            pageFlip.destroy();
            return;
        }

        pageFlip.loadFromHTML(pagesRef.current)
        pageFlipRef.current = pageFlip

        pageFlip.on('flip', (e: any) => {
          const newIndex = e.data as number
          setCurrentPage(newIndex + 1)
          if (updateVisiblePagesRef.current) {
              updateVisiblePagesRef.current(newIndex)
          }
        })

        // Initial render
        if (updateVisiblePagesRef.current) {
            updateVisiblePagesRef.current(currentPage - 1)
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error('Error initializing FlipBook:', err)
        setIsLoading(false)
      }
    }

    const timer = setTimeout(() => {
        initBook()
    }, 100) 

    return () => {
      isEffectMounted = false;
      clearTimeout(timer)
      if (pageFlipRef.current) {
        // console.log("Destroying FlipBook instance due to effect cleanup");
        pageFlipRef.current.destroy()
        pageFlipRef.current = null
      }
      renderTasksRef.current.forEach((task) => {
        try { task.cancel() } catch(e) {}
      })
      renderTasksRef.current.clear()
      pagesRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, totalPages]) // Removed updateVisiblePages to prevent loop
  
  const goToPage = () => {
    if (!pageFlipRef.current) return
    const target = Math.min(Math.max(1, currentPage), totalPages)
    try {
        pageFlipRef.current.turnToPage(target - 1)
    } catch (e) {
        console.error("Flip error", e)
    }
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-100 text-center h-96">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <p className="text-gray-500 text-sm mb-4 break-all max-w-md">{pdfUrl}</p>
            <button 
                onClick={reloadBook}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
                <MdRefresh size={20} />
                Muat Ulang Buku
            </button>
        </div>
    )
  }

  return (
    <div ref={wrapperRef} className={`relative w-full h-full flex flex-col ${align === 'center' ? 'items-center' : 'items-center lg:items-start lg:pl-16'} justify-start gap-4 hide-scrollbar min-h-[500px]`} style={{ minHeight: '500px' }}>
      {/* Controls */}
      {!isLoading && (
        <div className="flex flex-wrap items-center justify-center gap-2 z-10 bg-white/80 p-2 rounded-lg backdrop-blur-sm shadow-sm transition-opacity duration-300">
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
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Go
          </button>
        </div>
      )}

      {/* Fullscreen Toggle */}
      {!isFullscreenTab && !isLoading && showFullscreenButton && (
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
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gray-50/50 backdrop-blur-sm rounded-xl" style={{ minHeight: '300px' }}>
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600 font-medium">Memuat buku...</p>
        </div>
      )}

      {/* Book Container */}
      <div 
        className="book-wrapper relative hide-scrollbar flex justify-center items-center w-full"
        style={{
           minHeight: dimensions.height || 500,
           zIndex: 10
        }}
      >
        <div 
          ref={bookContainerRef} 
          className="book-container shadow-2xl"
          style={{
             width: dimensions.width ? `${dimensions.width}px` : '100%',
             height: dimensions.height ? `${dimensions.height}px` : '500px',
             // Add a background color to debug visibility
             backgroundColor: '#f8f9fa' 
          }}
        />
      </div>
    </div>
  )
}

export default PageFlipBook
