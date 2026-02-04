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
  const { fetchGuruSd, guruSdDetail, updateGuruSd } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    id: '',
    username: '',
    email: '',
    password: '',
    nip: '',
    gender: '',
    sekolah: 'SD',
    avatar: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      setInitialLoading(true);
      setPreviewImage(null);
      setSelectedFile(null);
      fetchGuruSd(id).finally(() => setInitialLoading(false));
    }
  }, [id, fetchGuruSd]);

  useEffect(() => {
    if (guruSdDetail) {
      setForm({
        id: guruSdDetail.id || '',
        username: guruSdDetail.username || '',
        email: guruSdDetail.email || '',
        password: guruSdDetail.password || '',
        nip: guruSdDetail.nip || '',
        gender: guruSdDetail.gender || '',
        sekolah: 'SD',
        avatar: guruSdDetail.avatar || '',
      });

      if (guruSdDetail.avatar) {
        setPreviewImage(getStorageUrl(guruSdDetail.avatar));
      } else {
        setPreviewImage(null);
      }
    }
  }, [guruSdDetail]);

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
        formData.append('nip', form.nip);
        formData.append('gender', form.gender);
        formData.append('sekolah', form.sekolah);
        if (selectedFile) formData.append('avatar', selectedFile);

        await updateGuruSd(id, formData);
        alert('Data guru SD berhasil diperbarui!');
        router.push('/admin_perpus/Sekolah_Guru/Data_SD');
      }
    } catch (error: any) {
      alert('Gagal memperbarui data guru SD: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <Head>
        <title>Edit User Guru SD</title>
      </Head>

      {/* Loading overlay */}
      {initialLoading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-center items-center mb-4 md:mb-6">
        <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push('/admin_perpus')}>
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
            priority={false}
          />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-6 md:mb-8 flex items-center space-x-2">
        <p className="text-sm md:text-lg font-semibold text-gray-700 hover:underline cursor-pointer"
          onClick={() => router.push('/admin_perpus')}>
          Database Anda
        </p>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <p className="text-sm md:text-lg font-semibold text-gray-700 hover:underline cursor-pointer"
          onClick={() => router.push('/admin_perpus/Sekolah_Guru/Data_SD')}>
          Guru SD
        </p>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <p className="text-sm md:text-lg font-medium text-gray-900 font-poppins">Edit User</p>
      </div>

      {/* Main Card */}
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
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 text-center max-w-[150px]">
              Klik foto untuk mengubah avatar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="Biarkan kosong jika tidak diubah"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">NIP</label>
                <input
                  type="text"
                  name="nip"
                  value={form.nip}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                >
                  <option value="" disabled>Pilih Gender</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sekolah</label>
                <input
                  type="text"
                  name="sekolah"
                  value="SD"
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditUser() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
      </div>
    }>
      <EditUserContent />
    </Suspense>
  );
}
