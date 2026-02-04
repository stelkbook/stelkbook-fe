'use client';
import React, { useEffect, useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import Head from 'next/head';
import { getStorageUrl } from '@/helpers/storage';


function EditUserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchSiswaSd, siswaSdDetail, updateSiswaSd } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    id: '',
    username: '',
    email: '',
    password: '',
    nis: '',
    gender: '',
    sekolah: 'SD',
    kelas: '',
    avatar: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const id = searchParams.get('id');

  // Fetch data
  useEffect(() => {
    if (id) {
      setInitialLoading(true);
      setPreviewImage(null);
      setSelectedFile(null);
      fetchSiswaSd(id).finally(() => setInitialLoading(false));
    }
  }, [id, fetchSiswaSd]);

  // Populate form data
  useEffect(() => {
    if (siswaSdDetail) {
      setForm({
        id: siswaSdDetail.id || '',
        username: siswaSdDetail.username || '',
        email: siswaSdDetail.email || '',
        password: siswaSdDetail.password || '',
        nis: siswaSdDetail.nis || '',
        gender: siswaSdDetail.gender || '',
        sekolah: 'SD',
        kelas: siswaSdDetail.kelas || '',
        avatar: siswaSdDetail.avatar || '',
      });

      if (!siswaSdDetail.avatar) {
        setPreviewImage(null);
        setSelectedFile(null);
      } else {
        setPreviewImage(getStorageUrl(siswaSdDetail.avatar));
      }
    }
  }, [siswaSdDetail]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        const formData = new FormData();
        formData.append('username', form.username);
        formData.append('email', form.email);
        if (form.password) formData.append('password', form.password);
        formData.append('nis', form.nis);
        formData.append('gender', form.gender);
        formData.append('sekolah', form.sekolah);
        formData.append('kelas', form.kelas);
        if (selectedFile) formData.append('avatar', selectedFile);

        await updateSiswaSd(id, formData);
        alert('Data siswa SD berhasil diperbarui!');
        router.push('/admin/Sekolah_Siswa/Data_SD');
      }
    } catch (error: any) {
      alert('Gagal memperbarui data siswa SD: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const generateKelasOptions = () => {
    return ['I', 'II', 'III', 'IV', 'V', 'VI'];
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <Head>
        <title>Edit User Siswa SD</title>
      </Head>

      {/* Loading overlay */}
      {initialLoading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-center items-center mb-4 md:mb-6">
        <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push('/admin')}>
          <div className="relative w-[120px] h-[36px] md:w-[165px] md:h-[50px]">
            <Image
              src="/assets/Class/Stelk_bookTitle.png"
              alt="Stelkbook"
              width={165}
              height={50}
              priority={true}
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      </header>

      {/* Decorative line */}
      <div className="mb-6 md:mb-8">
        <div className="relative w-full h-[16px] md:h-[20px]">
          <Image
            src="/assets/Class/Lines.png"
            alt="Header decoration"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Breadcrumb navigation */}
      <div className="mb-6 md:mb-8 flex items-center space-x-2">
        <p className="text-sm md:text-lg font-semibold text-gray-700 hover:underline cursor-pointer"
          onClick={() => router.push('/admin')}>
          Database Anda
        </p>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <p className="text-sm md:text-lg font-semibold text-gray-700 hover:underline cursor-pointer"
          onClick={() => router.push('/admin/Sekolah_Siswa/Data_SD')}>
          Siswa SD
        </p>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <p className="text-sm md:text-lg font-medium text-gray-900 font-poppins">Edit User</p>
      </div>

      <div className="flex justify-center">
        <div className="bg-white border border-gray-300 rounded-lg p-4 md:p-8 shadow-lg w-full max-w-4xl flex flex-col md:flex-row md:items-center md:space-x-6 space-y-6 md:space-y-0">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-2 mx-auto md:mx-0">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative"
              onClick={triggerFileInput}
            >
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="User Avatar"
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
                  className="object-cover"
                  priority={true}
                  unoptimized={!previewImage.startsWith('data:')}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <span className="text-xs md:text-sm text-gray-500">Klik untuk upload foto</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {previewImage && (
              <button
                type="button"
                onClick={triggerFileInput}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid gap-3 md:gap-4 w-full">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 pr-10"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {showPassword ? 'Password terlihat' : 'Password tersembunyi'}
              </p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">NIS</label>
              <input
                type="text"
                name="nis"
                value={form.nis}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0">
              <div className="w-full md:w-1/2">
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Sekolah</label>
                <input
                  type="text"
                  value="SD"
                  readOnly
                  className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 bg-gray-100"
                />
              </div>

              <div className="w-full md:w-1/2">
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Kelas</label>
                <select
                  name="kelas"
                  value={form.kelas}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {generateKelasOptions().map((kelas) => (
                    <option key={kelas} value={kelas}>
                      {kelas}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0">
              <div className="w-full md:w-1/2">
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Status</label>
                <input
                  type="text"
                  value="Siswa"
                  readOnly
                  className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 bg-gray-100"
                />
              </div>

              <div className="w-full md:w-1/2">
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                >
                  <option value="">Pilih Gender</option>
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center mt-4 md:mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 md:px-8 md:py-3 rounded-lg shadow-md text-white font-semibold text-sm md:text-base transition ${loading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-400'}`}
              >
                {loading ? 'Menyimpan...' : 'Selesai'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat halaman...</p>
        </div>
      </div>
    }>
      <EditUserContent />
    </Suspense>
  );
}
