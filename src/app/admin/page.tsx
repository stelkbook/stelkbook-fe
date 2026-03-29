'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar_Lainnya_Admin';
import useAuthMiddleware from '@/hooks/auth';
import { useAuth } from '@/context/authContext';
import { useEffect } from 'react';

function HomePage() {
  useAuthMiddleware();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    router.prefetch('/perpustakaan');
    router.prefetch('/homepage_guru');
    router.prefetch('/homepage');
    router.prefetch('/admin');
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const role = (user.role || '').toLowerCase();
    if (role === 'admin') return;
    if (role === 'guru') {
      router.push('/homepage_guru');
      return;
    }
    if (role === 'perpus' || role === 'pengurusperpustakaan') {
      router.push('/perpustakaan');
      return;
    }
    router.push('/homepage');
  }, [user, router]);

  const handleButtonClick = (destination: string) => {
    switch (destination) {
      case 'User':
        router.push('/profile');
        break;
      case 'Siswa':
        router.push('/admin/Sekolah_Siswa');
        break;
      case 'Guru':
        router.push('/admin/Sekolah_Guru');
        break;
      case 'Pengurus Perpus':
        router.push('/admin/Data_perpus');
        break;
      case 'Membuat User':
        router.push('/admin/Create_User');
        break;
      case 'Persetujuan Buku':
        router.push('/admin/Persetujuan_Buku');
        break;
      default:
        console.error('Unknown destination:', destination);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-white">
      <Navbar />
      <header className="flex justify-between items-center pt-20 px-8">
        <div>
          <p className="text-xl font-semibold text-left font-poppins">Database Anda</p>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-6 pt-4 pb-12">
        {/* Siswa*/}
        <div className="relative w-full h-56 md:h-64 mx-auto">
          <Image
            src="/assets/Admin/Card_Admin.png"
            alt="Siswa"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-lg object-cover"
            // priority = {true}
          />
          <div className="absolute bottom-4 left-4">
            <p className="text-white font-bold italic text-3xl lg:text-4xl">Siswa</p>
            <button
              onClick={() => handleButtonClick('Siswa')}
              className="mt-2 bg-white text-red font-semibold text-sm py-2 px-8 rounded-full"
            >
              Lanjut
            </button>
          </div>
        </div>

        {/* Guru */}
        <div className="relative w-full h-56 md:h-64 mx-auto">
          <Image
            src="/assets/Admin/Card_Admin.png"
            alt="Guru"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-lg object-cover"
            priority = {false}
          />
          <div className="absolute bottom-4 left-4">
            <p className="text-white font-bold italic text-3xl lg:text-4xl">Guru</p>
            <button
              onClick={() => handleButtonClick('Guru')}
              className="mt-2 bg-white text-red font-semibold text-sm py-2 px-8 rounded-full"
            >
              Lanjut
            </button>
          </div>
        </div>

        {/* Pengurus Perpustakaan */}
        <div className="relative w-full h-56 md:h-64 mx-auto">
          <Image
            src="/assets/Admin/Card_Admin.png"
            alt="Pengurus Perpus"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-lg object-cover"
            priority = {false}
          />
          <div className="absolute bottom-4 left-4">
            <p className="text-white font-bold italic text-3xl lg:text-4xl">Pengurus Perpustakaan</p>
            <button
              onClick={() => handleButtonClick('Pengurus Perpus')}
              className="mt-2 bg-white text-red font-semibold text-sm py-2 px-8 rounded-full"
            >
              Lanjut
            </button>
          </div>
        </div>

        {/* Membuat User */}
        <div className="relative w-full h-56 md:h-64 mx-auto">
          <Image
            src="/assets/Admin/Card_Admin.png"
            alt="Membuat User"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-lg object-cover"
            priority = {false}
          />
          <div className="absolute bottom-4 left-4">
            <p className="text-white font-bold italic text-3xl lg:text-4xl">Membuat User</p>
            <button
              onClick={() => handleButtonClick('Membuat User')}
              className="mt-2 bg-white text-red font-semibold text-sm py-2 px-8 rounded-full"
            >
              Lanjut
            </button>
          </div>
        </div>

        {/* Persetujuan Buku */}
        <div className="relative w-full h-56 md:h-64 mx-auto">
          <Image
            src="/assets/Admin/Card_Admin.png"
            alt="Persetujuan Buku"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-lg object-cover"
            priority = {false}
          />
          <div className="absolute bottom-4 left-4">
            <p className="text-white font-bold italic text-3xl lg:text-4xl">Persetujuan Buku</p>
            <button
              onClick={() => handleButtonClick('Persetujuan Buku')}
              className="mt-2 bg-white text-red font-semibold text-sm py-2 px-8 rounded-full"
            >
              Lanjut
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
