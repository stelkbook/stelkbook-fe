'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar_Lainnya_Perpus2';
import { useRouter } from 'next/navigation';
import useAuthMiddleware from '@/hooks/auth';
import useRoleGuard from '@/hooks/roleGuard';
import { useAuth } from '@/context/authContext';
import { useBook } from '@/context/bookContext';
import { FaCheck, FaTimes, FaUserCircle, FaFilePdf } from 'react-icons/fa';
import { getStorageUrl } from '@/helpers/storage';

export default function PersetujuanBukuPage() {
  useAuthMiddleware();
  useRoleGuard(['Admin', 'Perpus', 'PengurusPerpustakaan']);
  
  const router = useRouter();
  const { user } = useAuth();
  const { pendingUploads, fetchPendingUploads, approveBookUpload, declineBookUpload } = useBook();
  
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      const role = user.role.toLowerCase();
      if (!['admin', 'perpus', 'pengurusperpustakaan'].includes(role)) {
        router.push('/');
      }
    }
  }, [user, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPendingUploads();
      } catch (error) {
        console.error("Failed to fetch pending books:", error);
      } finally {
        setLoadingInitial(false);
      }
    };
    loadData();
  }, [fetchPendingUploads]);

  const handleApprove = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui ajuan buku ini?')) return;
    
    setProcessingId(id);
    try {
      // Create empty formData, as backend mostly just changes status to approved
      const formData = new FormData();
      formData.append('_method', 'POST');
      await approveBookUpload(id, formData);
      alert('Buku berhasil disetujui!');
      fetchPendingUploads();
    } catch (error) {
      console.error("Failed to approve book:", error);
      alert('Gagal menyetujui buku');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin MENOLAK ajuan buku ini? Data akan dihapus.')) return;
    
    setProcessingId(id);
    try {
      await declineBookUpload(id);
      alert('Ajuan buku berhasil ditolak.');
      fetchPendingUploads();
    } catch (error) {
      console.error("Failed to decline book:", error);
      alert('Gagal menolak buku');
    } finally {
      setProcessingId(null);
    }
  };

  if (loadingInitial) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-red-500 font-semibold">Memuat data pengajuan buku...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      <div className="px-4 sm:px-6 lg:px-8 mt-24 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Persetujuan Ajuan Buku</h1>
          <button
            onClick={() => router.push('/perpustakaan')}
            className="text-gray-600 hover:text-red-600 font-medium bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow"
          >
            ← Kembali
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {(!pendingUploads || pendingUploads.length === 0) ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaCheck className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">Semua Beres!</h3>
              <p className="text-gray-500 mt-2">Tidak ada pengajuan buku yang menunggu persetujuan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4 font-semibold">Data Buku</th>
                    <th className="px-6 py-4 font-semibold">Pengunggah / Biodata</th>
                    <th className="px-6 py-4 font-semibold">File PDF</th>
                    <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingUploads.map((book: any) => (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800">{book.judul || 'Tanpa Judul'}</p>
                        <div className="mt-1 text-xs text-gray-500 space-y-1">
                          <p><span className="font-semibold">Kategori:</span> {book.kategori || book.kelas || '-'}</p>
                          <p><span className="font-semibold">Penulis:</span> {book.penulis || '-'}</p>
                          <p><span className="font-semibold">Penerbit:</span> {book.penerbit || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <FaUserCircle className="text-gray-400 text-2xl mt-1 shrink-0" />
                          <div className="text-xs text-gray-600 whitespace-pre-line leading-relaxed max-w-[250px]">
                            {book.deskripsi || 'Siswa / Guru (Data Tidak Lengkap)'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {book.isi || book.file_pdf ? (
                          <a 
                            href={getStorageUrl(book.isi || book.file_pdf)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-xs rounded-lg transition-colors border border-blue-100"
                          >
                            <FaFilePdf /> Lihat PDF
                          </a>
                        ) : (
                          <span className="text-xs italic text-gray-400">Tidak ada PDF</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            disabled={processingId === book.id}
                            onClick={() => handleApprove(book.id)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                            title="Setujui Ajuan"
                          >
                            <FaCheck />
                          </button>
                          <button
                            disabled={processingId === book.id}
                            onClick={() => handleReject(book.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            title="Tolak Ajuan"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
