'use client';

import React, { useState, useEffect } from 'react';
import api from '@/utils/axios';
import { Star } from 'lucide-react';

interface BookRatingProps {
  bookId: number;
  initialAverageRating?: number | string | null;
  initialTotalRatings?: number | string | null;
  isReadOnly?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
};

const BookRating: React.FC<BookRatingProps> = ({
  bookId,
  initialAverageRating = 0,
  initialTotalRatings = 0,
  isReadOnly = false,
  variant = 'compact',
  className = '',
}) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(toFiniteNumber(initialAverageRating, 0));
  const [totalRatings, setTotalRatings] = useState<number>(toFiniteNumber(initialTotalRatings, 0));
  const [loading, setLoading] = useState<boolean>(false);
  const [userRatingLoading, setUserRatingLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isCompact = variant === 'compact';

  useEffect(() => {
    // Update local state if props change (e.g. from parent re-fetch)
    setAverageRating(toFiniteNumber(initialAverageRating, 0));
    setTotalRatings(toFiniteNumber(initialTotalRatings, 0));
  }, [initialAverageRating, initialTotalRatings]);

  useEffect(() => {
    // Fetch user's existing rating
    const fetchUserRating = async () => {
      try {
        const response = await api.get(`/book-ratings/${bookId}/user`);
        if (response.data.rating) {
          setRating(toFiniteNumber(response.data.rating, 0));
        }
        if (response.data.review) {
          setReview(response.data.review);
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
            console.error('Failed to fetch user rating', err);
        }
      } finally {
        setUserRatingLoading(false);
      }
    };

    if (!isReadOnly) {
      fetchUserRating();
    } else {
      setUserRatingLoading(false);
    }
  }, [bookId, isReadOnly]);

  const handleRate = async (value: number) => {
    if (isReadOnly || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/book-ratings', {
        book_id: bookId,
        rating: value,
        review: review || null,
      });

      if (response.data.success) {
        setRating(value);
        if (response.data.average_rating !== undefined) {
            setAverageRating(toFiniteNumber(response.data.average_rating, averageRating));
        }
        if (response.data.total_ratings !== undefined) {
            setTotalRatings(toFiniteNumber(response.data.total_ratings, totalRatings));
        }
      }
    } catch (err: any) {
      console.error('Failed to submit rating', err);
      setError(err.response?.data?.message || 'Gagal mengirim penilaian.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
        setError('Silakan pilih rating bintang terlebih dahulu.');
        return;
    }
    await handleRate(rating);
  };

  return (
    <div className={`flex flex-col items-start ${isCompact ? 'gap-2 p-0 bg-transparent border-none shadow-none' : 'gap-4 p-6 bg-white rounded-xl shadow-md border border-gray-100'} transition-all ${!isCompact ? 'hover:shadow-lg' : ''} ${className}`}>
      <div className={`flex items-center ${isCompact ? 'gap-3' : 'gap-4'} w-full`}>
        <div className={`flex flex-col items-center justify-center ${isCompact ? 'bg-yellow-50/50 p-1.5 min-w-[50px]' : 'bg-yellow-50 p-3 min-w-[80px]'} rounded-lg`}>
            <span className={`${isCompact ? 'text-lg' : 'text-3xl'} font-bold text-yellow-600`}>{toFiniteNumber(averageRating, 0).toFixed(1)}</span>
            <div className="flex text-yellow-500">
                <Star size={isCompact ? 8 : 12} fill="currentColor" />
                <Star size={isCompact ? 8 : 12} fill="currentColor" />
                <Star size={isCompact ? 8 : 12} fill="currentColor" />
                <Star size={isCompact ? 8 : 12} fill="currentColor" />
                <Star size={isCompact ? 8 : 12} fill="currentColor" />
            </div>
        </div>
        
        <div className="flex flex-col flex-grow">
          <span className={`${isCompact ? 'text-[10px]' : 'text-sm'} font-semibold text-gray-700 uppercase tracking-wide`}>Rating Komunitas</span>
          <span className={`${isCompact ? 'text-[10px]' : 'text-sm'} text-gray-500`}>Berdasarkan {totalRatings} ulasan</span>
        </div>
      </div>

      {!isCompact && <div className="w-full h-px bg-gray-100"></div>}

      <div className={`flex flex-col ${isCompact ? 'gap-1' : 'gap-2'} w-full`}>
        <div className="flex justify-between items-center">
            <span className={`${isCompact ? 'text-[11px]' : 'text-sm'} font-medium text-gray-700`}>
            {isReadOnly ? 'Rating Buku' : userRatingLoading ? 'Memuat...' : rating > 0 ? 'Rating Anda (Ketuk untuk ubah)' : 'Berikan Penilaian Anda'}
            </span>
            {loading && <span className="text-[10px] text-blue-500 animate-pulse">Menyimpan...</span>}
        </div>
        
        <div className={`flex flex-wrap ${isCompact ? 'gap-0' : 'gap-1'} justify-center sm:justify-start`}>
          {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
            <button
                key={star}
                type="button"
                onClick={() => !isReadOnly && !loading && setRating(star)}
                onMouseEnter={() => !isReadOnly && !loading && setHoverRating(star)}
                onMouseLeave={() => !isReadOnly && !loading && setHoverRating(0)}
                className={`p-1 focus:outline-none transition-transform duration-200 ${
                !isReadOnly && !loading ? 'hover:scale-125 cursor-pointer' : 'cursor-default'
                }`}
                disabled={isReadOnly || loading}
                aria-label={`Rate ${star} stars`}
            >
                <Star
                size={isCompact ? 18 : 28}
                className={`${
                    star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                    : 'fill-gray-100 text-gray-300'
                } transition-colors duration-200`}
                />
            </button>
          ))}
        </div>
        
        {!isReadOnly && (
            <div className={`${isCompact ? 'mt-1' : 'mt-2'} w-full`}>
                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Tulis ulasan opsional Anda di sini..."
                    className={`w-full ${isCompact ? 'p-2 text-[11px]' : 'p-3 text-sm'} border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all resize-none`}
                    rows={isCompact ? 2 : 3}
                    disabled={loading}
                />
                <button
                    onClick={handleSubmitReview}
                    disabled={loading || rating === 0}
                    className={`${isCompact ? 'mt-1 py-1.5' : 'mt-2 py-2'} w-full bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm`}
                >
                    {loading ? 'Mengirim...' : 'Kirim Penilaian & Ulasan'}
                </button>
            </div>
        )}
        
        {rating > 0 && !isReadOnly && !loading && (
           <div className={`text-[10px] text-green-600 font-medium flex items-center gap-1 ${isCompact ? 'mt-0.5' : 'mt-1'} bg-green-50 p-2 rounded w-full animate-in fade-in slide-in-from-top-1 duration-300`}>
               <span>✓</span> Terima kasih! Penilaian Anda: {rating}/5
           </div>
        )}
        {error && (
            <div className={`text-[10px] text-red-500 font-medium flex items-center gap-1 ${isCompact ? 'mt-0.5' : 'mt-1'} bg-red-50 p-2 rounded w-full`}>
                <span>!</span> {error}
            </div>
        )}
      </div>
    </div>
  );
};

export default BookRating;
