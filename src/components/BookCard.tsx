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
  hideCategory?: boolean;
}

const BookCard = ({ book, onClick, hideCategory = false }: BookCardProps) => {
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

  const avgRating = book.average_rating ? Number(book.average_rating) : 0;

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
        
        {/* New Rating Badge (Top-Right) */}
        {avgRating > 0 && (
          <div className="absolute top-0 right-0 m-2 bg-black/80 backdrop-blur-sm rounded-lg p-1.5 flex flex-col items-center justify-center min-w-[40px] shadow-sm z-10">
            <Star 
              size={16} 
              fill="#FACC15" 
              className="text-yellow-400 mb-0.5"
            />
            <span className="text-white text-xs font-medium">
              {avgRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      
      <p className="mt-2 text-sm font-poppins font-semibold text-center line-clamp-2 group-hover:text-blue-600 transition-colors">
        {book.judul}
      </p>
      
      {!hideCategory && (
        <>
          {book.kategori && (
            <p className="text-xs text-gray-500 mt-1">Kelas {book.kategori}</p>
          )}
          {book.sekolah && (
            <p className="text-xs text-gray-500">{book.sekolah}</p>
          )}
        </>
      )}
    </div>
  );
};

export default BookCard;
