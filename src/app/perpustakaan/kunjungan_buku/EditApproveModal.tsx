'use client';
import React, { useState, useEffect } from 'react';
import { X, Upload, Save, CheckCircle } from 'lucide-react';

interface EditApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestData: any;
  onApprove: (id: number, formData: FormData) => Promise<any>;
}

const EditApproveModal: React.FC<EditApproveModalProps> = ({ isOpen, onClose, requestData, onApprove }) => {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [penulis, setPenulis] = useState('');
  const [tahun, setTahun] = useState('');
  const [isbn, setIsbn] = useState('');
  const [penerbit, setPenerbit] = useState('');
  const [selectedSekolah, setSelectedSekolah] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kelasOptions, setKelasOptions] = useState<string[]>([]);

  useEffect(() => {
    if (requestData) {
      setJudul(requestData.judul || '');
      setDeskripsi(requestData.deskripsi || '');
      setSelectedSekolah(requestData.sekolah || 'NA');
      setSelectedKelas(requestData.kategori || 'NA');
    }
  }, [requestData]);

  useEffect(() => {
    if (selectedSekolah === 'SD') {
      setKelasOptions(['I', 'II', 'III', 'IV', 'V', 'VI']);
    } else if (selectedSekolah === 'SMP') {
      setKelasOptions(['VII', 'VIII', 'IX']);
    } else if (selectedSekolah === 'SMK') {
      setKelasOptions(['X', 'XI', 'XII']);
    } else {
      setKelasOptions([]);
      if (selectedSekolah === 'NA') setSelectedKelas('NA');
    }
  }, [selectedSekolah]);

  if (!isOpen || !requestData) return null;

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setCoverFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('sekolah', selectedSekolah === 'NA' ? '' : selectedSekolah);
    formData.append('kategori', selectedSekolah === 'NA' ? 'NA' : selectedKelas);
    formData.append('penerbit', penerbit);
    formData.append('penulis', penulis);
    formData.append('tahun', tahun);
    formData.append('ISBN', isbn);
    if (coverFile) formData.append('cover', coverFile);

    try {
      await onApprove(requestData.id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Review & Edit Permintaan Upload</h2>
            <p className="text-xs text-gray-500">Lengkapi data buku sebelum diterbitkan</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Judul Buku</label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Deskripsi</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Sekolah</label>
                  <div className="flex flex-wrap gap-2">
                    {['SD', 'SMP', 'SMK', 'NA'].map((sekolah) => (
                      <button
                        key={sekolah}
                        type="button"
                        onClick={() => setSelectedSekolah(sekolah)}
                        className={`px-3 py-1.5 text-xs font-semibold border rounded-lg transition ${
                          selectedSekolah === sekolah ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        {sekolah}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedSekolah && selectedSekolah !== 'NA' && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Kelas</label>
                    <div className="flex flex-wrap gap-1.5">
                      {kelasOptions.map((kelas) => (
                        <button
                          key={kelas}
                          type="button"
                          onClick={() => setSelectedKelas(kelas)}
                          className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition ${
                            selectedKelas === kelas ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'
                          }`}
                        >
                          {kelas}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Penulis</label>
                  <input
                    type="text"
                    value={penulis}
                    onChange={(e) => setPenulis(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Penerbit</label>
                  <input
                    type="text"
                    value={penerbit}
                    onChange={(e) => setPenerbit(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Tahun Terbit</label>
                  <input
                    type="text"
                    value={tahun}
                    onChange={(e) => setTahun(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">ISBN</label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-2 block">Cover Buku</label>
                <div className="relative aspect-[3/4] border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 group hover:border-red-400 transition-colors">
                  {coverFile ? (
                    <img
                      src={URL.createObjectURL(coverFile)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                      <Upload size={32} className="mb-2" />
                      <p className="text-xs font-medium">Klik untuk upload cover</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Approve & Terbitkan
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditApproveModal;