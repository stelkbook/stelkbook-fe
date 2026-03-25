'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar_Guru';
import { useBook } from '@/context/bookContext';
import useAuthMiddleware from '@/hooks/auth';
import { useAuth } from '@/context/authContext';
import Pagination from '@/components/Pagination';
import SortFilter, { SortOption } from '@/components/SortFilter';
import FilterCheckbox, { FilterState } from '@/components/FilterCheckbox';
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
  sekolah?: string;
  average_rating?: number;
  total_ratings?: number;
}

function Kelas11GuruContent() {
  useAuthMiddleware();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { kelas11Books, kelas11Pagination, loading, error, fetchKelas11Books } = useBook();
  const [displayBooks, setDisplayBooks] = useState<Book[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    kelas: [],
    mapel: [],
    penerbit: [],
    penulis: []
  });

  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchKelas11Books(currentPage);
  }, [fetchKelas11Books, currentPage]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/kelasXI_guru?${params.toString()}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentPage > 1) handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight') {
        if (kelas11Pagination && currentPage < kelas11Pagination.lastPage) {
          handlePageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, kelas11Pagination]);

  useEffect(() => {
    if (kelas11Books) {
      // First, filter the books
      const filteredBooks = kelas11Books.filter((book: any) => {
        // Handle class filter - check both kelas and kategori
        // Some books might store class info in 'kategori' or 'kelas'
        const bookClass = book.kelas || book.kategori;
        
        // Helper to check if a book matches selected classes
        // This handles cases where bookClass might be a string or array, or part of a string
        const matchesClass = activeFilters.kelas.length === 0 || (
          bookClass && activeFilters.kelas.includes(bookClass)
        );

        const matchesSubject = activeFilters.mapel.length === 0 || (
          book.mapel && activeFilters.mapel.includes(book.mapel)
        );

        const matchesPublisher = activeFilters.penerbit.length === 0 || (
          book.penerbit && activeFilters.penerbit.includes(book.penerbit)
        );

        const matchesAuthor = activeFilters.penulis.length === 0 || (
          book.penulis && activeFilters.penulis.includes(book.penulis)
        );

        return matchesClass && matchesSubject && matchesPublisher && matchesAuthor;
      });

      // Map to Book interface
      const processedBooks = filteredBooks.map((book: any) => {
        const coverUrl = book.cover 
          ? getStorageUrl(book.cover) 
          : '/assets/default-cover.png';
        
        return {
          id: book.id,
          judul: book.judul,
          cover: coverUrl,
          path: `/kelasXI_guru/Buku?id=${book.id}`,
          kategori: book.kategori,
          kelas: book.kelas,
          mapel: book.mapel,
          penerbit: book.penerbit,
          penulis: book.penulis,
          sekolah: book.sekolah,
          average_rating: book.average_rating,
          total_ratings: book.total_ratings
        };
      });

      // Sort
      if (sortOption === 'asc') {
        processedBooks.sort((a: Book, b: Book) => a.judul.localeCompare(b.judul));
      } else if (sortOption === 'desc') {
        processedBooks.sort((a: Book, b: Book) => b.judul.localeCompare(a.judul));
      }

      setDisplayBooks(processedBooks);
    }
  }, [kelas11Books, sortOption, activeFilters]);

  const handleNavigationClick = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat buku...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="pt-24 px-4 sm:px-8 flex-grow flex flex-col pb-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xl font-semibold font-poppins">
              Buku Kelas XI
            </p>
            <p className="text-sm text-gray-500">
              Menampilkan {displayBooks.length} buku
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <FilterCheckbox 
              books={kelas11Books || []}
              onFilterChange={setActiveFilters}
            />
            <SortFilter
              currentSort={sortOption}
              onSortChange={setSortOption}
            />
          </div>
        </div>

        <div className="flex-grow">
          {displayBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
              {displayBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onClick={() => handleNavigationClick(book.path!)} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-64 text-gray-500">
              <p className="text-lg font-medium">Tidak ada buku ditemukan</p>
              <p className="text-sm">Coba sesuaikan filter pencarian Anda</p>
            </div>
          )}
        </div>

        {kelas11Pagination && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={kelas11Pagination.lastPage || 1}
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
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <Kelas11GuruContent />
    </Suspense>
  );
}
