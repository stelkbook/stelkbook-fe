'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useBook } from '@/context/bookContext';
import useAuthMiddleware from '@/hooks/auth';
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
      className="text-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg w-full max-w-[180px] transition-colors flex flex-col items-center"
      onClick={() => book.path && router.push(book.path)}
    >
      <div className="relative w-full pb-[133%] rounded-lg overflow-hidden shadow-md mx-auto">
        <Image
           src={book.cover}
           alt={book.judul}
           fill
           sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 180px"
           className="rounded-md object-cover"
           priority
           onError={(e) => {
             const target = e.target as HTMLImageElement;
             target.src = '/assets/default-cover.png';
           }}
         />
      </div>
      <p className="mt-2 text-sm font-poppins font-semibold text-center line-clamp-2">{book.judul}</p>
    </div>
  );
};

function PageContent() {
  useAuthMiddleware();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { kelas10Books, kelas10Pagination, loading, error, fetchKelas10Books } = useBook();
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
    router.push('/SMK');
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/kelasX?${params.toString()}`);
  };

  useEffect(() => {
    fetchKelas10Books(currentPage);
  }, [fetchKelas10Books, currentPage]);

  useEffect(() => {
    // Add keyboard listener for arrow keys
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentPage > 1) handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight') {
        if (kelas10Pagination && currentPage < kelas10Pagination.lastPage) {
          handlePageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, kelas10Pagination]);

  useEffect(() => {
    if (!kelas10Books) return;

    const filteredBooks = kelas10Books.filter((book: any) => {
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
        path: `/kelasX/Buku?id=${book.id}`,
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
  }, [kelas10Books, sortOption, activeFilters]);

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
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Kelas X</h2>
          </div>
          <div className="flex gap-3 w-full md:w-auto flex-wrap">
            <FilterCheckbox 
              books={kelas10Books} 
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
        {kelas10Pagination && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={kelas10Pagination.lastPage || 1}
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
