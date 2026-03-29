'use client';

import Image from 'next/image';
import { FaUserCircle, FaCheck, FaTimes, FaPlus, FaBook } from 'react-icons/fa';
import Navbar from '@/components/Navbar_Lainnya_Perpus2';
import { useRouter } from 'next/navigation';
import useAuthMiddleware from '@/hooks/auth';
import useRoleGuard from '@/hooks/roleGuard';
import { useAuth } from '@/context/authContext';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { FaBookOpen } from 'react-icons/fa6';
import dynamic from 'next/dynamic';
import { useBook } from '@/context/bookContext';
import { getStorageUrl } from '@/helpers/storage';
import { Award, Star } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  
  // Single source of truth for initialization and redirection
  const [isInitialized, setIsInitialized] = useState(false);
  const dataFetched = useRef(false);
  const redirectAttempted = useRef(false);
  const [isClient, setIsClient] = useState(false);
  
  const { 
    user, 
    loading: authLoading,
    fetchPendingUsers, 
    approveUser, 
    rejectUser,
    rekapKunjunganData,
    fetchRekapKunjungan 
  } = useAuth();
  
  const {
    fetchRekapKunjunganBooks,
    rekapKunjunganBooks,
    loading: bookLoading
  } = useBook();

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingRekap, setLoadingRekap] = useState(true);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle redirect with better condition
  useEffect(() => {
    // Only run on client-side and after auth is loaded
    if (!isClient || authLoading) return;
    
    // Prevent multiple redirect attempts
    if (redirectAttempted.current) return;
    
    if (!user) {
      redirectAttempted.current = true;
      router.replace('/');
      return;
    }
    
    const role = user.role?.toLowerCase();
    const allowedRoles = ['admin', 'perpus', 'pengurusperpustakaan'];
    
    if (!allowedRoles.includes(role)) {
      redirectAttempted.current = true;
      if (role === 'guru') {
        router.replace('/homepage_guru');
      } else {
        router.replace('/homepage');
      }
      return;
    }
    
    // Mark as initialized when user has correct role
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [user, authLoading, router, isClient, isInitialized]);

  // Fetch data only once when component is ready
  useEffect(() => {
    if (!isInitialized || dataFetched.current) return;
    
    const fetchAllData = async () => {
      // Set timeout as a safety measure
      const timeoutId = setTimeout(() => {
        setLoadingPending(false);
        setLoadingRekap(false);
      }, 5000); // 5 seconds timeout

      try {
        setLoadingPending(true);
        setLoadingRekap(true);
        
        // Fetch pending users
        const users = await fetchPendingUsers();
        setPendingUsers(users || []);
        setLoadingPending(false);
        
        // Fetch rekap data
        await Promise.all([
          fetchRekapKunjungan().catch(e => console.error("Rekap Kunjungan Error:", e)),
          fetchRekapKunjunganBooks().catch(e => console.error("Rekap Books Error:", e))
        ]);
        
        clearTimeout(timeoutId);
        dataFetched.current = true;
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoadingPending(false);
        setLoadingRekap(false);
      }
    };
    
    fetchAllData();
  }, [fetchPendingUsers, fetchRekapKunjungan, fetchRekapKunjunganBooks, isInitialized]);

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const handleApprove = useCallback(async (id: number) => {
    try {
      await approveUser(id);
      // Refresh pending users
      const users = await fetchPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
  }, [approveUser, fetchPendingUsers]);

  const handleReject = useCallback(async (id: number) => {
    try {
      await rejectUser(id);
      // Refresh pending users
      const users = await fetchPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error("Failed to reject user:", error);
    }
  }, [rejectUser, fetchPendingUsers]);

  // Get top 3 most read books
  const top3Buku = useMemo(() => {
    if (!rekapKunjunganBooks || rekapKunjunganBooks.length === 0) return [];
    
    return [...rekapKunjunganBooks]
      .sort((a, b) => {
        const totalA = Number(a.total_kunjungan) || 0;
        const totalB = Number(b.total_kunjungan) || 0;
        return totalB - totalA;
      })
      .slice(0, 3);
  }, [rekapKunjunganBooks]);

  const totalKunjunganTop3 = useMemo(() => {
    return top3Buku.reduce((acc, book) => {
      const kunjungan = Number(book.total_kunjungan) || 0;
      return acc + kunjungan;
    }, 0);
  }, [top3Buku]);

  const getMedalColor = useCallback((rank: number): string => {
    switch(rank) {
      case 0: return 'text-yellow-500';
      case 1: return 'text-gray-400';
      case 2: return 'text-amber-600';
      default: return 'text-gray-300';
    }
  }, []);

  const getMonthName = useCallback((month: string) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[parseInt(month) - 1] || month;
  }, []);

  const getDataSemuaBulan = useCallback(() => {
    if (!rekapKunjunganData?.bulan) return [];
    
    const currentYear = new Date().getFullYear();
    
    const bulanTahunIni = rekapKunjunganData.bulan
      .filter((item: any) => {
        return !item.tahun || parseInt(item.tahun) === currentYear;
      })
      .map((item: any) => ({
        ...item,
        name: getMonthName(item.bulan),
      }))
      .sort((a: any, b: any) => parseInt(a.bulan) - parseInt(b.bulan));
    
    return bulanTahunIni;
  }, [rekapKunjunganData, getMonthName]);

  const getTotalKunjunganBulanIni = useCallback(() => {
    if (!rekapKunjunganData?.bulan) return 0;
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const bulanIni = rekapKunjunganData.bulan.find((item: any) => {
      return parseInt(item.bulan) === currentMonth && 
             (!item.tahun || parseInt(item.tahun) === currentYear);
    });
    
    return bulanIni?.pengunjung || 0;
  }, [rekapKunjunganData]);

  const getTotalKunjunganTahunIni = useCallback(() => {
    if (!rekapKunjunganData?.bulan) return 0;
    
    const currentYear = new Date().getFullYear();
    
    const total = rekapKunjunganData.bulan
      .filter((item: any) => {
        return !item.tahun || parseInt(item.tahun) === currentYear;
      })
      .reduce((sum: number, item: { pengunjung: number }) => sum + (item.pengunjung || 0), 0);
    
    return total;
  }, [rekapKunjunganData]);

  const chartData = useMemo(() => getDataSemuaBulan(), [getDataSemuaBulan]);
  const totalKunjunganBulanIni = useMemo(() => getTotalKunjunganBulanIni(), [getTotalKunjunganBulanIni]);
  const totalKunjunganTahunIni = useMemo(() => getTotalKunjunganTahunIni(), [getTotalKunjunganTahunIni]);

  const loading = authLoading || loadingPending || loadingRekap || bookLoading;

  const RekapKunjunganChart = useMemo(
    () => dynamic(() => import('@/components/KunjunganChart'), { ssr: false }),
    []
  );

  // Prefetch routes
  useEffect(() => {
    if (isClient) {
      router.prefetch('/perpustakaan/kunjungan');
      router.prefetch('/perpustakaan/Daftar_Buku');
      router.prefetch('/admin_perpus');
      router.prefetch('/perpustakaan/registrasi_request');
      router.prefetch('/perpustakaan/kunjungan_buku');
    }
  }, [router, isClient]);

  // Show loading state while initializing
  if (!isClient || authLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-red-500 font-semibold">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Sesi Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Silakan login kembali untuk mengakses halaman ini.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Show loading overlay while fetching data */}
      {(loadingPending || loadingRekap) && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-red-500 font-semibold">Memuat data...</p>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-6 mt-16 md:mt-20 space-y-8">
        {/* Welcome Message */}
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            Selamat datang, {user?.username}
          </h1>
        </div>

        {/* Atas: Tambah Buku, Daftar Buku, Pengunjung, Review Buku, Persetujuan Buku */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 max-w-7xl w-full px-0">
            {[
              {
                title: 'Tambah Buku',
                icon: <FaPlus size={32} className="md:w-9 md:h-9 lg:w-10 lg:h-10" />,
                path: '/perpustakaan/Tambah_Buku',
                gradient: 'from-indigo-700 to-purple-600',
              },
              {
                title: 'Daftar Buku',
                icon: <FaBook size={32} className="md:w-9 md:h-9 lg:w-10 lg:h-10" />,
                path: '/perpustakaan/Daftar_Buku',
                gradient: 'from-rose-600 to-red-500',
              },
              {
                title: 'Pengunjung',
                icon: <FaUserCircle size={32} className="md:w-9 md:h-9 lg:w-10 lg:h-10" />,
                path: '/perpustakaan/kunjungan',
                gradient: 'from-green-600 to-emerald-500',
              },
              {
                title: 'Review Buku',
                icon: <FaBookOpen size={32} className="md:w-9 md:h-9 lg:w-10 lg:h-10" />,
                path: '/perpustakaan/kunjungan_buku',
                gradient: 'from-blue-600 to-cyan-500',
              },
              {
                title: 'Persetujuan Buku',
                icon: <FaCheck size={32} className="md:w-9 md:h-9 lg:w-10 lg:h-10" />,
                path: '/perpustakaan/persetujuan_buku',
                gradient: 'from-orange-600 to-amber-500',
              },
            ].map(({ title, icon, path, gradient }, index) => (
              <div
                key={index}
                onClick={() => handleNavigation(path)}
                className={`relative cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center aspect-square bg-gradient-to-tr ${gradient} text-white group`}
              >
                <div className="absolute inset-0">
                  <Image
                    src="/assets/texture/008.svg"
                    alt="texture"
                    fill
                    className="object-cover opacity-10 rounded-2xl"
                    priority={index === 0}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center p-2">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {icon}
                  </div>
                  <p className="mt-2 md:mt-3 font-bold italic text-lg sm:text-xl md:text-2xl lg:text-3xl leading-tight md:leading-snug group-hover:underline text-center">
                    {title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiga Kolom: Grafik Kunjungan, Top 3 Buku, Persetujuan Registrasi */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 md:mt-6 max-w-7xl w-full px-0">
            
            {/* Grafik Kunjungan Bulanan */}
            <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 p-5 rounded-2xl w-full">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base md:text-lg font-bold text-gray-800">
                  Grafik Kunjungan {new Date().getFullYear()}
                </h2>
                <button 
                  onClick={() => handleNavigation('/perpustakaan/kunjungan')}
                  className="text-xs md:text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Detail
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-red-600 p-3 rounded-lg">
                  <p className="text-xs text-white font-semibold">Bulan Ini</p>
                  <p className="text-xl font-bold text-white">{totalKunjunganBulanIni}</p>
                  <p className="text-xs text-white mt-1">
                    {new Date().toLocaleDateString('id-ID', { month: 'long' })}
                  </p>
                </div>
                <div className="bg-red-600 p-3 rounded-lg">
                  <p className="text-xs text-white font-semibold">Tahun Ini</p>
                  <p className="text-xl font-bold text-white">{totalKunjunganTahunIni}</p>
                  <p className="text-xs text-white mt-1">
                    {new Date().getFullYear()}
                  </p>
                </div>
              </div>

              {chartData.length > 0 ? (
                <RekapKunjunganChart data={chartData as any} />
              ) : (
                <div className="flex justify-center items-center h-48">
                  <p className="text-gray-500">Belum ada data kunjungan</p>
                </div>
              )}

              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  Grafik kunjungan per bulan di tahun {new Date().getFullYear()}
                </p>
              </div>
            </div>

            {/* Top 3 Buku Terpopuler */}
            <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 p-5 rounded-2xl w-full">
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="text-red-600" size={20} />
                Top 3 Buku Terpopuler
              </h2>

              {top3Buku.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {top3Buku.map((book, index) => (
                      <div key={book.book_id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          {index === 0 ? (
                            <Star className={getMedalColor(index)} size={24} fill="currentColor" />
                          ) : (
                            <div className={`text-xl font-bold ${getMedalColor(index)}`}>
                              #{index + 1}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0">
                          <div className="relative w-10 h-14">
                            <Image
                              src={getStorageUrl(book.cover_url)}
                              alt={book.judul}
                              fill
                              className="object-cover rounded-lg shadow-sm"
                              sizes="40px"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate" title={book.judul}>
                            {book.judul}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Kategori: {book.kategori}
                          </p>
                          <p className="text-red-600 font-bold text-xs mt-1">
                            {Number(book.total_kunjungan) || 0} pembaca
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 text-center">
                      Total <span className="font-bold text-red-600 text-sm">{totalKunjunganTop3}</span> kunjungan dari 3 buku terpopuler
                    </p>
                  </div>

                  <div className="mt-3 text-center">
                    <button 
                      onClick={() => handleNavigation('/perpustakaan/kunjungan_buku')}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Lihat Semua Buku →
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <p className="text-gray-500 text-sm">Belum ada data buku</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Belum ada kunjungan buku
                  </p>
                </div>
              )}
            </div>

            {/* Persetujuan Registrasi */}
            <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 p-5 rounded-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base md:text-lg font-bold text-gray-800">
                  Persetujuan Registrasi
                </h2>
                <button 
                  onClick={() => handleNavigation('/perpustakaan/registrasi_request')}
                  className="text-xs md:text-sm text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                >
                  Lihat Semua
                </button>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="flex justify-center items-center py-8 min-h-[160px]">
                  <p className="text-gray-500 text-sm md:text-base">Tidak ada permintaan registrasi</p>
                </div>
              ) : (
                <div className="max-h-[280px] md:max-h-[320px] overflow-y-auto pr-2 space-y-2">
                  {pendingUsers.slice(0, 5).map((userItem) => (
                    <div
                      key={userItem.id}
                      className="flex items-center justify-between border-b border-gray-200 py-3 hover:bg-gray-50 transition-colors duration-150 px-2 rounded-lg"
                    >
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        <FaUserCircle size={28} className="md:w-8 md:h-8 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs md:text-sm text-gray-700 truncate">
                            {userItem.username}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {userItem.role === 'Siswa'
                              ? `NIS: ${userItem.kode}`
                              : `NIP: ${userItem.kode}`}
                          </p>
                          <p className="text-xs text-gray-500 font-semibold truncate">
                            {userItem.sekolah}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {userItem.role.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 md:gap-3 flex-shrink-0 ml-2">
                        <button
                          onClick={() => handleApprove(userItem.id)}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50 p-1.5 rounded-full transition-all duration-200"
                          title="Setujui"
                        >
                          <FaCheck size={16} className="md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(userItem.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-all duration-200"
                          title="Tolak"
                        >
                          <FaTimes size={16} className="md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingUsers.length > 5 && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => handleNavigation('/perpustakaan/registrasi_request')}
                        className="text-xs md:text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        + {pendingUsers.length - 5} lainnya
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daftar Database */}
        <div className="flex justify-center w-full">
          <div className="relative w-full max-w-7xl h-48 md:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 group">
            <Image
              src="/assets/Admin/Card_Admin.png"
              alt="Daftar Database"
              fill
              sizes="100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 flex items-center justify-between">
              <p className="text-white font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-4xl leading-tight">
                Daftar Database
              </p>
              <button
                onClick={() => handleNavigation('/admin_perpus')}
                className="bg-white text-red-600 font-semibold text-xs md:text-sm py-2 px-6 md:px-8 rounded-full hover:bg-red-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Lanjut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}