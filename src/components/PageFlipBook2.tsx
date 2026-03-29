'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { PageFlip, SizeType } from 'page-flip'
import * as pdfjs from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'
import './FlipBookStyle2.css'
import { Maximize, Minimize, Grid as GridIcon, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Sun, Coffee, Moon, Bookmark, X } from 'lucide-react'

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

  const [zoom, setZoom] = useState(1);
  const [theme, setTheme] = useState('light');
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [hasBookmark, setHasBookmark] = useState(false);

  // ✅ NEW: DETEKSI MOBILE
  const [isMobile, setIsMobile] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        wrapperRef.current?.requestFullscreen().catch((err) => console.log(err));
    } else {
        document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsModalFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ✅ DIMENSIONS SUPPORT 2 PAGE
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

    let pageWidth, pageHeight
    const availableHeight = containerHeight - 120

    pageHeight = availableHeight * 0.95
    pageWidth = pageHeight * aspectRatio

    if (isMobile) {
      // 📱 1 halaman
      if (pageWidth > containerWidth * 0.9) {
        pageWidth = containerWidth * 0.9
        pageHeight = pageWidth / aspectRatio
      }
    } else {
      // 💻 2 halaman
      if (pageWidth * 2 > containerWidth * 0.95) {
        pageWidth = (containerWidth * 0.95) / 2
        pageHeight = pageWidth / aspectRatio
      }
    }

    setDimensions({
      width: Math.floor(pageWidth),
      height: Math.floor(pageHeight),
    })
  }, [isModalFullscreen, isMobile])

  useEffect(() => {
    updateDimensions()
  }, [isModalFullscreen, isMobile, updateDimensions])

  useEffect(() => {
    updateDimensions()
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
      resizeTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(updateDimensions)
      }, 200)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateDimensions])

  // LOAD PDF
  useEffect(() => {
    let isMounted = true

    const loadPdf = async () => {
      try {
        setIsLoading(true)
        const loadingTask = pdfjs.getDocument(pdfUrl)
        const pdf = await loadingTask.promise

        if (isMounted) {
          pdfDocRef.current = pdf
          setTotalPages(pdf.numPages)
        }
      } catch (err: any) {
        setError('Gagal memuat PDF')
        setIsLoading(false)
      }
    }

    loadPdf()

    return () => {
      isMounted = false
      pdfDocRef.current?.destroy()
    }
  }, [pdfUrl])

  // RENDER PAGE
  const renderPage = useCallback(async (index: number) => {
    if (!pdfDocRef.current || !pagesRef.current[index]) return

    const page = await pdfDocRef.current.getPage(index + 1)
    const viewport = page.getViewport({ scale: 2 })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.style.width = '100%'
    canvas.style.height = '100%'

    await page.render({ canvasContext: ctx, viewport }).promise

    const wrapper = pagesRef.current[index]
    wrapper.innerHTML = ''
    wrapper.appendChild(canvas)
  }, [])

  const updateVisiblePages = useCallback(async (current: number) => {
    for (let i = current - 2; i <= current + 2; i++) {
      if (i >= 0 && i < totalPages) {
        renderPage(i)
      }
    }
  }, [renderPage, totalPages])

  // INIT FLIPBOOK
  useEffect(() => {
    if (!pdfDocRef.current || dimensions.width === 0) return

    if (pageFlipRef.current) {
      pageFlipRef.current.destroy()
    }

    const container = bookContainerRef.current
    if (!container) return

    container.innerHTML = ''
    pagesRef.current = []

    for (let i = 0; i < totalPages; i++) {
      const div = document.createElement('div')
      div.className = 'page'
      div.style.width = `${dimensions.width}px`
      div.style.height = `${dimensions.height}px`
      container.appendChild(div)
      pagesRef.current.push(div)
    }

    const startIndex = Math.max(0, currentPage - 1);
    
    const pageFlip = new PageFlip(container, {
      width: dimensions.width,
      height: dimensions.height,
      size: 'fixed' as SizeType,
      usePortrait: isMobile, // mobile=1 page, desktop=2 page
      showCover: !isMobile,
      maxShadowOpacity: 0.5,
      startPage: startIndex, // 🔥 RESTORE PAGE
    })

    pageFlip.loadFromHTML(pagesRef.current)
    pageFlipRef.current = pageFlip

    pageFlip.on('flip', (e: any) => {
      const index = e.data
      setCurrentPage(index + 1)
      updateVisiblePages(index)
    })

    updateVisiblePages(startIndex) // 🔥 FIXED RENDER OFFSET
    setIsLoading(false)

  }, [dimensions, totalPages, isMobile])

  const handlePrev = () => pageFlipRef.current?.flipPrev();
  const handleNext = () => pageFlipRef.current?.flipNext();

  const getThemeClasses = () => {
      if (theme === 'sepia') return 'bg-amber-50 text-amber-900';
      if (theme === 'dark') return 'bg-gray-900 text-gray-100';
      return 'bg-gray-100 text-gray-900';
  };

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-md m-4">{error}</div>

  return (
    <div ref={wrapperRef} className={`w-full flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 ${isModalFullscreen ? getThemeClasses() : ''} ${isModalFullscreen ? 'h-screen' : 'min-h-[500px]'}`}>
      
      {/* Absolute Fullscreen Button when NOT in fullscreen mode */}
      {!isModalFullscreen && (
         <button onClick={toggleFullscreen} className="absolute top-2 right-2 md:top-4 md:right-4 z-40 p-2 bg-white/80 hover:bg-white shadow-md rounded-full text-gray-700 transition-all hover:scale-105" title="Buka Fullscreen">
             <Maximize size={24} />
         </button>
      )}

      {/* Thumbnails Sidebar */}
      {showThumbnails && isModalFullscreen && (
          <div className="absolute top-0 left-0 h-full w-64 bg-white/95 backdrop-blur shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800">Pages ({totalPages})</h3>
                  <button onClick={() => setShowThumbnails(false)} className="text-gray-500 hover:text-red-500"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
                  {Array.from({length: totalPages}).map((_, i) => (
                      <div key={i} onClick={() => { pageFlipRef.current?.turnToPage(i); setShowThumbnails(false); }} className="cursor-pointer flex flex-col items-center group">
                          <div className={`w-full aspect-[1/1.4] border rounded-md mb-2 flex items-center justify-center transition-all ${currentPage === i + 1 ? 'border-blue-500 shadow-md bg-blue-50 text-blue-600' : 'border-gray-300 bg-gray-100/50 text-gray-400 group-hover:border-gray-400'}`}>
                              <span className="text-xs font-semibold">{i + 1}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {isLoading && <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm"><div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div><p className="font-medium text-gray-600">Memuat Buku...</p></div>}

      <div
        className="book-wrapper transition-transform duration-300 relative z-10"
        style={{
          width: dimensions.width * (isMobile ? 1 : 2),
          height: dimensions.height,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        <div ref={bookContainerRef} />
      </div>

      {/* Full Toolbar when IN fullscreen mode */}
      {isModalFullscreen && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl rounded-full px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-4 z-40 border border-gray-100">
              {/* Pagination control */}
              <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-full text-gray-700 transition-colors hidden sm:block"><ChevronLeft size={20}/></button>
              <button onClick={() => setShowThumbnails(!showThumbnails)} className={`p-2 rounded-full transition-colors ${showThumbnails ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`} title="Thumbnails"><GridIcon size={20}/></button>
              <span className="text-sm font-semibold w-16 text-center text-gray-800">{currentPage} / {totalPages}</span>
              <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-full text-gray-700 transition-colors hidden sm:block"><ChevronRight size={20}/></button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              {/* Zoom control */}
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 hover:bg-gray-100 rounded-full text-gray-700 transition-colors hidden sm:block"><ZoomOut size={18}/></button>
              <span className="text-xs font-bold w-12 text-center text-gray-800">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-2 hover:bg-gray-100 rounded-full text-gray-700 transition-colors hidden sm:block"><ZoomIn size={18}/></button>

              <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>

              {/* Theme switch */}
              <div className="hidden md:flex items-center gap-1">
                  <button onClick={() => setTheme('light')} className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-500'}`} title="Mode Terang"><Sun size={18}/></button>
                  <button onClick={() => setTheme('sepia')} className={`p-2 rounded-full transition-colors ${theme === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636]' : 'hover:bg-gray-100 text-gray-500'}`} title="Mode Hangat (Sepia)"><Coffee size={18}/></button>
                  <button onClick={() => setTheme('dark')} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-500'}`} title="Mode Gelap"><Moon size={18}/></button>
              </div>

              <div className="w-px h-6 bg-gray-300 mx-1 hidden md:block"></div>

              {/* Extras */}
              <button onClick={() => setHasBookmark(!hasBookmark)} className={`p-2 rounded-full transition-colors ${hasBookmark ? 'text-blue-600 bg-blue-50' : 'hover:bg-gray-100 text-gray-500'}`} title="Tandai">
                  <Bookmark size={20} fill={hasBookmark ? "currentColor" : "none"} />
              </button>
              <button onClick={toggleFullscreen} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-700 transition-colors" title="Keluar Fullscreen">
                  <Minimize size={20}/>
              </button>
          </div>
      )}
    </div>
  )
}

export default PageFlipBook
