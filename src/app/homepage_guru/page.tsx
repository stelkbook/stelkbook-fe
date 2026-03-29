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
import BookCard from '@/components/BookCard';
import { getStorageUrl } from '@/helpers/storage';
import { Plus, BookUp, ArrowRight } from 'lucide-react';
import AjukanBukuModal from '@/components/AjukanBukuModal';
import LastSeenBook from '@/components/LastSeenBook';
import ProgressChart from '@/components/ProgressChart';

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
  average_rating?: number;
  total_ratings?: number;
}

function GuruPageContent() {
  useAuthMiddleware();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { guruBooks, guruPagination, loading, fetchGuruBooks } = useBook();
  const [mappedBooks, setMappedBooks] = useState<Book[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
        const bookClass = book.kelas;
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
              kelas: book.kelas,
              mapel: book.mapel,
              sekolah: book.sekolah,
              penerbit: book.penerbit,
              penulis: book.penulis,
              average_rating: book.average_rating,
              total_ratings: book.total_ratings
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

      // Dynamic States
      const [chartData, setChartData] = useState<{name: string, value: number}[]>([]);
      const [historyData, setHistoryData] = useState<any[]>([]);
      const [lastBook, setLastBook] = useState<any | null>(null);

      useEffect(() => {
        // Generate Chart Data from Book View History
        const viewsStr = localStorage.getItem('buku_view_history');
        const viewsHistory = viewsStr ? JSON.parse(viewsStr) : {};
        const newChartData = [];
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        for (let i = 4; i >= 0; i--) {
           const d = new Date();
           d.setDate(d.getDate() - i);
           const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
           newChartData.push({
              name: days[d.getDay()],
              value: viewsHistory[dateKey] || 0
           });
        }
        setChartData(newChartData);

        // Retrieve Riwayat Buku
        const riwayatStr = localStorage.getItem('riwayat_buku');
        const riwayat = riwayatStr ? JSON.parse(riwayatStr) : [];
        if (riwayat.length > 0) {
            setLastBook(riwayat[0]);
        }
        setHistoryData(riwayat.slice(0, 4));
      }, []);

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
          <AjukanBukuModal 
            isOpen={isUploadModalOpen} 
            onClose={() => setIsUploadModalOpen(false)} 
          />

          <main className="pt-24 px-4 sm:px-8 flex-grow flex flex-col pb-8 w-full max-w-6xl mx-auto">
            {/* Welcome Message */}
            <div className="mb-8">
                <h2 className="text-xl font-poppins font-semibold text-gray-800 border-b pb-2 inline-block border-gray-300">
                Selamat datang, {user?.username || '{nama user}'}
                </h2>
            </div>

            {/* Row 1: Last Seen Book & Progres Mengajar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="flex justify-center md:justify-start">
                {lastBook ? (
                   <LastSeenBook 
                      title={lastBook.judul} 
                      coverUrl={lastBook.cover} 
                      rating={lastBook.average_rating || 0}
                      kelas={lastBook.kelas}
                      kategori={lastBook.kategori}
                      mapel={lastBook.mapel}
                      lastRead={lastBook.last_read}
                      path={lastBook.path}
                   />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full max-w-[200px] h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                        <p className="font-poppins font-bold text-center">Belum ada<br/>buku dilihat</p>
                    </div>
                )}
              </div>
              <div className="flex justify-center md:justify-end">
                 <div className="w-full max-w-lg">
                    <ProgressChart data={chartData} title="Kunjungan Buku" />
                 </div>
              </div>
            </div>

            {/* Row 2: Daftar Buku */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold font-poppins">Daftar Buku</h3>
                <div className="flex items-center gap-4">
                   {/* Filters */}
                   <FilterCheckbox books={guruBooks} onFilterChange={setActiveFilters} />
                   <SortFilter currentSort={sortOption} onSortChange={setSortOption} />
                   <button className="flex items-center text-gray-700 hover:text-red-600 font-bold font-poppins text-lg transition-colors group">
                       <ArrowRight size={20} className="mr-1 group-hover:translate-x-1 transition-transform" />
                       Lihat Semua
                   </button>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                {mappedBooks.length > 0 ? (
                    mappedBooks.slice(0, 4).map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))
                ) : (
                    <div className="col-span-4 flex justify-center items-center h-32 text-gray-500">
                      Tidak ada buku ditemukan.
                    </div>
                )}
              </div>
            </div>

            {/* Row 3: Riwayat Buku */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold font-poppins">Riwayat Buku</h3>
                <button className="flex items-center text-gray-700 hover:text-red-600 font-bold font-poppins text-lg transition-colors group">
                    <ArrowRight size={20} className="mr-1 group-hover:translate-x-1 transition-transform" />
                    Lihat Semua
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                 {historyData.length > 0 ? (
                    historyData.map((book) => (
                      <BookCard key={`riwayat-guru-${book.id}`} book={book} />
                    ))
                 ) : (
                     <div className="col-span-4 flex justify-center items-center h-32 text-gray-500 font-medium">
                      Belum ada riwayat buku.
                     </div>
                 )}
              </div>
            </div>

            {/* Row 4: Banner Ajukan Buku */}
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg group cursor-pointer hover:shadow-xl transition-all" onClick={() => setIsUploadModalOpen(true)}>
            <Image 
                src="/assets/login/6.png" 
                alt="Ajukan Buku Banner" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                unoptimized={true}
                onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/cccccc/ffffff?text=REQ';
                }}
            />
             <div className="absolute inset-0 bg-gradient-to-r from-red-800/60 to-transparent mix-blend-multiply"></div>
             <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 flex flex-col items-end">
                <h2 className="text-white text-2xl md:text-4xl font-extrabold italic font-poppins text-right leading-tight drop-shadow-lg mb-4">
                  Mau ajukan/<br/>request buku?
                </h2>
                <button className="bg-white text-red-600 font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors shadow-md transform hover:scale-105 active:scale-95">
                  Ajukan Disini!
                </button>
             </div>
        </div>

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
