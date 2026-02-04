"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useBook } from "@/context/bookContext";
import { getStorageUrl } from '@/helpers/storage';


interface Book {
  id: number;
  judul: string;
  cover: string;
  subject?: string;
  penulis?: string;
  kategori?: string;
  path?: string;
}

const SearchPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true); // ✅ Tambah loading state

  const { books, error, fetchBooks } = useBook();

  const navigateToBook = (id: number) => {
    router.push(`search/books?id=${id}`);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchBooks(); // Tunggu ambil data
      setIsLoading(false);
    };
    loadData();
  }, [fetchBooks]);

  useEffect(() => {
    if (query && books.length > 0) {
      const processedBooks = books.map((book: any) => {
        const coverUrl = book.cover
          ? getStorageUrl(book.cover)
          : "/assets/default-cover.png";

        return {
          id: book.id,
          judul: book.judul,
          cover: coverUrl,
          subject: book.subject || "",
          penulis: book.penulis || "Unknown Author",
          kategori: book.kategori || "",
          path: `search/books?id=${book.id}`,
        };
      });

      const results = processedBooks.filter(
        (book: any) =>
          book.judul.toLowerCase().includes(query) ||
          (book.kategori && book.kategori.toLowerCase().includes(query)) ||
          (book.subject && book.subject.toLowerCase().includes(query)) ||
          (book.penulis && book.penulis.toLowerCase().includes(query))
      );

      setFilteredBooks(results);
    } else {
      setFilteredBooks([]);
    }
  }, [query, books]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white">
        <div className="w-14 h-14 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4 text-lg">Memuat buku...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="pt-28 px-6 md:px-16 lg:px-32 min-h-screen bg-white">
      <Navbar />
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Kami memiliki {filteredBooks.length} buku untukmu
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Menampilkan buku untuk:{" "}
          <span className="font-semibold text-gray-800">"{query}"</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <div
              key={book.id}
              className="cursor-pointer group relative flex flex-col items-center text-center"
              onClick={() => navigateToBook(book.id)}
            >
              <div className="w-full aspect-[3/4] overflow-hidden rounded-lg shadow-md bg-gray-200">
                <Image
                  src={book.cover}
                  alt={book.judul}
                  width={150}
                  height={220}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-800 line-clamp-2">
                {book.judul}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{book.penulis}</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-gray-500 text-lg">
              Tidak ada buku yang cocok dengan pencarian Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center items-center bg-white">
        <div className="w-14 h-14 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4 text-lg">Memuat buku...</p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
