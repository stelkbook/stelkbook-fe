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

  const { fetchKelas7BookById, deleteBookKelas7, getBookPdfUrl } = useBook();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchKelas7BookById(bookId);
        setBook(data);
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId, fetchKelas7BookById, getBookPdfUrl]);

  const handleDeleteBook = async (id: number) => {
    try {
      await deleteBookKelas7(id);
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
            src={getStorageUrl(book.cover)}
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

          {/* Tombol */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() =>
                router.push(`/kelasVII_perpus/buku7/Edit_Buku?id=${book.id}`)
              }
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 flex items-center gap-2"
            >
              <Image
                src="/assets/icon/edit.svg"
                alt="Edit Icon"
                width={16}
                height={16}
                style={{ width: "auto", height: "auto" }}
              />
              <span>Edit Buku</span>
            </button>

            <button
              onClick={() => setShowWarningModal(true)}
              className="bg-red text-white px-4 py-2 rounded-lg shadow-md hover:bg-red flex items-center gap-2"
            >
              <div style={{ position: "relative", width: 16, height: 16 }}>
                <Image
                  src="/assets/Admin/Delete_user.png"
                  alt="Delete Icon"
                  fill
                  sizes="16px"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <span>Hapus Buku</span>
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
          <p className="text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    }>
      <BookContent />
    </Suspense>
  );
};

export default Page;
