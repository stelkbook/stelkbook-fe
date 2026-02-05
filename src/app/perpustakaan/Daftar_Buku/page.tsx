'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar_Perpus';
import { useBook } from '@/context/bookContext';
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

function BookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { books, fetchBooks, loading, pagination, error } = useBook();
  const [combinedBooks, setCombinedBooks] = useState<Book[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    kelas: [],
    mapel: [],
    penerbit: [],
    penulis: []
  });

  const currentPage = Number(searchParams.get('page')) || 1;

  // Data statis untuk "Menambahkan Buku"
  const staticBook: Book = {
    id: 0,
    judul: 'Menambahkan Buku',
    cover: '/assets/icon/add-file.svg',
    path: '/perpustakaan/Tambah_Buku',
  };

  useEffect(() => {
    fetchBooks(currentPage);
  }, [fetchBooks, currentPage]);

  useEffect(() => {
    if (books && Array.isArray(books)) {
      // Filter logic
      let processedBooks = books.filter((book: any) => {
        const bookClass = book.kelas || book.kategori;
        const matchesClass = activeFilters.kelas.length === 0 || (bookClass && activeFilters.kelas.includes(bookClass));
        const matchesSubject = activeFilters.mapel.length === 0 || (book.mapel && activeFilters.mapel.includes(book.mapel));
        const matchesPublisher = activeFilters.penerbit.length === 0 || (book.penerbit && activeFilters.penerbit.includes(book.penerbit));
        const matchesAuthor = activeFilters.penulis.length === 0 || (book.penulis && activeFilters.penulis.includes(book.penulis));
        
        return matchesClass && matchesSubject && matchesPublisher && matchesAuthor;
      });

      const mappedBooks: Book[] = processedBooks.map((book: any) => {
        const coverUrl = (book.cover_url && book.cover_url.startsWith('http')) 
          ? book.cover_url 
          : getStorageUrl(book.cover);

        return {
          id: book.id,
          judul: book.judul,
          cover: coverUrl,
          path: `/perpustakaan/Daftar_Buku/Buku?id=${book.id}`,
        };
      });

      if (sortOption === 'asc') {
        mappedBooks.sort((a, b) => a.judul.localeCompare(b.judul));
      } else if (sortOption === 'desc') {
        mappedBooks.sort((a, b) => b.judul.localeCompare(a.judul));
      }

      setCombinedBooks([staticBook, ...mappedBooks]);
    }
  }, [books, sortOption, activeFilters]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/perpustakaan/Daftar_Buku?${params.toString()}`);
  };

  const handleNavigationClick = (path: string) => {
    router.push(path);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentPage > 1) handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight') {
        if (pagination && currentPage < pagination.lastPage) {
          handlePageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pagination]);

  if (loading && books.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat buku...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between pt-20 px-2 sm:px-8 gap-4 relative z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/perpustakaan')}
            className="text-gray-600 hover:text-red transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <p className="text-xl font-semibold font-poppins">Perpus Anda</p>
        </div>
        <div className="flex gap-3">
          <FilterCheckbox books={books} onFilterChange={setActiveFilters} />
          <SortFilter
              currentSort={sortOption}
              onSortChange={setSortOption}
          />
        </div>
      </div>

      {error && (
        <div className="mx-2 sm:mx-8 mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          gap-6
          justify-items-center
        "
      >
        {combinedBooks.map((book, index) => (
          <div
            key={book.id}
            className="text-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg w-full max-w-[180px]"
            onClick={() => handleNavigationClick(book.path!)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter') handleNavigationClick(book.path!);
            }}
          >
           {book.id === 0 ? (
            <div className="relative w-full pb-[133%] bg-gradient-to-b from-red to-red rounded-lg shadow-md">
                <div className="absolute inset-0 flex items-center justify-center">
                <Image
                    src={book.cover}
                    alt="Tambah Buku"
                    width={80} // ikon besar
                    height={80}
                    priority
                    className="object-contain"
                    style={{width: 'auto', height: 'auto'}}
                />
                </div>
                <div className="absolute bottom-3 right-3 text-white font-bold text-2xl">+</div>
            </div>
            ) : (
              <div className="relative w-full pb-[133%] rounded-lg overflow-hidden shadow-md mx-auto">
                <Image
                  src={book.cover}
                  alt={book.judul}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 180px"
                  priority={index < 8}
                  className="object-cover rounded-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/default-cover.png';
                  }}
                />
              </div>
            )}
            <p className="mt-2 text-sm font-poppins font-semibold whitespace-pre-line text-center">
              {book.judul}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="mt-8 mb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.lastPage || 1}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        </div>
      )}
    </>
  );
}

function Page() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50 overflow-y-auto">
      <header className="flex justify-between items-center mb-4">
        <Navbar />
      </header>

      <Suspense fallback={
        <div className="h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Memuat halaman...</p>
          </div>
        </div>
      }>
        <BookContent />
      </Suspense>
    </div>
  );
}

export default Page;
