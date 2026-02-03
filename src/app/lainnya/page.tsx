'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useBook } from '@/context/bookContext';
import useAuthMiddleware from '@/hooks/auth';
import { useAuth } from '@/context/authContext';
import Pagination from '@/components/Pagination';
import SortFilter, { SortOption } from '@/components/SortFilter';
import FilterCheckbox, { FilterState } from '@/components/FilterCheckbox';
import { getStorageUrl } from '@/helpers/storage';


interface Book {
  id: number;
  judul: string;
  cover: string;
  path?: string;
  kategori?: string;
  kelas?: string;
  mapel?: string;
  penerbit?: string;
  penulis?: string;
}

const BookCard = ({ book }: { book: Book }) => {
  const router = useRouter();

  return (
    <div
      className="text-center cursor-pointer hover:bg-gray-100 p-4 rounded-lg transition-colors flex flex-col items-center"
      onClick={() => book.path && router.push(book.path)}
    >
      <div className="w-[150px] h-[200px] relative mx-auto">
        <Image
           src={book.cover}
           alt={book.judul}
           fill
           sizes="300px"
           className="rounded-md object-cover"
           priority
           onError={(e) => {
             const target = e.target as HTMLImageElement;
             target.src = '/assets/default-cover.png';
           }}
         />
      </div>
      <p className="mt-2 text-sm font-poppins font-semibold line-clamp-2">
        {book.judul}
      </p>
    </div>
  );
};

function LainnyaContent() {
  useAuthMiddleware();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { nonAkademikBooks, nonAkademikPagination, loading, error, fetchNonAkademikBooks } = useBook();
  const [displayBooks, setDisplayBooks] = useState<Book[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    kelas: [],
    mapel: [],
    penerbit: [],
    penulis: []
  });

  const currentPage = Number(searchParams.get('page')) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/lainnya?${params.toString()}`);
  };

  useEffect(() => {
    fetchNonAkademikBooks(currentPage);
  }, [fetchNonAkademikBooks, currentPage]);

  useEffect(() => {
    // Add keyboard listener for arrow keys
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentPage > 1) handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight') {
        if (nonAkademikPagination && currentPage < nonAkademikPagination.lastPage) {
          handlePageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, nonAkademikPagination]);

  useEffect(() => {
    if (!nonAkademikBooks) return;

    const filteredBooks = nonAkademikBooks.filter((book: any) => {
      const bookClass = book.kelas || book.kategori;
      const matchesClass = activeFilters.kelas.length === 0 || (bookClass && activeFilters.kelas.includes(bookClass));
      const matchesSubject = activeFilters.mapel.length === 0 || (book.mapel && activeFilters.mapel.includes(book.mapel));
      const matchesPublisher = activeFilters.penerbit.length === 0 || (book.penerbit && activeFilters.penerbit.includes(book.penerbit));
      const matchesAuthor = activeFilters.penulis.length === 0 || (book.penulis && activeFilters.penulis.includes(book.penulis));
      return matchesClass && matchesSubject && matchesPublisher && matchesAuthor;
    });

    const processedBooks = filteredBooks.map((book: any) => {
      const coverUrl = book.cover 
        ? getStorageUrl(book.cover) 
        : '/assets/default-cover.png';
      
      return {
        id: book.id,
        judul: book.judul,
        cover: coverUrl,
        path: `/lainnya/Buku_NA?id=${book.id}`,
        kategori: book.kategori,
        kelas: book.kelas || book.kategori,
        mapel: book.mapel,
        penerbit: book.penerbit,
        penulis: book.penulis
      };
    });

    if (sortOption === 'asc') {
      processedBooks.sort((a: Book, b: Book) => a.judul.localeCompare(b.judul));
    } else if (sortOption === 'desc') {
      processedBooks.sort((a: Book, b: Book) => b.judul.localeCompare(a.judul));
    }

    setDisplayBooks(processedBooks);
  }, [nonAkademikBooks, sortOption, activeFilters]);

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="pt-24 px-8 flex-grow flex flex-col pb-8">
        <div className="mb-6 flex justify-between items-center relative">
          <h1 className="text-xl font-bold text-gray-800 font-poppins">
            Buku Non-Akademik
          </h1>
          <div className="flex gap-3">
            <FilterCheckbox books={nonAkademikBooks} onFilterChange={setActiveFilters} hiddenFilters={['kelas']} />
            <SortFilter 
              currentSort={sortOption} 
              onSortChange={setSortOption} 
            />
          </div>
        </div>

        <div className="flex-grow">
          {displayBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
              {displayBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              Tidak ada buku ditemukan.
            </div>
          )}
        </div>

        {nonAkademikPagination && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={nonAkademikPagination.lastPage || 1}
              onPageChange={handlePageChange}
              isLoading={loading}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <LainnyaContent />
    </Suspense>
  );
}
