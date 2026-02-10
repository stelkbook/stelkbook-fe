'use client';

import KunjunganChart from '@/components/KunjunganChart';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar_Lainnya_Perpus2';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/context/authContext';

interface KunjunganUser {
  username: string;
  kode?: string;
  tanggal_kunjungan?: string;
}

export default function KunjunganPage() {
  const [mode, setMode] = useState<'hari' | 'bulan' | 'tahun'>('hari');
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { 
    rekapKunjunganData, 
    fetchRekapKunjungan,
    kunjunganData,
    fetchKunjungan,
    allKunjunganData,
    fetchAllHistoryKunjungan
  } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchRekapKunjungan(), 
          fetchKunjungan(),
          fetchAllHistoryKunjungan()
        ]);
      } catch (error) {
        console.error("Gagal memuat data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchRekapKunjungan, fetchKunjungan, fetchAllHistoryKunjungan]);

  const getMonthName = (month: string) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[parseInt(month) - 1] || month;
  };

  const getData = () => {
    if (!rekapKunjunganData) return [];
    switch (mode) {
      case 'bulan':
        return (rekapKunjunganData.bulan || []).map((item: any) => ({
          ...item,
          name: getMonthName(item.bulan),
        }));
      case 'tahun':
        return rekapKunjunganData.tahun || [];
      default:
        return rekapKunjunganData.hari || [];
    }
  };

  const total7Hari = rekapKunjunganData?.hari?.reduce(
    (sum: number, item: { pengunjung: number }) => sum + (item.pengunjung || 0),
    0
  ) || 0;

  const totalBulan = rekapKunjunganData?.bulan?.reduce(
    (sum: number, item: { pengunjung: number }) => sum + (item.pengunjung || 0),
    0
  ) || 0;

  const totalTahun = rekapKunjunganData?.tahun?.reduce(
    (sum: number, item: { pengunjung: number }) => sum + (item.pengunjung || 0),
    0
  ) || 0;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
        <p className="text-red-600 font-medium text-lg">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 mt-6 pt-20 bg-gray-50 p-4">
      <Navbar />

      <button 
        onClick={() => router.back()} 
        className="mb-4 text-gray-600 hover:text-red transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="w-full h-fit bg-white shadow-lg rounded-xl p-4 border border-gray-200">
          <KunjunganChart data={getData()} />

          <div className="flex justify-center mt-6 gap-4 flex-wrap">
            {['hari', 'bulan', 'tahun'].map((item) => (
              <button
                key={item}
                onClick={() => setMode(item as 'hari' | 'bulan' | 'tahun')}
                className={`px-5 py-2 rounded-full font-semibold shadow-sm transition-all duration-200 ${
                  mode === item
                    ? 'bg-OldRed text-white scale-105'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {item === 'hari' ? 'Hari' : 
                 item === 'bulan' ? 'Bulan' : 
                 'Tahun'}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col gap-6">
          {/* Visitors Box with Tabs */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('today')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'today'
                      ? 'bg-white text-red shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'history'
                      ? 'bg-white text-red shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Riwayat
                </button>
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                <span className="text-red font-semibold">
                  {activeTab === 'today' 
                    ? (kunjunganData?.length || 0) 
                    : (allKunjunganData?.length || 0)}
                </span> Pengunjung
              </h2>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activeTab === 'today' ? (
                kunjunganData && kunjunganData.length > 0 ? (
                  kunjunganData.map((user: KunjunganUser, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 border-gray-200">
                      <div className="flex items-center gap-3">
                        <FaUserCircle size={32} className="text-red" />
                        <div>
                          <p className="font-medium text-gray-800">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.kode || 'N/A'}</p>
                        </div>
                      </div>
                      {user.tanggal_kunjungan && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-medium">Jam Login</p>
                          <p className="text-sm text-gray-800 font-semibold">
                            {new Date(user.tanggal_kunjungan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Belum ada kunjungan hari ini</p>
                )
              ) : (
                allKunjunganData && allKunjunganData.length > 0 ? (
                  allKunjunganData.map((user: KunjunganUser, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 border-gray-200">
                      <div className="flex items-center gap-3">
                        <FaUserCircle size={32} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.kode || 'N/A'}</p>
                        </div>
                      </div>
                      {user.tanggal_kunjungan && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(user.tanggal_kunjungan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(user.tanggal_kunjungan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Belum ada riwayat kunjungan</p>
                )
              )}
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Ringkasan Kunjungan</h3>
            <div className="space-y-2">
              <p className="font-medium text-gray-700">
                Kunjungan 7 Hari Terakhir: <span className="text-OldRed font-semibold">{total7Hari} pengunjung</span>
              </p>
              <p className="font-medium text-gray-700">
                Kunjungan Bulan Ini: <span className="text-OldRed font-semibold">{totalBulan} pengunjung</span>
              </p>
              <p className="font-medium text-gray-700">
                Kunjungan Tahun Ini: <span className="text-OldRed font-semibold">{totalTahun} pengunjung</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
