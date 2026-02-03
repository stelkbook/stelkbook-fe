'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar_Guru';
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
  sekolah?: string;
  penerbit?: string;
  penulis?: string;
}

const BookCard = ({ book }: { book: Book }) => {
  const router = useRouter();

  return (
    <div
      className="text-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg w-full max-w-[180px]"
      onClick={() => book.path && router.push(book.path)}
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
      <p className="mt-2 text-sm font-poppins font-semibold whitespace-pre-line text-center">
        {book.judul}
      </p>
      {book.kategori && (
        <p className="text-xs text-gray-500">Kelas {book.kategori}</p>
      )}
      {book.sekolah && (
        <p className="text-xs text-gray-500">{book.sekolah}</p>
      )}
    </div>
  );
};

function GuruPageContent() {
  useAuthMiddleware();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { guruBooks, guruPagination, loading, fetchGuruBooks } = useBook();
  const [mappedBooks, setMappedBooks] = useState<Book[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    kelas: [],
    mapel: [],
    penerbit: [],
    penulis: []
  });

  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    if (user) {
      const role = user.role.toLowerCase();
      if (role === 'admin' || role === 'perpus' || role === 'pengurusperpustakaan') {
        router.push('/perpustakaan');
      } else if (role === 'guru') {
        // tetap di halaman ini
      } else {
        router.push('/homepage');
      }
    }
  }, [user, router]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/homepage_guru?${params.toString()}`);
  };

  useEffect(() => {
    fetchGuruBooks(currentPage);
  }, [fetchGuruBooks, currentPage]);

  useEffect(() => {
    // Add keyboard listener for arrow keys
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentPage > 1) handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight') {
        if (guruPagination && currentPage < guruPagination.lastPage) {
          handlePageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, guruPagination]);

  useEffect(() => {
    if (guruBooks) {
      const filteredBooks = guruBooks.filter((book: any) => {
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
          path: `/homepage_guru/Buku?id=${book.id}`,
          kategori: book.kategori,
          kelas: book.kelas || book.kategori,
          mapel: book.mapel,
          sekolah: book.sekolah,
          penerbit: book.penerbit,
          penulis: book.penulis
        };
      });

      if (sortOption === 'asc') {
        processedBooks.sort((a: Book, b: Book) => a.judul.localeCompare(b.judul));
      } else if (sortOption === 'desc') {
        processedBooks.sort((a: Book, b: Book) => b.judul.localeCompare(a.judul));
      }

      setMappedBooks(processedBooks);
    }
  }, [guruBooks, sortOption, activeFilters]);

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
            Buku Ajar Anda
          </p>
          <div className="flex gap-3">
            <FilterCheckbox books={guruBooks} onFilterChange={setActiveFilters} />
            <SortFilter
              currentSort={sortOption}
              onSortChange={setSortOption}
            />
          </div>
        </div>

        <div className="flex-grow">
          {mappedBooks.length > 0 ? (
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
              {mappedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              Tidak ada buku ditemukan.
            </div>
          )}
        </div>

        {guruPagination && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={guruPagination.lastPage || 1}
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
      <GuruPageContent />
    </Suspense>
  );
}
