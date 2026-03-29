'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Clock } from 'lucide-react';

interface LastSeenBookProps {
  title: string;
  coverUrl: string;
  rating?: number;
  kelas?: string;
  kategori?: string;
  mapel?: string;
  lastRead?: string;
  path?: string;
}

const LastSeenBook: React.FC<LastSeenBookProps> = ({ 
  title, 
  coverUrl, 
  rating = 0,
  kelas,
  kategori,
  mapel,
  lastRead,
  path
}) => {
  const router = useRouter();

  // Helper to format ISO date to readable string
  const formatLastRead = (isoString?: string) => {
    if (!isoString) return 'Baru saja';
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  // Helper to get up to 3 initials from title
  const getInitials = (name: string) => {
    if (!name) return 'B';
    return name.split(' ').slice(0, 3).map(w => w.charAt(0)).join('').toUpperCase();
  };

  return (
    <div 
      onClick={() => path && router.push(path)}
      className={`flex flex-col sm:flex-row bg-white rounded-xl shadow-md border border-gray-100 p-4 gap-4 w-full h-full hover:shadow-lg transition-all ${path ? 'cursor-pointer hover:bg-red-50/50' : ''}`}
    >
      {/* 1. Cover with Rating Badge Overlay */}
      <div className="relative flex-shrink-0 w-40 h-56 sm:w-36 sm:h-52 rounded-lg overflow-hidden shadow-sm mx-auto sm:mx-0">
        <Image
          src={coverUrl}
          alt={title}
          fill
          unoptimized={true}
          sizes="(max-width: 640px) 100vw, 200px"
          className="object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = `https://placehold.co/400x400/cccccc/ffffff?text=${getInitials(title)}`;
          }}
        />
        <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
          <Star className="w-3 h-3 mr-1 fill-white" />
          {Number(rating || 0).toFixed(1)}
        </div>
      </div>

      {/* 2. Book Info (Beside Cover) */}
      <div className="flex flex-col justify-center flex-grow">
        <p className="text-gray-500 text-sm font-medium mb-1">Terakhir dilihat</p>
        <h3 className="font-poppins font-bold text-lg text-gray-800 leading-tight mb-2 line-clamp-2">
          {title}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {kelas && <span className="bg-red-50 text-red-600 text-xs font-semibold px-2 py-1 rounded-md">{kelas}</span>}
          {mapel && <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-1 rounded-md">{mapel}</span>}
          {kategori && <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-md">{kategori}</span>}
        </div>

        <div className="mt-auto flex items-center text-xs text-gray-500 font-medium whitespace-nowrap">
          <Clock className="w-4 h-4 mr-1.5" />
          Dibaca: {formatLastRead(lastRead)}
        </div>
      </div>
    </div>
  );
};

export default LastSeenBook;
