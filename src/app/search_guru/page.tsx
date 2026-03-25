"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar_Guru";
import { useBook } from "@/context/bookContext";
import { getStorageUrl } from "@/helpers/storage";
import BookCard from "@/components/BookCard";


interface Book {
  id: number;
  judul: string;
  cover: string;
  subject?: string;
  penulis?: string;
  kategori?: string;
  path?: string;
  average_rating?: number;
  total_ratings?: number;
}

const SearchGuruContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    books,
    perpusBooks,
    nonAkademikBooks,
    error,
    fetchBooks,
    fetchPerpusBooks,
    fetchNonAkademikBooks,
  } = useBook();

  const navigateToBook = (id: number) => {
    router.push(`search_guru/books?id=${id}`);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchBooks(),
          fetchPerpusBooks?.(),
          fetchNonAkademikBooks?.(),
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchBooks, fetchPerpusBooks, fetchNonAkademikBooks]);

  useEffect(() => {
    const allCollections = [
      ...(books || []),
      ...(perpusBooks || []),
      ...(nonAkademikBooks || []),
    ];

    const uniqueBooksMap = new Map<number, any>();
    allCollections.forEach((book: any) => {
      if (book && typeof book.id === "number" && !uniqueBooksMap.has(book.id)) {
        uniqueBooksMap.set(book.id, book);
      }
    });

    const allBooks = Array.from(uniqueBooksMap.values());

    if (query && allBooks.length > 0) {
      const processedBooks = allBooks.map((book: any) => {
        const rawCover =
          book.cover || book.cover_image || book.thumbnail || "";
        const coverUrl = rawCover
          ? rawCover.startsWith("http")
            ? rawCover
            : getStorageUrl(rawCover)
          : "/assets/default-cover.png";

        return {
          id: book.id,
          judul: book.judul,
          cover: coverUrl,
          subject: book.subject || "",
          penulis: book.penulis || "Unknown Author",
          kategori: book.kategori || "",
          path: `search_guru/books?id=${book.id}`,
          average_rating: book.average_rating ?? 0,
          total_ratings: book.total_ratings ?? 0,
        };
      });

      const results = processedBooks.filter((book: any) => {
        const lowerTitle = book.judul.toLowerCase();
        const lowerKategori = book.kategori?.toLowerCase() || "";
        const lowerSubject = book.subject?.toLowerCase() || "";
        const lowerPenulis = book.penulis?.toLowerCase() || "";

        return (
          lowerTitle.includes(query) ||
          lowerKategori.includes(query) ||
          lowerSubject.includes(query) ||
          lowerPenulis.includes(query)
        );
      });

      setFilteredBooks(results);
    } else {
      setFilteredBooks([]);
    }
  }, [query, books, perpusBooks, nonAkademikBooks]);

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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => navigateToBook(book.id)}
            />
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
