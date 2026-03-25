"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar_Lainnya";
import PageFlipBook from "@/components/PageFlipBook2";
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

const BukuNAContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = parseInt(searchParams.get("id") || "0", 10);
  const { fetchNonAkademikBookById } = useBook();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const handleRouteNavigation = () => {
    router.push("/lainnya");
  };

  const handleScrollToFlipBook = () => {
    const flipBook = document.getElementById("flipbook");
    flipBook?.scrollIntoView({ behavior: "smooth" });
  };

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

  // ✅ Sama seperti kode kedua, cek apakah isi sudah berupa URL penuh
  const pdfUrl = book.isi.startsWith("http")
    ? book.isi
    : getStorageUrl(book.isi);
  const coverUrl = book.cover.startsWith("http")
    ? book.cover
    : getStorageUrl(book.cover);

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
        <p
          className="text-xl font-semibold font-poppins cursor-pointer hover:underline"
          onClick={() => router.push("/homepage")}
        >
          Studi Anda
        </p>
        <Image
          src="/assets/Kelas_X/Primary_Direct.png"
          alt=">"
          width={10}
          height={16}
          className="mx-1"
        />
        <p
          className="text-xl font-semibold font-poppins cursor-pointer hover:underline"
          onClick={handleRouteNavigation}
        >
          {book.kategori}
        </p>
        <Image
          src="/assets/Kelas_X/Primary_Direct.png"
          alt=">"
          width={10}
          height={16}
          className="mx-1"
        />
        <p className="text-xl font-semibold font-poppins">{book.judul}</p>
      </div>

      {/* Konten Buku */}
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Kiri */}
        <div className="flex flex-col items-center lg:items-start">
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

          <div className="text-center lg:text-left">
            <h2 className="text-lg font-bold">{book.judul}</h2>
            <ul className="mt-2 text-sm space-y-1">
              <li>
                <strong>Penerbit:</strong> {book.penerbit}
              </li>
              <li>
                <strong>Penulis:</strong> {book.penulis}
              </li>
              <li>
                <strong>Tahun:</strong> {book.tahun}
              </li>
              <li>
                <strong>ISBN:</strong> {book.ISBN}
              </li>
            </ul>

            <div className="mt-6 w-full max-w-xs">
              <BookRating 
                bookId={book.id}
                initialAverageRating={book.average_rating}
                initialTotalRatings={book.total_ratings}
              />
            </div>

            <div className="mt-4 space-y-2 w-full max-w-xs">
              <button
                onClick={handleRouteNavigation}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Kembali
              </button>
              <button
                onClick={handleScrollToFlipBook}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 lg:hidden"
              >
                Read Now
              </button>
            </div>
          </div>
        </div>

        {/* Kanan */}
        <div id="flipbook" className="flex-grow overflow-x-auto w-full">
          {pdfUrl ? (
            <PageFlipBook pdfUrl={pdfUrl} align="center" />
          ) : (
            <p className="text-gray-500">Memuat buku...</p>
          )}
        </div>
      </div>
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
      <BukuNAContent />
    </Suspense>
  );
}
