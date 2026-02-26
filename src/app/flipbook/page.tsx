'use client'
import React, { useEffect, useState } from 'react'
import PageFlipBook from '@/components/PageFlipBook2'
import { ArrowLeft, Maximize2, Minimize2, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

const FlipBookPage: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [bookTitle, setBookTitle] = useState<string>('Buku Digital')
  const [bookAuthor, setBookAuthor] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    // Ambil data dari localStorage
    const url = localStorage.getItem('pdfUrl')
    const title = localStorage.getItem('bookTitle')
    const author = localStorage.getItem('bookAuthor')
    
    if (url) {
      setPdfUrl(url)
      if (title) setBookTitle(title)
      if (author) setBookAuthor(author)
    } else {
      console.error('No PDF URL found')
    }
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const goBack = () => {
    router.back()
  }

  if (!pdfUrl) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-700 font-semibold text-lg">Memuat buku...</p>
          <p className="text-sm text-gray-400 text-center">
            Mohon tunggu sebentar<br />sedang menyiapkan halaman
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden relative">
      {/* Header dengan kontrol */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm md:text-base font-semibold text-slate-800 truncate max-w-[200px] md:max-w-md">
                  {bookTitle}
                </h1>
                {bookAuthor && (
                  <p className="text-xs text-slate-500 truncate max-w-[200px] md:max-w-md">
                    {bookAuthor}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label={isFullscreen ? "Keluar fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-slate-600" />
              ) : (
                <Maximize2 className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Container untuk buku dengan background yang lebih menarik */}
      <div className="w-full h-full pt-20 md:pt-24">
        <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
          {/* Efek dekoratif di belakang buku */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-pink-100/30 blur-3xl rounded-full"></div>
            <div className="absolute top-20 left-20 w-64 h-64 bg-blue-100/20 blur-3xl rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-100/20 blur-3xl rounded-full"></div>
          </div>
          
          {/* Container buku dengan shadow dan efek */}
          <div className="relative z-10 transform transition-transform duration-300 hover:scale-[1.02]">
            <PageFlipBook pdfUrl={pdfUrl} />
          </div>
        </div>
      </div>

      {/* Footer dengan informasi */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-sm border-t border-slate-200">
        <div className="flex items-center justify-between px-4 md:px-6 py-2">
          <p className="text-xs md:text-sm text-slate-500">
            📖 Gunakan mouse atau sentuh untuk membalik halaman
          </p>
          <p className="text-xs md:text-sm text-slate-400">
            PageFlip v2.0
          </p>
        </div>
      </div>
    </div>
  )
}

export default FlipBookPage