'use client'
import React, { useEffect, useState } from 'react'
import PageFlipBook from '@/components/PageFlipBook2'

const FlipBookPage: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = localStorage.getItem('pdfUrl')
    if (url) {
      setPdfUrl(url)
    } else {
      console.error('No PDF URL found')
    }
  }, [])

  if (!pdfUrl) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center">
       <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat buku...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center overflow-y-auto">
      <PageFlipBook pdfUrl={pdfUrl} />
    </div>
  )
}

export default FlipBookPage
