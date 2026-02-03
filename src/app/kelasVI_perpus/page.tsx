'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar_Perpus';
import { useBook } from '@/context/bookContext';
import useAuthMiddleware from '@/hooks/auth';
import { useAuth } from '@/context/authContext';
import Pagination from '@/components/Pagination';
import SortFilter, { SortOption } from '@/components/SortFilter';
import { getStorageUrl } from '@/helpers/storage';


interface Book {
  id: number;
  judul: string;
  cover: string;
  path?: string;
}

function Kelas6PerpusContent() {
  useAuthMiddleware();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { kelas6Books, kelas6Pagination, loading, error, fetchKelas6Books } = useBook();
  const [displayBooks, setDisplayBooks] = useState<Book[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>(null);

  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchKelas6Books(currentPage);
  }, [fetchKelas6Books, currentPage]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/kelasVI_perpus?${params.toString()}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentPage > 1) handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight') {
        if (kelas6Pagination && currentPage < kelas6Pagination.lastPage) {
          handlePageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, kelas6Pagination]);

  useEffect(() => {
    if (kelas6Books) {
      const processedBooks = kelas6Books.map((book: any) => {
        const coverUrl = book.cover 
          ? getStorageUrl(book.cover) 
          : '/assets/default-cover.png';
        
        return {
          id: book.id,
          judul: book.judul,
          cover: coverUrl,
          path: `/kelasVI_perpus/buku6?id=${book.id}`,
        };
      });

      if (sortOption === 'asc') {
        processedBooks.sort((a: Book, b: Book) => a.judul.localeCompare(b.judul));
      } else if (sortOption === 'desc') {
        processedBooks.sort((a: Book, b: Book) => b.judul.localeCompare(a.judul));
      }

      setDisplayBooks(processedBooks);
    }
  }, [kelas6Books, sortOption]);

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
        <div className="mb-8 flex justify-between items-center">
          <p className="text-xl font-semibold font-poppins">
            Buku Kelas VI
          </p>
          <SortFilter
            currentSort={sortOption}
            onSortChange={setSortOption}
          />
        </div>

        <div className="flex-grow">
          {displayBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
              {displayBooks.map((book) => (
                <div
                  key={book.id}
                  className="text-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg w-full max-w-[180px]"
                  onClick={() => handleNavigationClick(book.path!)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' && book.path) router.push(book.path) }}
                >
                  <div className="relative w-full pb-[133%] rounded-lg overflow-hidden shadow-md mx-auto">
                    <Image
                      src={book.cover}
                      alt={book.judul}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 180px"
                      className="object-cover rounded-lg"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/assets/default-cover.png';
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-poppins font-semibold whitespace-pre-line text-center line-clamp-2">
                    {book.judul}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              Tidak ada buku ditemukan.
            </div>
          )}
        </div>

        {kelas6Pagination && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={kelas6Pagination.lastPage || 1}
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
      <Kelas6PerpusContent />
    </Suspense>
  );
}
