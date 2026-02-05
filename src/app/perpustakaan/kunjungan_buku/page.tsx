'use client';

import KunjunganChart from '@/components/KunjunganChart_Books';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar_Lainnya_Perpus2';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBook } from '@/context/bookContext';
import Image from 'next/image'; // Untuk contoh perbaikan image

interface RekapKunjunganBook {
  book_id: number;
  judul: string;
  cover: string;
  kategori: string;
  sekolah: string | null;
  total_kunjungan: number;
  cover_url: string;
}

export default function KunjunganPage() {
  const [jenjang, setJenjang] = useState<'SD' | 'SMP' | 'SMK' | 'NA' | null>(null);
  const [kelas, setKelas] = useState<number | null>(null);
  const router = useRouter();

  const {
    fetchRekapKunjunganBooks,
    rekapKunjunganBooks,
    loading
  }: {
    fetchRekapKunjunganBooks: () => Promise<void>;
    rekapKunjunganBooks: RekapKunjunganBook[];
    loading: boolean;
  } = useBook();

  useEffect(() => {
    const loadData = async () => {
      await fetchRekapKunjunganBooks();
    };
    loadData();
  }, [fetchRekapKunjunganBooks]);

  useEffect(() => {
    if (!loading && jenjang === null) {
      setJenjang('SD');
      setKelas(null);
    }
  }, [loading, jenjang]);

  const toRoman = (num: number): string => {
    const roman: { [key: number]: string } = {
      1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
      7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII',
    };
    return roman[num] || `${num}`;
  };

  const renderKelasButtons = () => {
    if (!jenjang || jenjang === 'NA') return null;

    let range: number[] = [];
    if (jenjang === 'SD') range = [1, 2, 3, 4, 5, 6];
    if (jenjang === 'SMP') range = [7, 8, 9];
    if (jenjang === 'SMK') range = [10, 11, 12];

    return (
      <div className="flex gap-2 mt-2 flex-wrap justify-center">
        {range.map((num) => (
          <button
            key={num}
            onClick={() => setKelas(num)}
            className={`px-4 py-2 rounded-full font-medium transition-all border border-gray-300 shadow-sm ${
              kelas === num ? 'bg-OldRed text-white' : 'bg-white text-gray-700'
            }`}
            aria-pressed={kelas === num}
          >
            Kelas {num}
          </button>
        ))}
      </div>
    );
  };

  const bukuFilteredByJenjang = (() => {
    if (!jenjang) return [];

    if (jenjang === 'NA') {
      return rekapKunjunganBooks.filter(
        (book) => book.kategori === 'NA' || book.sekolah === null
      );
    }

    return rekapKunjunganBooks.filter((book) => book.sekolah === jenjang);
  })();

  const bukuPalingSeringDibaca = bukuFilteredByJenjang[0];

  const filteredChartData = bukuFilteredByJenjang
    .filter((book) => {
      if (!kelas) return true;
      if (book.kategori === 'NA') return true;
      return book.kategori === toRoman(kelas);
    })
    .map((book) => ({
      name: book.judul,
      total_kunjungan: book.total_kunjungan,
    }));

  return (
    <div className="min-h-screen px-6 mt-6 pt-20 bg-gray-50 p-4 relative" aria-busy={loading}>
      <Navbar />

      <button
        onClick={() => router.back()}
        className="mb-4 text-gray-600 hover:text-red transition-colors"
        aria-label="Kembali"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Fullscreen white loading overlay */}
      {loading && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-white"
          role="alert"
          aria-live="assertive"
          aria-label="Memuat data"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-red-600 font-semibold text-lg">Memuat...</p>
        </div>
      )}

      <div className={`${loading ? 'opacity-30 pointer-events-none' : ''} grid grid-cols-1 md:grid-cols-2 gap-6`}>
        <div className="w-full h-fit bg-white shadow-lg rounded-xl p-4 border border-gray-200">
          {!loading && filteredChartData.length > 0 ? (
            <KunjunganChart data={filteredChartData} />
          ) : (
            !loading && (
              <div className="flex items-center justify-center h-64">
                <p>Tidak ada Data</p>
              </div>
            )
          )}

          <div className="flex justify-center mt-6 gap-4 flex-wrap">
            {['SD', 'SMP', 'SMK', 'NA'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setJenjang(item as any);
                  setKelas(null);
                }}
                className={`px-5 py-2 rounded-full font-semibold shadow-sm transition-all duration-200 ${
                  jenjang === item
                    ? 'bg-OldRed text-white scale-105'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                aria-pressed={jenjang === item}
              >
                {item}
              </button>
            ))}
          </div>

          {renderKelasButtons()}
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Buku yang paling sering dibaca
          </h2>

          {!loading ? (
            bukuPalingSeringDibaca ? (
              <>
             <div className="w-full max-w-[112px] mx-auto">
  <div className="relative aspect-[3/4]"> {/* 3:4 aspect ratio (120:160) */}
    <Image
      src={`http://localhost:8000${bukuPalingSeringDibaca.cover_url}`}
      alt={bukuPalingSeringDibaca.judul}
      fill
      className="object-cover rounded mb-4"
      sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 112px"
      priority={true}
      // style = {{width:'auto', height:'auto'}}
    />
  </div>
</div>
                <p className="text-lg font-semibold text-gray-700 mb-2 max-w-xs">
                  {bukuPalingSeringDibaca.judul}
                </p>
                <p className="text-red font-bold">
                  sebanyak {bukuPalingSeringDibaca.total_kunjungan} pembaca
                </p>
              </>
            ) : (
              <p className="text-gray-500">Belum ada data buku dari jenjang ini</p>
            )
          ) : (
            <div className="flex flex-col justify-center items-center h-40 gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-red-600"></div>
              <p className="text-red-600 font-medium text-base">Memuat...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
