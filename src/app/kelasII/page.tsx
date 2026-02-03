'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import SortFilter, { SortOption } from '@/components/SortFilter';
import FilterCheckbox, { FilterState } from '@/components/FilterCheckbox';
import { useBook } from '@/context/bookContext';
import useAuthMiddleware from '@/hooks/auth';
import BookCard from '@/components/BookCard';
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

function PageContent() {
  useAuthMiddleware();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { kelas2Books, kelas2Pagination, loading, error, fetchKelas2Books } = useBook();
  const [displayBooks, setDisplayBooks] = useState<Book[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    kelas: [],
    mapel: [],
    penerbit: [],
    penulis: []
  });

  const currentPage = Number(searchParams.get('page')) || 1;

  const handleStudiAndaClick = () => {
    router.push('/SD');
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/kelasII?${params.toString()}`);
  };

  useEffect(() => {
    fetchKelas2Books(currentPage);
  }, [fetchKelas2Books, currentPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentPage > 1) handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight') {
        if (kelas2Pagination && currentPage < kelas2Pagination.lastPage) {
          handlePageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, kelas2Pagination]);

  useEffect(() => {
    const filteredBooks = kelas2Books.filter((book: any) => {
      // For backward compatibility, check both kelas and kategori
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
        path: `/kelasII/Buku?id=${book.id}`,
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
  }, [kelas2Books, sortOption, activeFilters]);

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
      {/* Navbar */}
      <Navbar />

      <main className="pt-24 px-4 md:px-8 flex-grow flex flex-col pb-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
          <div className="flex items-center space-x-2 flex-wrap">
            <h1 
              className="text-lg md:text-xl font-bold text-gray-800 cursor-pointer hover:underline"
              onClick={handleStudiAndaClick}
            >
              Studi Anda
            </h1>
            <Image src="/assets/Kelas_X/Primary_Direct.png" alt="Divider Icon" width={10} height={16} />
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Kelas II</h2>
          </div>
          <div className="flex gap-3 w-full md:w-auto flex-wrap">
            <FilterCheckbox 
              books={kelas2Books} 
              onFilterChange={setActiveFilters} 
            />
            <SortFilter 
              currentSort={sortOption} 
              onSortChange={setSortOption} 
            />
          </div>
        </div>

        {/* Books Section */}
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

        {/* Pagination Section */}
        {kelas2Pagination && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={kelas2Pagination.lastPage || 1}
              onPageChange={handlePageChange}
              isLoading={loading}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}

export default Page;