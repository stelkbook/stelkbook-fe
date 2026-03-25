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
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/default-cover.png';
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
