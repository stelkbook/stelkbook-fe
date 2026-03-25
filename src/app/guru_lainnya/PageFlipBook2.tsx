'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { PageFlip, SizeType } from 'page-flip'
import * as pdfjs from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'
import '@/components/FlipBookStyle2.css'
import { MdFullscreen, MdClose } from 'react-icons/md'

// Ensure worker is configured
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs'
}

interface PageFlipBookProps {
  pdfUrl: string
  align?: 'start' | 'center' | 'end'
}

const PageFlipBook: React.FC<PageFlipBookProps> = ({ pdfUrl, align = 'center' }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const bookContainerRef = useRef<HTMLDivElement>(null)
  const pageFlipRef = useRef<PageFlip | null>(null)
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null)
  const pagesRef = useRef<HTMLDivElement[]>([])
  const renderingRef = useRef<Set<number>>(new Set())
  const renderTasksRef = useRef<Map<number, any>>(new Map())
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreenTab, setIsFullscreenTab] = useState(false)
  const [isModalFullscreen, setIsModalFullscreen] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [inputPage, setInputPage] = useState('1')

  const updateDimensions = useCallback(() => {
    if (!wrapperRef.current) return

    let containerWidth = wrapperRef.current.clientWidth
    let containerHeight = wrapperRef.current.clientHeight
    
    if (isModalFullscreen && typeof window !== 'undefined') {
      containerWidth = window.innerWidth
      containerHeight = window.innerHeight
    }

    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    if (containerHeight < vh * 0.5) {
      containerHeight = vh * 0.8
    }
    
    const aspectRatio = 0.707 
    const availableHeight = containerHeight - 120 
    let pageHeight = availableHeight * 0.95
    let pageWidth = pageHeight * aspectRatio

    if (pageWidth > containerWidth * 0.9) {
      pageWidth = containerWidth * 0.9
      pageHeight = pageWidth / aspectRatio
    }

    setDimensions({ width: Math.floor(pageWidth), height: Math.floor(pageHeight) })
  }, [isModalFullscreen])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsFullscreenTab(window.location.pathname === '/flipbook')
    }
  }, [])

  const toggleFullScreen = () => {
    setIsLoading(true)
    setIsModalFullscreen(true)
  }

  const closeFullScreen = () => {
    setIsLoading(true)
    setIsModalFullscreen(false)
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullScreen()
    }

    if (isModalFullscreen) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    } else {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }

    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isModalFullscreen])

  useEffect(() => {
    updateDimensions()
  }, [isModalFullscreen, updateDimensions])

  useEffect(() => {
    updateDimensions()
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
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

  useEffect(() => {
    let isMounted = true
    const loadPdfDocument = async () => {
      if (!pdfUrl) return
      try {
        setIsLoading(true)
        setError(null)
        if (pdfDocRef.current) {
          pdfDocRef.current.destroy()
          pdfDocRef.current = null
        }
        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
          rangeChunkSize: 65536,
          disableAutoFetch: true,
          disableStream: false,
        })
        const pdf = await loadingTask.promise
        if (isMounted) {
          pdfDocRef.current = pdf
          setTotalPages(pdf.numPages)
        }
      } catch (err: any) {
        console.error('Error loading PDF:', err)
        if (isMounted) {
          setError('Gagal memuat dokumen PDF.')
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

  const renderPage = useCallback(async (pageIndex: number) => {
    if (!pdfDocRef.current || !pagesRef.current[pageIndex]) return
    if (renderingRef.current.has(pageIndex)) return

    if (renderTasksRef.current.has(pageIndex)) {
      try { renderTasksRef.current.get(pageIndex).cancel() } catch (e) {}
      renderTasksRef.current.delete(pageIndex)
    }

    const pageWrapper = pagesRef.current[pageIndex]
    if (pageWrapper.querySelector('canvas')) return

    try {
      renderingRef.current.add(pageIndex)
      const page = await pdfDocRef.current.getPage(pageIndex + 1)
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const viewport = page.getViewport({ scale: 1.5 * pixelRatio }) 

      if (viewport.width === 0 || viewport.height === 0) return

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (context) {
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        const renderTask = page.render({ canvasContext: context, viewport })
        renderTasksRef.current.set(pageIndex, renderTask)
        await renderTask.promise
        if (!pageWrapper.querySelector('canvas')) {
          pageWrapper.innerHTML = ''
          pageWrapper.appendChild(canvas)
        }
      }
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') console.error(err)
    } finally {
      renderingRef.current.delete(pageIndex)
      renderTasksRef.current.delete(pageIndex)
    }
  }, [])

  const clearPage = useCallback((pageIndex: number) => {
    if (pagesRef.current[pageIndex]) pagesRef.current[pageIndex].innerHTML = ''
  }, [])

  const updateVisiblePages = useCallback(async (current: number) => {
    if (!pdfDocRef.current) return
    const total = pdfDocRef.current.numPages
    const RANGE = 2
    for (let i = Math.max(0, current - RANGE); i < Math.min(total, current + RANGE + 1); i++) {
      await renderPage(i)
    }
    const CLEANUP_RANGE = 4
    for (let i = 0; i < total; i++) {
      if (i < current - CLEANUP_RANGE || i > current + CLEANUP_RANGE) clearPage(i)
    }
  }, [renderPage, clearPage])

  useEffect(() => {
    if (!pdfDocRef.current || dimensions.width === 0 || !bookContainerRef.current) return
    let isEffectActive = true
    const initBook = async () => {
      try {
        await new Promise(resolve => requestAnimationFrame(resolve))
        if (!isEffectActive) return
        if (pageFlipRef.current) {
          try { pageFlipRef.current.destroy() } catch (e) {}
          pageFlipRef.current = null
        }
        const container = bookContainerRef.current
        if (!container) return
        container.innerHTML = ''
        pagesRef.current = []
        for (let i = 0; i < totalPages; i++) {
          const pageWrapper = document.createElement('div')
          pageWrapper.className = 'page' 
          pageWrapper.dataset.density = 'hard'
          pageWrapper.style.width = `${dimensions.width}px`
          pageWrapper.style.height = `${dimensions.height}px`
          container.appendChild(pageWrapper)
          pagesRef.current.push(pageWrapper)
        }
        if (!isEffectActive) return
        const pageFlip = new PageFlip(container, {
          width: dimensions.width,
          height: dimensions.height,
          size: 'fixed' as SizeType,
          maxShadowOpacity: 0.5,
          showCover: true,
          mobileScrollSupport: false,
          usePortrait: true,
          startPage: currentPage > 1 ? currentPage - 1 : 0,
          flippingTime: 400,
          clickEventForward: true,
          useMouseEvents: true,
          showPageCorners: true,
        })
        pageFlip.loadFromHTML(pagesRef.current)
        pageFlipRef.current = pageFlip
        pageFlip.on('flip', (e: any) => {
          const newIndex = e.data as number
          setCurrentPage(newIndex + 1)
          setInputPage((newIndex + 1).toString())
          updateVisiblePages(newIndex)
        })
        await updateVisiblePages(currentPage - 1)
        if (isEffectActive) setIsLoading(false)
      } catch (err) {
        console.error(err)
        if (isEffectActive) setIsLoading(false)
      }
    }
    initBook()
    return () => {
      isEffectActive = false
      if (pageFlipRef.current) {
        try { pageFlipRef.current.destroy() } catch (e) {}
        pageFlipRef.current = null
      }
      renderTasksRef.current.forEach(task => { try { task.cancel() } catch(e) {} })
      renderTasksRef.current.clear()
      pagesRef.current = []
    }
  }, [dimensions, totalPages, updateVisiblePages])

  const handleGoToPage = () => {
    const pageNum = parseInt(inputPage)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      if (pageFlipRef.current) {
        pageFlipRef.current.turnToPage(pageNum - 1)
        setCurrentPage(pageNum)
      }
    } else {
      setInputPage(currentPage.toString())
    }
  }

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>

  return (
    <div 
      ref={wrapperRef} 
      className={
         isModalFullscreen 
         ? "fixed inset-0 z-[9999] bg-black/60 flex flex-col items-center justify-center gap-6 p-4 backdrop-blur-sm"
         : `relative w-full min-h-[90vh] flex flex-col ${align === 'start' ? 'items-start' : align === 'end' ? 'items-end' : 'items-center'} justify-center gap-6 hide-scrollbar overflow-hidden pt-0 pb-8`
       }
    >
      {isModalFullscreen && (
        <button onClick={closeFullScreen} className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[10000] border border-white/20">
          <MdClose size={28} />
        </button>
      )}

      {!isFullscreenTab && !isModalFullscreen && !isLoading && (
        <button onClick={toggleFullScreen} className="absolute top-0 right-4 p-2 rounded-full bg-gray-800/60 text-white hover:bg-gray-800/80 transition z-20">
          <MdFullscreen size={24} />
        </button>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gray-50/50">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600 font-medium">Memuat buku...</p>
        </div>
      )}

      <div 
        key={isModalFullscreen ? 'modal' : 'normal'}
        className="book-wrapper relative"
        style={{
           width: dimensions.width,
           height: dimensions.height,
           opacity: isLoading ? 0 : 1, 
           transition: 'opacity 0.3s ease'
        }}
      >
        <div 
          ref={bookContainerRef} 
          className="book-container shadow-2xl" 
          style={{ 
            visibility: 'visible',
            margin: align === 'start' ? '0' : align === 'end' ? '0 0 0 auto' : '0 auto'
          }}
        />
      </div>

      {!isLoading && (
        <div className="z-10 bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="text-gray-700 font-medium text-sm">Halaman</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
              className="w-12 h-9 border border-gray-200 rounded-lg text-center font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <span className="text-gray-400 font-medium">/ {totalPages}</span>
          </div>
          <button onClick={handleGoToPage} className="px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all active:scale-95 shadow-md shadow-blue-500/20 flex items-center justify-center text-sm">
            Go
          </button>
        </div>
      )}
    </div>
  )
}

export default PageFlipBook
