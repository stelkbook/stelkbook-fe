'use client';

import React, { useEffect, useState } from 'react';
import BookCard from '@/components/BookCard';
import axios from '@/utils/axios';
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

interface TopBooksProps {
  category: string;
  title?: string;
}

const TopBooks: React.FC<TopBooksProps> = ({ category, title = 'Rekomendasi Buku' }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopBooks = async () => {
      try {
        const response = await axios.get(`/books-top/${category}`);
        if (response.data && Array.isArray(response.data)) {
          const processedBooks = response.data.map((book: any) => {
            let path = `/kelas${book.kategori}/Buku?id=${book.id}`;
            if (book.kategori === 'NA') {
                path = `/lainnya/Buku_NA?id=${book.id}`;
            }
            return {
                ...book,
                cover: book.cover ? getStorageUrl(book.cover) : '/assets/default-cover.png',
                path: path,
                kelas: book.kategori, // Ensure compatibility with BookCard
            };
          });
          setBooks(processedBooks);
        }
      } catch (error) {
        console.error('Failed to fetch top books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopBooks();
  }, [category]);

  if (loading || books.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
         <span className="text-yellow-500 text-2xl">★</span>
         <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
        {books.map((book, index) => (
            <div key={book.id} className="relative w-full max-w-[180px]">
             <div className="absolute top-0 left-0 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-br-lg z-10 shadow-md">
                Top {index + 1}
             </div>
             <BookCard book={book} hideCategory={true} />
            </div>
        ))}
      </div>
    </div>
  );
};

export default TopBooks;
