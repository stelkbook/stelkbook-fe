'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import NotificationSuccessful from './NotificationEditSuccessful';
import Navbar from '@/components/Navbar_Lainnya_Perpus';
import { useBook } from '@/context/bookContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStorageUrl } from '@/helpers/storage';


// Loading Spinner Component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
    </div>
);

function EditBukuContent() {
    const [showNotification, setShowNotification] = useState(false);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [existingCover, setExistingCover] = useState<string | null>(null);
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [penulis, setPenulis] = useState('');
    const [tahun, setTahun] = useState('');
    const [isbn, setIsbn] = useState('');
    const [selectedKelas, setSelectedKelas] = useState('');
    const [selectedSekolah, setSelectedSekolah] = useState('');
    const [kelasOptions, setKelasOptions] = useState<string[]>([]);
    const [penerbit, setPenerbit] = useState('');
    const [pdfFileName, setPdfFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const { fetchKelas1BookById, updateKelas1Book } = useBook();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();

    useEffect(() => {
        if (id) {
            setIsDataLoading(true);
            fetchKelas1BookById(id)
                .then((data: any) => {
                    setJudul(data.judul);
                    setDeskripsi(data.deskripsi);
                    setPenulis(data.penulis);
                    setTahun(data.tahun);
                    setIsbn(data.ISBN);

                    if (data.kategori === 'NA') {
                        setSelectedSekolah('NA');
                        setSelectedKelas('NA');
                    } else {
                        setSelectedSekolah(data.sekolah);
                        setSelectedKelas(data.kategori);
                    }

                    setPenerbit(data.penerbit);
                    setExistingCover(
                        data.cover
                            ? getStorageUrl(data.cover)
                            : '/assets/default-cover.png'
                    );
                    const fileName = data.isi?.split('/').pop() || '';
                    setPdfFileName(fileName);
                })
                .catch((err: any) => {
                    console.error('Error fetching book:', err);
                })
                .finally(() => setIsDataLoading(false));
        }
    }, [id, fetchKelas1BookById]);

    useEffect(() => {
        if (selectedSekolah === 'SD') {
            setKelasOptions(['I', 'II', 'III', 'IV', 'V', 'VI']);
        } else if (selectedSekolah === 'SMP') {
            setKelasOptions(['VII', 'VIII', 'IX']);
        } else if (selectedSekolah === 'SMK') {
            setKelasOptions(['X', 'XI', 'XII']);
        } else if (selectedSekolah === 'NA') {
            setKelasOptions(['NA']);
            setSelectedKelas('NA');
        } else {
            setKelasOptions([]);
        }
    }, [selectedSekolah]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('judul', judul);
        formData.append('deskripsi', deskripsi);
        formData.append('sekolah', selectedSekolah === 'NA' ? '' : selectedSekolah);
        formData.append('kategori', selectedKelas);
        formData.append('penerbit', penerbit);
        formData.append('penulis', penulis);
        formData.append('tahun', tahun);
        formData.append('ISBN', isbn);
        if (coverFile) {
            formData.append('cover', coverFile);
        }
        if (pdfFile) {
            formData.append('isi', pdfFile);
        }

        try {
            await updateKelas1Book(id, formData);
            setShowNotification(true);
            router.push(`/kelasI_perpus`);
        } catch (err) {
            console.error('Error updating book:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]?.type === 'application/pdf') {
            setPdfFile(event.target.files[0]);
        } else {
            alert('Please upload a valid PDF file.');
        }
    };

    const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setCoverFile(event.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 overflow-y-auto">
            <Navbar />
            <div className="mb-6 flex items-center text-gray-700 pt-20 px-8">
                <p className="text-xl font-semibold font-poppins">Perpus Anda</p>
                <div className="mx-2">
                    <Image
                        src="/assets/Kelas_X/Primary_Direct.png"
                        alt=">"
                        width={10}
                        height={16}
                    />
                </div>
                <p className="text-xl font-semibold font-poppins">Edit Buku</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
                {isDataLoading ? (
                    <LoadingSpinner />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-wrap gap-8">
                            <div className="flex-grow">
                                {/* Judul */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Judul</label>
                                    <input
                                        type="text"
                                        value={judul}
                                        onChange={(e) => setJudul(e.target.value)}
                                        placeholder="(Isi Judul)"
                                        className="w-full border border-gray-300 bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Deskripsi */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Deskripsi</label>
                                    <input
                                        type="text"
                                        value={deskripsi}
                                        onChange={(e) => setDeskripsi(e.target.value)}
                                        placeholder="(Isi Deskripsi)"
                                        className="w-full border border-gray-300 bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Sekolah */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Sekolah</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['SD', 'SMP', 'SMK', 'NA'].map((sekolah) => (
                                            <button
                                                key={sekolah}
                                                type="button"
                                                onClick={() => setSelectedSekolah(sekolah)}
                                                className={`py-2 px-4 text-sm font-semibold border rounded-lg transition ${
                                                    selectedSekolah === sekolah
                                                        ? 'bg-red text-white border-red-500'
                                                        : 'bg-white text-gray-700 border-gray-300'
                                                }`}
                                            >
                                                {sekolah}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Kelas */}
                                {selectedSekolah && selectedSekolah !== 'NA' && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-medium mb-2">Kelas</label>
                                        <div className="flex flex-wrap gap-2">
                                            {kelasOptions.map((kelas) => (
                                                <button
                                                    key={kelas}
                                                    type="button"
                                                    onClick={() => setSelectedKelas(kelas)}
                                                    className={`py-2 px-4 text-sm font-semibold border rounded-lg transition ${
                                                        selectedKelas === kelas
                                                            ? 'bg-red text-white border-red-500'
                                                            : 'bg-white text-gray-700 border-gray-300'
                                                    }`}
                                                >
                                                    {kelas}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Penerbit */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Penerbit</label>
                                    <input
                                        type="text"
                                        value={penerbit}
                                        onChange={(e) => setPenerbit(e.target.value)}
                                        placeholder="(Isi Penerbit)"
                                        className="w-full border border-gray-300 bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Penulis */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Penulis</label>
                                    <input
                                        type="text"
                                        value={penulis}
                                        onChange={(e) => setPenulis(e.target.value)}
                                        placeholder="(Isi Penulis)"
                                        className="w-full border border-gray-300 bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Tahun */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Tahun</label>
                                    <input
                                        type="text"
                                        value={tahun}
                                        onChange={(e) => setTahun(e.target.value)}
                                        placeholder="(Isi Tahun)"
                                        className="w-full border border-gray-300 bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* ISBN */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">ISBN</label>
                                    <input
                                        type="text"
                                        value={isbn}
                                        onChange={(e) => setIsbn(e.target.value)}
                                        placeholder="(Isi ISBN)"
                                        className="w-full border border-gray-300 bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Cover & Isi Buku */}
                            <div className="w-1/3 space-y-4">
                                <div className="relative">
                                    <label className="block text-gray-700 font-medium mb-2">Cover Buku</label>
                                    <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 relative">
                                        {coverFile ? (
                                            <img
                                                src={URL.createObjectURL(coverFile)}
                                                alt="Book Cover"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <Image
                                                src={existingCover || '/assets/default-cover.png'}
                                                alt="Book Cover"
                                                width={200}
                                                height={300}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverUpload}
                                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-gray-700 font-medium mb-2">Isi Buku</label>
                                    <div className="border border-gray-300 rounded-lg flex items-center justify-center p-6 bg-gray-50 cursor-pointer">
                                        <Image
                                            src="/assets/icon/add-file.svg"
                                            alt="Book Content"
                                            width={48}
                                            height={45}
                                        />
                                        {!pdfFile && pdfFileName && (
                                            <p className="mt-2 text-gray-700">{pdfFileName}</p>
                                        )}
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handlePdfUpload}
                                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {pdfFile && <p className="mt-2 text-gray-700">{pdfFile.name}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Selesai */}
                        <div className="mt-6 flex justify-center">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-32 bg-red text-white rounded-lg py-2 px-4 font-semibold text-sm hover:bg-red-600 shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    'Selesai'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <NotificationSuccessful show={showNotification} />
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <EditBukuContent />
        </Suspense>
    );
}
