'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar_Perpus';
import { useBook } from '@/context/bookContext';
import useAuthMiddleware from '@/hooks/auth';
import { useAuth } from '@/context/authContext';
import { getStorageUrl } from '@/helpers/storage';


interface Book {
  id: number;
  judul: string;
  cover: string;
  path?: string;
}

function Page() {
  useAuthMiddleware();
  const router = useRouter();
  const { user } = useAuth();
  const { kelas7Books, loading, error, fetchKelas7Books } = useBook();
  const [displayBooks, setDisplayBooks] = useState<Book[]>([]);

  // Redirect based on user role


  // Fetch non-akademik books on component mount
  useEffect(() => {
    fetchKelas7Books();
  }, [fetchKelas7Books]);

  // Process books data when it changes
  useEffect(() => {
    const processedBooks = kelas7Books.map((book: Book) => {
      const coverUrl = book.cover 
        ? getStorageUrl(book.cover) 
        : '/assets/default-cover.png';
      
      // console.log(`Cover URL for Book ID ${book.id}:`, coverUrl);
      
      return {
        id: book.id,
        judul: book.judul,
        cover: coverUrl,
        path: `/kelasVII_perpus/buku7?id=${book.id}`,
      };
    });

    setDisplayBooks(processedBooks);
  }, [kelas7Books]);

  const handleNavigationClick = (path: string) => {
    router.push(path);
  };

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
    <div className="min-h-screen p-8 bg-gray-50 overflow-y-auto">
      <header className="flex justify-between items-center mb-4">
        <Navbar />
      </header>

      <div className="mb-8 flex items-center pt-20 px-8">
        <p className="text-xl font-semibold text-left font-poppins translate-y-[-15px]">
          Buku Kelas VII
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {displayBooks.map((book) => (
          <div
            key={book.id}
            className="text-center cursor-pointer hover:bg-gray-100 p-4 rounded-lg transition-colors"
            onClick={() => handleNavigationClick(book.path!)}
          >
            <div className="w-[150px] h-[200px] relative mx-auto">
             <Image
                            src={book.cover}
                            alt={book.judul}
                            fill
                            sizes="300px"
                            className="rounded-md object-cover shadow-md"
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
        ))}
      </div>
    </div>
  );
}

export default Page;