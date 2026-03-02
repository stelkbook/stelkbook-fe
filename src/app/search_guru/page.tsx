"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar_Guru";
import BookCard from "@/components/BookCard";
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
  tags?: string;
  average_rating?: number;
}

const SearchGuruContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { books, error, fetchBooks } = useBook();

  const navigateToBook = (id: number) => {
    router.push(`search_guru/books?id=${id}`);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchBooks();
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
          path: `search_guru/books?id=${book.id}`,
          tags: book.tags || "",
          average_rating: book.average_rating,
        };
      });

      const results = processedBooks.filter(
        (book: any) =>
          book.judul.toLowerCase().includes(query) ||
          (book.kategori && book.kategori.toLowerCase().includes(query)) ||
          (book.subject && book.subject.toLowerCase().includes(query)) ||
          (book.penulis && book.penulis.toLowerCase().includes(query)) ||
          (book.tags && book.tags.toLowerCase().includes(query))
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
          <span className="text-blue-600 font-medium">"{query}"</span>
        </p>
      </div>

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-lg">
            {query
              ? "Tidak ada hasil ditemukan."
              : "Masukkan kata kunci pencarian."}
          </p>
        </div>
      )}
    </div>
  );
};

const SearchGuruPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center items-center bg-white">
        <div className="w-14 h-14 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4 text-lg">Memuat halaman...</p>
      </div>
    }>
      <SearchGuruContent />
    </Suspense>
  );
};

export default SearchGuruPage;
