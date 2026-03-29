'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/authContext';
import useAuthMiddleware from '@/hooks/auth';
import { BookUp, ArrowRight } from 'lucide-react';
import AjukanBukuModal from '@/components/AjukanBukuModal';
import LastSeenBook from '@/components/LastSeenBook';
import ProgressChart from '@/components/ProgressChart';
import BookCard from '@/components/BookCard';

function HomePage() {
  useAuthMiddleware();
  const router = useRouter();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamic States
  const [chartData, setChartData] = useState<{name: string, value: number}[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [lastBook, setLastBook] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      const role = user.role.toLowerCase();
      if (role === 'admin' || role === 'perpus' || role === 'pengurusperpustakaan') {
        router.push('/perpustakaan');
      } else if (role === 'guru') {
        router.push('/homepage_guru');
      }
    }
  }, [user, router]);

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

  const handleButtonClick = (destination: string) => {
    const routes: Record<string, string> = {
      'User': '/profile',
      'SD': '/SD',
      'SMP': '/SMP',
      'SMK': '/SMK',
      'Non Akademik': '/lainnya',
    };

    if (routes[destination]) router.push(routes[destination]);
  };

  return (
    <div className="min-h-screen pb-12 bg-white flex flex-col items-center">
      <Navbar />
      
      <AjukanBukuModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 mt-24">
        {/* Welcome Message */}
        <h2 className="text-xl font-poppins font-semibold text-gray-800 mb-8 border-b pb-2 inline-block border-gray-300">
          Selamat datang, {user?.username || '{nama user}'}
        </h2>

        {/* Row 1: Last Seen Book & Progress Belajar */}
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
                <ProgressChart data={chartData} title="Progress Membaca" />
             </div>
          </div>
        </div>

        {/* Row 2: Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: 'SD', image: '/assets/Homepage-Front/sd.jpg' },
            { title: 'SMP', image: '/assets/Homepage-Front/smp.jpg' },
            { title: 'SMA/SMK', image: '/assets/Homepage-Front/smk.png' },
            { title: 'Non Akademik', image: '/assets/Homepage-Front/na.png' },
          ].map(({ title, image }) => (
            <div 
              key={title} 
              onClick={() => handleButtonClick(title === 'SMA/SMK' ? 'SMK' : title)}
              className="relative w-full h-48 rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all"
            >
              <Image 
                  src={image} alt={title} fill sizes="(max-width: 640px) 100vw, 25vw" 
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized={true}
                  onError={(e) => {
                    const getInitials = (n: string) => n.split(/[\s/]+/).map(w => w.charAt(0)).join('').toUpperCase();
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x400/cccccc/ffffff?text=${getInitials(title)}`;
                  }}
              />
              <div 
                  className="absolute inset-0 mix-blend-multiply opacity-80 group-hover:opacity-60 transition-opacity"
                  style={{ background: 'linear-gradient(41deg, rgba(184, 41, 45, 1) 0%, rgba(82, 18, 20, 0) 62%)' }}
              ></div>
              <div className="absolute bottom-4 left-4 z-10">
                <p className="text-white font-bold italic text-3xl md:text-2xl lg:text-3xl drop-shadow-md">{title}</p>
              </div>
            </div>
          ))}
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
               historyData.map(book => (
                  <BookCard key={`riwayat-${book.id}`} book={book} />
               ))
            ) : (
                <div className="col-span-2 lg:col-span-4 flex justify-center items-center h-32 text-gray-500 font-medium">
                  Belum ada riwayat buku.
                </div>
            )}
          </div>
        </div>

        {/* Row 4: Banner Ajukan Buku */}
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg group cursor-pointer hover:shadow-xl transition-all" onClick={() => setIsModalOpen(true)}>
            <Image 
                src="/assets/login/6.png" alt="Ajukan Buku Banner" fill 
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

      </div>
    </div>
  );
}

export default HomePage;