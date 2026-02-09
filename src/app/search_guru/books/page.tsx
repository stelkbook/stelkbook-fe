"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar_Lainnya_Guru";
import PageFlipBook from "@/components/PageFlipBook2";
import { useBook } from "@/context/bookContext";
import { getStorageUrl } from '@/helpers/storage';


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
}

const BookContent = () => {
  const searchParams = useSearchParams();
  const bookId = parseInt(searchParams.get("id") || "0", 10);
  const { fetchBookById } = useBook();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBookById(bookId);
        setBook(data);
      } catch (error) {
        console.error("Gagal memuat data buku:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId, fetchBookById]);

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
  if (!book) return <div>Buku tidak ditemukan.</div>;

  const pdfUrl = getStorageUrl(book.isi);
  const coverUrl = getStorageUrl(book.cover);

  const handleDownload = () => {
    window.open(pdfUrl, "_blank");
  };
  

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Navbar */}
      <div className="mb-8">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="pt-20 px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center">
          <p className="text-xl font-semibold font-poppins">Studi Anda</p>
          <Image src="/assets/Kelas_X/Primary_Direct.png" alt=">" width={10} height={16} className="mx-2" />
          <p className="text-xl font-semibold font-poppins">{book.kategori}</p>
          <Image src="/assets/Kelas_X/Primary_Direct.png" alt=">" width={10} height={16} className="mx-2" />
          <p className="text-xl font-semibold font-poppins">{book.judul}</p>
        </div>

        {/* Book Info + Flipbook */}
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* Book Info */}
          <div className="flex flex-col items-center lg:items-start">
            {/* Cover */}
            <Image
              src={coverUrl}
              alt="Cover Buku"
              width={200}
              height={280}
              className="rounded-lg shadow-md mb-6"
              onError={(e) => {
                e.currentTarget.src = "/assets/default-cover.png";
              }}
            />

            {/* Metadata */}
            <div className="text-center lg:text-left">
              <h2 className="text-lg font-bold">{book.judul}</h2>
              <ul className="mt-2 text-sm space-y-1">
                <li><strong>Penerbit:</strong> {book.penerbit}</li>
                <li><strong>Penulis:</strong> {book.penulis}</li>
                <li><strong>Tahun:</strong> {book.tahun}</li>
                <li><strong>ISBN:</strong> {book.ISBN}</li>
              </ul>
              <button
    onClick={handleDownload}
    className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
  >
    Unduh Buku
  </button>
            </div>
          </div>

          {/* Kanan */}
          <div className="flex-grow overflow-x-auto w-full">
            {pdfUrl ? (
              <PageFlipBook pdfUrl={pdfUrl} align="start" />
            ) : (
              <p className="text-gray-500">Memuat buku...</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const Page = () => {
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
