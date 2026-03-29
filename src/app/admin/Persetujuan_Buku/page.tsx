'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar_Lainnya_Admin';
import { useBook } from '@/context/bookContext';
import { Check, X, FileText, User, Book as BookIcon, Loader2, ExternalLink } from 'lucide-react';

interface PendingBook {
  id: number;
  judul: string;
  kategori: string;
  kelas: string;
  penulis: string;
  penerbit: string;
  deskripsi: string;
  isi: string;
  created_at: string;
}

const PersetujuanBukuPage = () => {
  const router = useRouter();
  const { pendingUploads, fetchPendingUploads, approveBookUpload, declineBookUpload, loading } = useBook();
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingUploads();
  }, [fetchPendingUploads]);

  const handleApprove = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui buku ini?')) return;
    
    setProcessingId(id);
    try {
      // We can send extra data if we want to override category/etc.
      // For now, we just approve with existing data
      await approveBookUpload(id, new FormData());
      alert('Buku berhasil disetujui!');
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Gagal menyetujui buku.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menolak pengajuan buku ini?')) return;
    
    setProcessingId(id);
    try {
      await declineBookUpload(id);
      alert('Pengajuan buku ditolak.');
    } catch (error) {
      console.error('Failed to decline:', error);
      alert('Gagal menolak pengajuan.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBack = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb style header */}
        <div className="flex items-center gap-2 mb-8">
          <h1 
            onClick={handleBack}
            className="text-xl font-bold text-gray-800 cursor-pointer hover:underline"
          >
            Database Anda
          </h1>
          <Image src="/assets/Kelas_X/Primary_Direct.png" alt="Divider" width={10} height={16} />
          <h2 className="text-xl font-bold text-gray-800">Persetujuan Buku</h2>
        </div>

        {loading && pendingUploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Memuat data pengajuan...</p>
          </div>
        ) : pendingUploads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
              <BookIcon size={40} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Tidak Ada Pengajuan</h3>
            <p className="text-gray-500">Saat ini tidak ada buku yang menunggu persetujuan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingUploads.map((book: PendingBook) => (
              <div 
                key={book.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                {/* Book Info */}
                <div className="p-6 flex-grow flex flex-col md:flex-row gap-6">
                  {/* File Icon / Preview Placeholder */}
                  <div className="w-full md:w-32 h-44 bg-red-50 rounded-xl flex flex-col items-center justify-center text-red-500 border border-red-100 shrink-0">
                    <FileText size={48} />
                    <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">PDF Document</span>
                  </div>

                  <div className="flex-grow space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{book.judul}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">
                          Kategori: {book.kategori || '-'}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">
                          Kelas: {book.kelas || '-'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <User size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Penulis</p>
                          <p className="font-semibold text-gray-700">{book.penulis || 'Tidak diketahui'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <BookIcon size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Penerbit</p>
                          <p className="font-semibold text-gray-700">{book.penerbit || 'Tidak diketahui'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50">
                      <p className="text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">Informasi Pengaju</p>
                      <p className="text-sm text-blue-800 leading-relaxed italic">
                        {book.deskripsi || 'Tidak ada informasi tambahan.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 p-6 flex flex-row md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 w-full md:w-56">
                  <a 
                    href={book.isi} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-xl border border-gray-200 transition-all text-sm"
                  >
                    <ExternalLink size={16} />
                    Lihat PDF
                  </a>
                  
                  <div className="flex gap-3 flex-1 md:flex-none">
                    <button
                      onClick={() => handleDecline(book.id)}
                      disabled={processingId !== null}
                      className="flex-1 flex items-center justify-center bg-white hover:bg-red-50 text-red-500 font-bold py-2.5 px-4 rounded-xl border border-red-200 transition-all text-sm disabled:opacity-50"
                      title="Tolak"
                    >
                      {processingId === book.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <X size={20} />}
                    </button>
                    <button
                      onClick={() => handleApprove(book.id)}
                      disabled={processingId !== null}
                      className="flex-[2] flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-green-200 transition-all text-sm disabled:opacity-50"
                    >
                      {processingId === book.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Check size={20} />
                          Setujui
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PersetujuanBukuPage;
