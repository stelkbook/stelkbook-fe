"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import WarningModalBuku from "./WarningModalKelas3";
import PageFlipBook from "@/components/PageFlipBook2";
import Navbar from "@/components/Navbar_Lainnya_Perpus";
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

const BookContent: React.FC = () => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = parseInt(searchParams.get("id") || "0", 10);

  const { fetchKelas3BookById, deleteBookKelas3, getBookPdfUrl } = useBook();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchKelas3BookById(bookId);
        setBook(data);
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId, fetchKelas3BookById, getBookPdfUrl]);

  const handleDeleteBook = async (id: number) => {
    try {
      await deleteBookKelas3(id);
      setShowWarningModal(false);
      console.log("Buku dihapus");
      router.push("/perpus_lainnya");
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
        <p className="text-xl font-semibold font-poppins">Studi Anda</p>
        <Image
          src="/assets/Kelas_X/Primary_Direct.png"
          alt=">"
          width={10}
          height={16}
          className="mx-1"
        />
        <p className="text-xl font-semibold font-poppins">{book.kategori}</p>
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
          </div>

          {/* Tombol Hapus & Edit */}
          <div className="mt-6 flex flex-col gap-2 w-full">
            <button
              className="bg-red text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-600 w-full"
              onClick={() => setShowWarningModal(true)}
            >
              Hapus Buku
            </button>
            <button
              className="bg-blue-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-600 w-full"
              onClick={() => router.push(`/kelasIII_perpus/buku3/Edit_Buku?id=${bookId}`)}
            >
              Edit Buku
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

      {showWarningModal && (
        <WarningModalBuku
          show={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          onConfirm={() => handleDeleteBook(bookId)}
        />
      )}
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
