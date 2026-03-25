'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/authContext';
import useAuthMiddleware from '@/hooks/auth';

function HomePage() {
  useAuthMiddleware();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is not null before accessing its properties
    if (user) {
      const role = user.role.toLowerCase();
      if (role === 'admin' || role === 'perpus' || role === 'pengurusperpustakaan') {
        router.push('/perpustakaan');
      } else if (role === 'guru') {
        router.push('/homepage_guru');
      } else {
        // tetap di halaman ini (untuk siswa)
      }
    }
  }, [user, router]); // Add `user` and `router` to the dependency array

  const handleButtonClick = (destination: string) => {
    const routes: Record<string, string> = {
      'User': '/profile',
      'SD': '/SD',
      'SMP': '/SMP',
      'SMK': '/SMK',
      'Non Akademik': '/lainnya',
    };

    if (routes[destination]) {
      router.push(routes[destination]);
    } else {
      console.error('Unknown destination:', destination);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-white">
      <Navbar />
      <header className="flex justify-between items-center pt-20 px-8">
        <div>
          <p className="text-xl font-semibold text-left font-poppins">Studi Anda</p>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-4">
        {[
          { title: 'SD', image: '/assets/Homepage-Front/sd.jpg' },
          { title: 'SMP', image: '/assets/Homepage-Front/smp.jpg' },
          { title: 'SMK', image: '/assets/Homepage-Front/smk.png' },
          { title: 'Non Akademik', image: '/assets/Homepage-Front/na.png' },
        ].map(({ title, image }) => (
          <div key={title} className="flex w-full h-56 md:h-64 bg-OldRed rounded-lg overflow-hidden">
            <div className="flex flex-col justify-end p-4 w-1/2">
              <p className="text-white font-bold italic text-3xl lg:text-4xl">{title}</p>
              <button
                onClick={() => handleButtonClick(title)}
                className="mt-2 bg-white text-OldRed font-semibold text-sm py-2 px-8 rounded-full min-w-28 max-w-40 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Lanjut
              </button>
            </div>
            <div className="relative w-1/2 h-full">
              <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover"/>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default HomePage;