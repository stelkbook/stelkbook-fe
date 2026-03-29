'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';

interface Book {
  id: number;
  judul: string;
  cover: string;
  path?: string;
  // Optional additional fields if needed for display
  kategori?: string;
  kelas?: string;
  mapel?: string;
  penerbit?: string;
  penulis?: string;
  sekolah?: string;
  average_rating?: number;
  total_ratings?: number;
}

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

const BookCard = ({ book, onClick }: BookCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    try {
      // 1. Update Riwayat Buku with Last Read Timestamp
      const historyStr = localStorage.getItem('riwayat_buku');
      let bookHistory = historyStr ? JSON.parse(historyStr) : [];
      bookHistory = bookHistory.filter((b: any) => b.id !== book.id);
      
      const viewedBook = { ...book, last_read: new Date().toISOString() };
      bookHistory.unshift(viewedBook);
      
      if (bookHistory.length > 50) bookHistory = bookHistory.slice(0, 50);
      localStorage.setItem('riwayat_buku', JSON.stringify(bookHistory));

      // 2. Track Book View for the Chart
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const viewsStr = localStorage.getItem('buku_view_history');
      let viewsData = viewsStr ? JSON.parse(viewsStr) : {};
      viewsData[today] = (viewsData[today] || 0) + 1;
      localStorage.setItem('buku_view_history', JSON.stringify(viewsData));
    } catch (e) {
      console.error("Failed saving book history", e);
    }

    if (onClick) {
      onClick();
    } else if (book.path) {
      router.push(book.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'B';
    return name.split(' ').slice(0, 3).map(w => w.charAt(0)).join('').toUpperCase();
  };

  return (
    <div
      className="text-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg w-full max-w-[180px] transition-colors flex flex-col items-center group"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="relative w-full pb-[133%] rounded-lg overflow-hidden shadow-md mx-auto group-hover:shadow-lg transition-shadow">
        <Image
          src={book.cover}
          alt={book.judul}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 180px"
          className="object-cover rounded-lg"
          unoptimized={true}
          onError={(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = `https://placehold.co/400x400/cccccc/ffffff?text=${getInitials(book.judul)}`;
          }}
        />
        {/* Rating Badge Overlay */}
        {(book.average_rating !== undefined && book.average_rating !== null) && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md flex items-center gap-1 z-10">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-bold">{Number(book.average_rating).toFixed(1)}</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm font-poppins font-semibold text-center line-clamp-2 group-hover:text-blue-600 transition-colors">
        {book.judul}
      </p>
      {book.kategori && (
        <p className="text-xs text-gray-500 mt-1">Kelas {book.kategori}</p>
      )}
      {book.sekolah && (
        <p className="text-xs text-gray-500">{book.sekolah}</p>
      )}
    </div>
  );
};

export default BookCard;
