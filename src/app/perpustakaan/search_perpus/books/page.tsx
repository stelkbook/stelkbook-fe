"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import WarningModalBuku from "./WarningModalBuku3";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar_Lainnya_Perpus";
import { useBook } from "@/context/bookContext";
import { getStorageUrl } from '@/helpers/storage';
import BookRating from "@/components/BookRating";

const PageFlipBook = dynamic(() => import("@/components/PageFlipBook2"), {
  ssr: false,
  loading: () => <p className="text-gray-500">Memuat viewer...</p>
});


interface Book {
  id: number;
  judul: string;
  penerbit: string;
  penulis: string;
  tahun: string;
  kategori: string;
  ISBN: string;
  isi: string;
  cover: string;
  average_rating?: number;
  total_ratings?: number;
}

const BookContent: React.FC = () => {
  const handleScrollToFlipBook = () => {
    const flipBook = document.getElementById("flipbook");
    flipBook?.scrollIntoView({ behavior: "smooth" });
  };

  const [showWarningModal, setShowWarningModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = parseInt(searchParams.get("id") || "0", 10);

  const { fetchBookById, deleteBook, getBookPdfUrl } = useBook(); // ✅ Ambil fungsi getBookPdfUrl
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const data = await fetchBookById(bookId, controller.signal);
        setBook(data);

        // ✅ Ambil PDF URL dari context
      } catch (error: any) {
        if (error.name !== 'CanceledError') {
          console.error("Error fetching book or PDF URL:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [bookId, fetchBookById, getBookPdfUrl]);

  const handleDeleteBook = async (id: number) => {
    try {
      await deleteBook(id);
      setShowWarningModal(false);
      console.log("Buku dihapus");
      router.push("/perpustakaan");
    } catch (error) {
      console.error("Gagal menghapus buku:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat buku...</p>
        </div>
      </div>
    );
  }
  
  if (!book) return null;

  // Updated PDF URL logic from code 2
  const pdfUrl = book.isi.startsWith('http') ? book.isi : getStorageUrl(book.isi);

  return (
    <div className="h-screen p-8 bg-gray-50 overflow-y-auto">
      {/* Navbar */}
      <header className="flex justify-between items-center mb-4">
        <div className="pt-12 px-8">
          <Navbar />
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mb-8 flex items-center">
        <p className="text-xl font-semibold font-poppins">Studi Anda</p>
        <Image src="/assets/Kelas_X/Primary_Direct.png" alt=">" width={10} height={16} className="mx-1" />
        <p className="text-xl font-semibold font-poppins">{book.kategori}</p>
        <Image src="/assets/Kelas_X/Primary_Direct.png" alt=">" width={10} height={16} className="mx-1" />
        <p className="text-xl font-semibold font-poppins">{book.judul}</p>
      </div>

      {/* Konten Buku */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Kiri */}
        <div className="flex flex-col items-center lg:items-start">
          <Image
            src={getStorageUrl(book.cover)}
            alt="Cover Buku"
            width={200}
            height={280}
            className="rounded-lg shadow-md mb-6"
            priority={true}
            style={{width:'auto', height:'auto'}}
            onError={(e) => {
              e.currentTarget.src = "/assets/default-cover.png";
            }}
          />

          <div className="text-center lg:text-left">
            <h2 className="text-lg font-bold">{book.judul}</h2>
            <ul className="mt-2 text-sm space-y-1">
              <li><strong>Penerbit:</strong> {book.penerbit}</li>
              <li><strong>Penulis:</strong> {book.penulis}</li>
              <li><strong>Tahun:</strong> {book.tahun}</li>
              <li><strong>ISBN:</strong> {book.ISBN}</li>
            </ul>
            
            {/* Read Now Button (Mobile Only) */}
            <button
              onClick={handleScrollToFlipBook}
              className="mt-6 w-full bg-green-500 text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-600 transition-all lg:hidden flex items-center justify-center gap-2"
            >
              <span>📖</span> Baca Sekarang
            </button>
        
{/* Book Rating Feature */}
            <div className="mt-8 w-full max-w-md hidden lg:block origin-top-left lg:scale-90">
              <BookRating 
                bookId={book.id} 
                initialAverageRating={book.average_rating || 0}
                initialTotalRatings={book.total_ratings || 0}
                variant="default"
                isReadOnly={false} 
              />
            </div>
          </div>

          {/* Tombol */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => router.push(`/search_perpus/books/Edit_Buku?id=${book.id}`)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 flex items-center gap-2"
            >
              <Image src="/assets/icon/edit.svg" alt="Edit Icon" width={16} height={16} style={{width:'auto',height: "auto" }}/>
              <span>Edit Buku</span>
            </button>

            <button
              onClick={() => setShowWarningModal(true)}
              className="bg-red text-white px-4 py-2 rounded-lg shadow-md hover:bg-red flex items-center gap-2"
            >
              <div style={{ position: 'relative', width: 16, height: 16 }}>
                <Image 
                  src="/assets/Admin/Delete_user.png" 
                  alt="Delete Icon" 
                  fill 
                  sizes="16px"
                  style={{ objectFit: 'contain' }} 
                />
              </div>
              <span>Hapus Buku</span>
            </button>
          </div>
        </div>

        {/* Kanan */}
        <div id="flipbook" className="flex-grow w-full z-0 min-h-[500px] lg:min-h-[600px]">
          {pdfUrl ? (
            <PageFlipBook pdfUrl={pdfUrl} align="start" />
          ) : (
            <p className="text-gray-500">Memuat buku...</p>
          )}
        

            <div className="mt-8 w-full max-w-md lg:hidden">
              <BookRating 
                bookId={book.id} 
                initialAverageRating={book.average_rating || 0}
                initialTotalRatings={book.total_ratings || 0}
                variant="default"
                isReadOnly={false} 
              />
            </div>
</div>
      </div>

      {/* Modal */}
      {showWarningModal && (
        <WarningModalBuku
          isVisible={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          book={book}
        />
      )}
    </div>
  );
};

const Page: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat buku...</p>
        </div>
      </div>
    }>
      <BookContent />
    </Suspense>
  );
};

export default Page;
