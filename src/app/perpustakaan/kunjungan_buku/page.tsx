'use client';

import KunjunganChart from '@/components/KunjunganChart_Books';
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar_Lainnya_Perpus2';
import { ArrowLeft, TrendingUp, Award, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBook } from '@/context/bookContext';
import { getStorageUrl } from '@/helpers/storage';
import Image from 'next/image';

interface RekapKunjunganBook {
  book_id: number;
  judul: string;
  cover: string;
  kategori: string;
  sekolah: string | null;
  total_kunjungan: number; // ini harus number, bukan string
  cover_url: string;
}

interface KunjunganBook {
  id: number;
  book_id: number;
  user_id: number | null;
  username: string | null;
  judul: string;
  cover: string;
  cover_url: string | null;
  created_at: string;
  sekolah: string | null;
  kategori: string | null;
}

type JenjangType = 'All' | 'SD' | 'SMP' | 'SMK' | 'NA';

export default function KunjunganPage() {
  const [jenjang, setJenjang] = useState<JenjangType>('All');
  const [kelas, setKelas] = useState<number | null>(null);
  const router = useRouter();

  const {
    fetchRekapKunjunganBooks,
    rekapKunjunganBooks,
    fetchKunjunganBooks,
    kunjunganBooks,
    loading
  } = useBook();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchRekapKunjunganBooks(), fetchKunjunganBooks()]);
    };
    loadData();
  }, [fetchRekapKunjunganBooks, fetchKunjunganBooks]);

  const toRoman = (num: number): string => {
    const roman: Record<number, string> = {
      1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
      7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII',
    };
    return roman[num] || num.toString();
  };

  const renderKelasButtons = () => {
    if (jenjang === 'NA' || jenjang === 'All') return null;

    let range: number[] = [];
    if (jenjang === 'SD') range = [1, 2, 3, 4, 5, 6];
    if (jenjang === 'SMP') range = [7, 8, 9];
    if (jenjang === 'SMK') range = [10, 11, 12];

    return (
      <div className="flex gap-2 mt-2 flex-wrap justify-center">
        {range.map((num) => (
          <button
            key={num}
            onClick={() => setKelas(kelas === num ? null : num)}
            className={`px-4 py-2 rounded-full font-medium transition-all border border-gray-300 shadow-sm ${
              kelas === num ? 'bg-OldRed text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            aria-pressed={kelas === num}
          >
            Kelas {num}
          </button>
        ))}
      </div>
    );
  };

  // Filter data based on jenjang
  const bukuFilteredByJenjang = useMemo(() => {
    if (!rekapKunjunganBooks) return [];

    if (jenjang === 'All') {
      return rekapKunjunganBooks;
    }

    if (jenjang === 'NA') {
      return rekapKunjunganBooks.filter(
        (book:any) => book.kategori === 'NA' || book.sekolah === null
      );
    }

    return rekapKunjunganBooks.filter((book:any) => book.sekolah === jenjang);
  }, [rekapKunjunganBooks, jenjang]);

  // Filter berdasarkan kelas
  const bukuFilteredByKelas = useMemo(() => {
    if (!bukuFilteredByJenjang) return [];
    
    return bukuFilteredByJenjang.filter((book:any) => {
      if (!kelas) return true;
      if (book.kategori === 'NA') return false;
      return book.kategori === toRoman(kelas);
    });
  }, [bukuFilteredByJenjang, kelas]);

  // Get top 3 most read books - PASTIKAN total_kunjungan adalah NUMBER
  const top3Buku = useMemo(() => {
    if (!bukuFilteredByKelas || bukuFilteredByKelas.length === 0) return [];
    
    return [...bukuFilteredByKelas]
      .sort((a, b) => {
        // Pastikan kita membandingkan sebagai number
        const totalA = Number(a.total_kunjungan) || 0;
        const totalB = Number(b.total_kunjungan) || 0;
        return totalB - totalA;
      })
      .slice(0, 3);
  }, [bukuFilteredByKelas]);

  // Hitung total kunjungan top 3 buku - DENGAN MEMASTIKAN NUMBER
  const totalKunjunganTop3 = useMemo(() => {
    return top3Buku.reduce((acc, book) => {
      // Konversi ke number untuk memastikan
      const kunjungan = Number(book.total_kunjungan) || 0;
      return acc + kunjungan;
    }, 0);
  }, [top3Buku]);

  // Get medal color based on rank
  const getMedalColor = (rank: number): string => {
    switch(rank) {
      case 0: return 'text-yellow-500'; // Gold
      case 1: return 'text-gray-400';   // Silver
      case 2: return 'text-amber-600';  // Bronze
      default: return 'text-gray-300';
    }
  };

  const filteredChartData = useMemo(() => {
    if (!bukuFilteredByKelas || bukuFilteredByKelas.length === 0) {
      return [{ name: 'Tidak Ada Data', total_kunjungan: 0 }];
    }
    
    return bukuFilteredByKelas
      .map((book:any) => ({
        name: book.judul.length > 30 ? book.judul.substring(0, 30) + '...' : book.judul,
        total_kunjungan: Number(book.total_kunjungan) || 0, // Konversi ke number
      }))
      .sort((a:any, b:any) => b.total_kunjungan - a.total_kunjungan)
      .slice(0, 10);
  }, [bukuFilteredByKelas]);

  // Filter Data Riwayat Kunjungan Buku
  const filteredKunjunganBooks = useMemo(() => {
    if (!kunjunganBooks) return [];

    return kunjunganBooks.filter((item:any) => {
      // Filter by Jenjang
      if (jenjang === 'NA') {
        if (item.kategori !== 'NA' && item.sekolah !== null) return false;
      } else if (jenjang !== 'All') {
        if (item.sekolah !== jenjang) return false;
      }

      // Filter by Kelas
      if (kelas) {
        if (item.kategori === 'NA') return false;
        if (item.kategori !== toRoman(kelas)) return false;
      }

      return true;
    });
  }, [kunjunganBooks, jenjang, kelas]);

  const handleJenjangChange = (newJenjang: JenjangType) => {
    setJenjang(newJenjang);
    setKelas(null);
  };

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

      <div className={`${loading ? 'opacity-30 pointer-events-none' : ''} grid grid-cols-1 lg:grid-cols-3 gap-6`}>
        {/* Chart Section - Lebar 2 kolom di lg */}
        <div className="lg:col-span-2 w-full h-fit bg-white shadow-lg rounded-xl p-4 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-OldRed" size={24} />
            Grafik Kunjungan Buku
            {kelas && <span className="text-sm font-normal text-gray-500">(Kelas {kelas})</span>}
          </h2>
          
          {!loading ? (
            filteredChartData.length > 0 && filteredChartData[0].name !== 'Tidak Ada Data' ? (
              <KunjunganChart data={filteredChartData} />
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-red-600"></div>
            </div>
          )}

          {/* Jenjang Filter Buttons */}
          <div className="flex justify-center mt-6 gap-4 flex-wrap">
            {(['All', 'SD', 'SMP', 'SMK', 'NA'] as JenjangType[]).map((item) => (
              <button
                key={item}
                onClick={() => handleJenjangChange(item)}
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

          {/* Kelas Filter Buttons */}
          {renderKelasButtons()}
        </div>

        {/* Top 3 Books Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award className="text-OldRed" size={24} />
            Top 3 Buku Terpopuler
            {kelas && <span className="text-sm font-normal text-gray-500">(Kelas {kelas})</span>}
          </h2>

          {!loading ? (
            top3Buku.length > 0 ? (
              <>
                <div className="space-y-6">
                  {top3Buku.map((book, index) => (
                    <div key={book.book_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      {/* Peringkat */}
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                        {index === 0 ? (
                          <Star className={getMedalColor(index)} size={32} fill="currentColor" />
                        ) : (
                          <div className={`text-2xl font-bold ${getMedalColor(index)}`}>
                            #{index + 1}
                          </div>
                        )}
                      </div>
                      
                      {/* Cover Buku */}
                      <div className="flex-shrink-0">
                        <div className="relative w-16 h-20">
                          <Image
                            src={getStorageUrl(book.cover_url)}
                            alt={book.judul}
                            fill
                            className="object-cover rounded-lg shadow-sm"
                            sizes="64px"
                          />
                        </div>
                      </div>
                      
                      {/* Info Buku */}
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-gray-800 truncate" title={book.judul}>
                          {book.judul}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Kategori: {book.kategori}
                        </p>
                        <p className="text-OldRed font-bold mt-1">
                          {Number(book.total_kunjungan) || 0} pembaca
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total Statistik Top 3 - INI YANG DIPERBAIKI */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Total <span className="font-bold text-OldRed text-lg">{totalKunjunganTop3}</span> kunjungan dari 3 buku terpopuler
                  </p>
                  {/* Contoh jika 27 + 26 = 53, akan tampil 53, bukan 2.726 */}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-gray-500">Belum ada data buku</p>
                <p className="text-sm text-gray-400 mt-1">
                  untuk jenjang {jenjang} {kelas && `kelas ${kelas}`}
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-red-600"></div>
              <p className="text-red-600 font-medium text-base">Memuat...</p>
            </div>
          )}
        </div>
      </div>

      {/* History Table Section */}
      <div className="mt-8 bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-OldRed" size={20} />
          Riwayat Kunjungan Buku
          {kelas && <span className="text-sm font-normal text-gray-500">(Kelas {kelas})</span>}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="py-3 px-4 text-gray-600 font-semibold">Cover</th>
                <th className="py-3 px-4 text-gray-600 font-semibold">Judul Buku</th>
                <th className="py-3 px-4 text-gray-600 font-semibold">Pembaca</th>
                <th className="py-3 px-4 text-gray-600 font-semibold">Kelas</th>
                <th className="py-3 px-4 text-gray-600 font-semibold">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {!loading ? (
                filteredKunjunganBooks.length > 0 ? (
                  filteredKunjunganBooks.map((item:any) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="relative w-12 h-16">
                          <Image
                            src={getStorageUrl(item.cover_url)}
                            alt={item.judul}
                            fill
                            className="object-cover rounded"
                            sizes="48px"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium">{item.judul}</td>
                      <td className="py-3 px-4 text-gray-800">
                        {item.username ? (
                          <span className="font-medium">{item.username}</span>
                        ) : (
                          <span className="text-gray-400 italic">Anonim</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {item.kategori || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(item.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Belum ada riwayat kunjungan buku untuk kategori ini.
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                      <p className="text-gray-500">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}