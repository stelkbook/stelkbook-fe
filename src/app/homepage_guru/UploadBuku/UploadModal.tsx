'use client';
import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useBook } from '@/context/bookContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [judul, setJudul] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'waiting'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addBook } = useBook();

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
    if (!file || !judul) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('isi', file);
    formData.append('is_pending', '1'); 
    formData.append('deskripsi', 'Uploaded by Guru, waiting for moderation.');

    try {
      await addBook(formData);
      setUploadStatus('waiting');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Gagal mengunggah buku. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-gray-800">Upload Buku Ajar</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {uploadStatus === 'idle' ? (
            <div className="space-y-6">
              {/* Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
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
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                      <FileText size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-700 text-center line-clamp-1">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3 group-hover:text-red-500 transition-colors">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Klik untuk pilih file PDF</p>
                    <p className="text-xs text-gray-500 mt-1">Maksimal 50MB</p>
                  </>
                )}
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Judul Buku</label>
                <input 
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Masukkan judul buku"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all text-sm"
                />
              </div>

              {/* Action Button */}
              <button
                disabled={!file || !judul || isUploading}
                onClick={handleUpload}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                  !file || !judul || isUploading 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-red-200'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload Sekarang
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 relative">
                <Clock size={40} />
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                  <CheckCircle2 size={24} className="text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Berhasil!</h3>
              <p className="text-gray-600 leading-relaxed max-w-[280px]">
                Buku Anda telah berhasil diunggah. <br />
                <span className="font-semibold text-red-600">Mohon tunggu moderator perpus/admin</span> untuk memverifikasi buku Anda.
              </p>
              <button
                onClick={onClose}
                className="mt-8 px-8 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors active:scale-[0.98]"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
