"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar_Lainnya_Guru"; // ✅ Navbar khusus Guru
import PageFlipBook from "../PageFlipBook2";
import BookRating from "@/components/BookRating";
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
  average_rating?: number;
  total_ratings?: number;
}

const BookContent: React.FC = () => {
  const searchParams = useSearchParams();
  const bookId = parseInt(searchParams.get("id") || "0", 10);
  const { fetchNonAkademikBookById} = useBook(); // ✅ versi Guru

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchNonAkademikBookById(bookId);
        setBook(data);
      } catch (error) {
        console.error("Gagal memuat data buku:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId, fetchNonAkademikBookById]);

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

  // ✅ Samakan logika URL seperti kode kedua
  const pdfUrl = book.isi.startsWith("http")
    ? book.isi
    : getStorageUrl(book.isi);
  const coverUrl = book.cover.startsWith("http")
    ? book.cover
    : getStorageUrl(book.cover);

  // ✅ fungsi download
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
          <div className="mx-2">
            <Image
              src="/assets/Kelas_X/Primary_Direct.png"
              alt=">"
              width={10}
              height={16}
            />
          </div>
          <p className="text-xl font-semibold font-poppins">{book.kategori}</p>
          <div className="mx-2">
            <Image
              src="/assets/Kelas_X/Primary_Direct.png"
              alt=">"
              width={10}
              height={16}
            />
          </div>
          <p className="text-xl font-semibold font-poppins">{book.judul}</p>
        </div>

        {/* Konten Buku */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sisi Kiri: Cover & Metadata */}
          <div className="flex flex-col items-center lg:items-start w-full lg:w-1/4">
            <Image
              src={coverUrl}
              alt="Cover Buku"
              width={200}
              height={280}
              className="rounded-lg shadow-md mb-6"
              priority={true}
              style={{ width: "auto", height: "auto" }}
              onError={(e) => {
                e.currentTarget.src = "/assets/default-cover.png";
              }}
            />

            <div className="text-center lg:text-left w-full">
              <h2 className="text-xl font-bold mb-4">{book.judul}</h2>
              <ul className="mt-2 text-sm space-y-2 text-gray-700">
                <li>
                  <strong className="text-black">Penerbit:</strong> {book.penerbit}
                </li>
                <li>
                  <strong className="text-black">Penulis:</strong> {book.penulis}
                </li>
                <li>
                  <strong className="text-black">Tahun:</strong> {book.tahun}
                </li>
                <li>
                  <strong className="text-black">ISBN:</strong> {book.ISBN}
                </li>
              </ul>

              <button
                onClick={handleDownload}
                className="mt-6 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm mb-6"
              >
                Unduh Buku
              </button>

              <div className="mt-2">
                <BookRating 
                  bookId={book.id}
                  initialAverageRating={book.average_rating}
                  initialTotalRatings={book.total_ratings}
                  isReadOnly={false}
                />
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Flipbook */}
          <div className="w-full lg:w-3/4 flex justify-center">
            {pdfUrl ? (
              <PageFlipBook pdfUrl={pdfUrl} align="center" />
            ) : (
              <div className="flex items-center justify-center h-[600px] w-full bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">Memuat penampil buku...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default function Page() {
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
}
