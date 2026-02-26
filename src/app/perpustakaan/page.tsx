'use client';

import Image from 'next/image';
import { FaUserCircle, FaCheck, FaTimes, FaPlus, FaBook } from 'react-icons/fa';
import Navbar from '@/components/Navbar_Lainnya_Perpus2';
import { useRouter } from 'next/navigation';
import useAuthMiddleware from '@/hooks/auth';
import { useAuth } from '@/context/authContext';
import { useEffect, useState } from 'react';
import { FaBookOpen } from 'react-icons/fa6';

export default function Home() {
  useAuthMiddleware();
  const router = useRouter();
  const { user, fetchPendingUsers, approveUser, rejectUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);

  // Cek status user & redirect
  useEffect(() => {
    if (user) {
      setLoadingUser(false);
      const role = user.role.toLowerCase();
      if (role === 'admin' || role === 'perpus' || role === 'pengurusperpustakaan') {
        // tetap di halaman ini
      } else if (role === 'guru') {
        router.push('/homepage_guru');
      } else {
        router.push('/homepage');
      }
    }
  }, [user, router]);

  // Ambil pending users
  useEffect(() => {
    const loadPendingUsers = async () => {
      try {
        const users = await fetchPendingUsers();
        setPendingUsers(users);
      } catch (error) {
        console.error("Failed to fetch pending users:", error);
      } finally {
        setLoadingPending(false);
      }
    };
    loadPendingUsers();
  }, [fetchPendingUsers]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleApprove = async (id: number) => {
    try {
      await approveUser(id);
      const updatedUsers = await fetchPendingUsers();
      setPendingUsers(updatedUsers);
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectUser(id);
      const updatedUsers = await fetchPendingUsers();
      setPendingUsers(updatedUsers);
    } catch (error) {
      console.error("Failed to reject user:", error);
    }
  };

  const loading = loadingUser || loadingPending;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Spinner merah full halaman sampai user & pendingUsers siap */}
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-red-500 font-semibold">Memuat...</p>
        </div>
      )}

      <Navbar />

      {!loading && (
        <div className="px-4 sm:px-6 lg:px-8 py-6 mt-16 md:mt-20 space-y-8">
          {/* Welcome Message */}
          <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Selamat datang, {user?.username}
            </h1>
          </div>

          {/* Atas: Tambah Buku, Daftar Buku, Pengunjung, Kunjungan Buku */}
          <div className="flex justify-center w-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl w-full px-0">
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

          {/* Bawah: Persetujuan Registrasi & Daftar Database */}
          <div className="flex justify-center w-full">
            <div className="flex flex-col lg:flex-row gap-6 mt-4 md:mt-6 max-w-7xl w-full px-0">
              
              {/* Persetujuan Registrasi */}
              <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 p-5 rounded-2xl w-full lg:w-1/2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base md:text-lg font-bold text-gray-800">
                    Persetujuan Registrasi
                  </h2>
                  <button 
                    onClick={() => router.push('/perpustakaan/registrasi_request')}
                    className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
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
                    {pendingUsers.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between border-b border-gray-200 py-3 hover:bg-gray-50 transition-colors duration-150 px-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                          <FaUserCircle size={28} className="md:w-8 md:h-8 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-xs md:text-sm text-gray-700 truncate">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.role === 'Siswa'
                                ? `NIS: ${user.kode}`
                                : `NIP: ${user.kode}`}
                            </p>
                            <p className="text-xs text-gray-500 font-semibold truncate">
                              {user.sekolah}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {user.role.toLowerCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 md:gap-3 flex-shrink-0 ml-2">
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="text-green-500 hover:text-green-700 hover:bg-green-50 p-1.5 rounded-full transition-all duration-200"
                            title="Setujui"
                          >
                            <FaCheck size={16} className="md:w-4 md:h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
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
                          onClick={() => router.push('/perpustakaan/registrasi_request')}
                          className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          + {pendingUsers.length - 5} lainnya
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Daftar Database */}
              <div className="relative w-full lg:w-1/2 h-48 md:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 group">
                <Image
                  src="/assets/Admin/Card_Admin.png"
                  alt="Daftar Database"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4">
                  <p className="text-white font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-4xl leading-tight">
                    Daftar Database
                  </p>
                  <button
                    onClick={() => handleNavigation('/admin_perpus')}
                    className="mt-2 md:mt-3 bg-white text-red font-semibold text-xs md:text-sm py-2 px-6 md:px-8 rounded-full hover:bg-red hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Lanjut
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}