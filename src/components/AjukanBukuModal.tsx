'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, Clock, User, Book } from 'lucide-react';
import { useBook } from '@/context/bookContext';
import { useAuth } from '@/context/authContext';

interface AjukanBukuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AjukanBukuModal: React.FC<AjukanBukuModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addBook } = useBook();

  const [file, setFile] = useState<File | null>(null);
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('');
  const [penulis, setPenulis] = useState('');
  const [penerbit, setPenerbit] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'waiting'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when opened/closed
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setJudul('');
      setKategori('');
      setPenulis('');
      setPenerbit('');
      setUploadStatus('idle');
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        if (!judul) setJudul(selectedFile.name.replace('.pdf', ''));
      } else {
        alert('Mohon unggah file PDF yang valid.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !judul || !user) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('isi', file);
    formData.append('kategori', kategori || (user.sekolah || 'Umum'));
    formData.append('kelas', user.kelas || '');
    formData.append('penulis', penulis);
    formData.append('penerbit', penerbit);
    formData.append('is_pending', '1'); 
    
    // Biodata di deskripsi agar admin tahu siapa pengunggahnya
    const biodata = `Pengunggah: ${user.username} | Role: ${user.role} | Sekolah/Kelas: ${user.sekolah || ''} ${user.kelas || ''}`.trim();
    formData.append('deskripsi', biodata);

    try {
      await addBook(formData);
      setUploadStatus('waiting');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Gagal mengajukan buku. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Book className="text-red-600" size={24} />
            Formulir Ajukan Buku
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 overflow-y-auto">
          {uploadStatus === 'idle' ? (
            <div className="space-y-6">
              
              {/* Seksi Biodata (Read Only) */}
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <User size={16} className="text-red-500"/> Biodata Pengaju
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Nama</label>
                    <p className="text-sm font-semibold text-gray-800 bg-white px-3 py-2 rounded-lg border border-gray-100">{user?.username || 'Tidak diketahui'}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Peran / Instansi</label>
                    <p className="text-sm font-semibold text-gray-800 bg-white px-3 py-2 rounded-lg border border-gray-100">
                      {user?.role} {user?.sekolah ? `- ${user?.sekolah}` : ''} {user?.kelas ? `(${user?.kelas})` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seksi Data Buku */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">Data Buku</h3>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Judul Buku <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder="Masukkan judul buku"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Penulis</label>
                    <input 
                      type="text"
                      value={penulis}
                      onChange={(e) => setPenulis(e.target.value)}
                      placeholder="Nama Penulis"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Penerbit</label>
                    <input 
                      type="text"
                      value={penerbit}
                      onChange={(e) => setPenerbit(e.target.value)}
                      placeholder="Penerbit Buku"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kategori / Mata Pelajaran</label>
                    <input 
                      type="text"
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      placeholder="Contoh: Matematika, Fiksi, Modul Ajar"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Upload PDF */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">Isi Buku (PDF) <span className="text-red-500">*</span></h3>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    file ? 'border-green-400 bg-green-50/30' : 'border-gray-200 hover:border-red-400 hover:bg-red-50/30'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                  {file ? (
                    <>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                        <FileText size={20} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 text-center line-clamp-1">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-2 group-hover:text-red-500 transition-colors">
                        <Upload size={20} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Klik untuk upload file PDF buku</p>
                      <p className="text-xs text-gray-500 mt-1">Maksimal 50MB</p>
                    </>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 relative">
                <Clock size={40} />
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                  <CheckCircle2 size={24} className="text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Pengajuan Berhasil!</h3>
              <p className="text-gray-600 leading-relaxed max-w-[280px]">
                Buku yang Anda ajukan berhasil dikirim. <br />
                <span className="font-semibold text-red-600">Mohon tunggu admin perpustakaan</span> untuk memverifikasi dan menyetujui buku Anda agar tampil di sistem.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          {uploadStatus === 'idle' ? (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isUploading}
              >
                Batal
              </button>
              <button
                disabled={!file || !judul || isUploading}
                onClick={handleUpload}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                  !file || !judul || isUploading 
                    ? 'bg-red-300 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-red-200'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Kirim Ajuan
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors active:scale-[0.98] w-full"
            >
              Kembali ke Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default AjukanBukuModal;
