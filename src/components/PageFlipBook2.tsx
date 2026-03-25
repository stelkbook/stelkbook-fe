'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { PageFlip, SizeType } from 'page-flip'
import * as pdfjs from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'
import './FlipBookStyle2.css'
import { MdFullscreen, MdClose } from 'react-icons/md'

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

  // ✅ NEW: DETEKSI MOBILE
  const [isMobile, setIsMobile] = useState(false)

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

    const pageFlip = new PageFlip(container, {
      width: dimensions.width,
      height: dimensions.height,
      size: 'fixed' as SizeType,

      // 🔥 CORE FEATURE
      usePortrait: isMobile, // mobile=1 page, desktop=2 page

      showCover: !isMobile,
      maxShadowOpacity: 0.5,
    })

    pageFlip.loadFromHTML(pagesRef.current)
    pageFlipRef.current = pageFlip

    pageFlip.on('flip', (e: any) => {
      const index = e.data
      setCurrentPage(index + 1)
      updateVisiblePages(index)
    })

    updateVisiblePages(0)
    setIsLoading(false)

  }, [dimensions, totalPages, isMobile])

  if (error) return <div>{error}</div>

  return (
    <div ref={wrapperRef} className="w-full flex flex-col items-center">
      {isLoading && <p>Loading...</p>}

      <div
        className="book-wrapper"
        style={{
          width: dimensions.width * (isMobile ? 1 : 2),
          height: dimensions.height,
        }}
      >
        <div ref={bookContainerRef} />
      </div>
    </div>
  )
}

export default PageFlipBook
