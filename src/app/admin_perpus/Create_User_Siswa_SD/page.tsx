'use client';
import React, { ChangeEvent, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import Head from 'next/head';

function Page() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    kode: '',
    role: 'Siswa',
    gender: '',
    sekolah: 'SD',
    kelas: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSelesaiClick = async () => {
    setLoading(true);
    setError(null);

    try {
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.kode,
        formData.role,
        formData.gender,
        formData.sekolah,
        formData.kelas,
        avatarFile
      );

      router.push('/admin_perpus/Sekolah_Siswa/Data_SD');
    } catch (err: any) {
      console.error("Registrasi gagal:", err);
      setError(err.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const showSekolahField = false; // Already set to SD
  const showKelasField = true;

  const renderKelasOptions = () => {
    return ['I', 'II', 'III', 'IV', 'V', 'VI'];
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <Head>
        <title>Tambah Siswa SD - StelkBook</title>
        <link 
          rel="preload" 
          href="/assets/Class/Stelk_bookTitle.png" 
          as="image"
          media="(min-width: 768px)"
        />
      </Head>

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

      {/* Line dekorasi */}
      <div className="mb-6 md:mb-8">
        <div className="relative w-full h-[16px] md:h-[20px]">
          <Image 
            src="/assets/Class/Lines.png" 
            alt="Header decoration" 
            fill
            sizes="100vw"
            className="object-cover"
            priority={true}
          />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-6 md:mb-8 flex items-center space-x-2">
        <p 
          className="text-sm md:text-lg font-semibold text-gray-700 hover:underline cursor-pointer"
          onClick={() => router.push('/admin_perpus/Sekolah_Siswa/Data_SD')}
        >
          Database Anda
        </p>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <p className="text-sm md:text-lg font-medium text-gray-900 font-poppins">Tambah Siswa SD</p>
      </div>

      {/* Form */}
      <div className="flex justify-center">
        <div className="bg-white border border-gray-300 rounded-lg p-4 md:p-8 shadow-lg w-full max-w-4xl">
          
          {/* Title */}
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">Tambah Siswa SD Baru</h2>
          
          <div className="flex flex-col md:flex-row md:items-start md:space-x-8 space-y-6 md:space-y-0">
            
            {/* Avatar Upload - Left Column */}
            <div className="flex flex-col items-center space-y-2 mx-auto md:mx-0 md:w-1/3">
              <div 
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors border-2 border-red-200 hover:border-red-400"
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={avatarPreview} 
                      alt="User avatar" 
                      fill
                      sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                      className="object-cover"
                      quality={95}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs md:text-sm text-gray-500 mt-1">Klik untuk upload</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">Foto profil (opsional)</p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                ref={fileInputRef}
                className="hidden" 
              />
              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs text-red-500 hover:text-red-700 mt-1"
                >
                  Hapus foto
                </button>
              )}
            </div>

            {/* Input Fields - Right Column */}
            <div className="grid gap-4 md:gap-5 w-full md:w-2/3">
              {/* Username & Email - Grid 2 kolom di desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all"
                    placeholder="Masukkan username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password & Kode - Grid 2 kolom di desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all"
                    placeholder="Min. 6 karakter"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">
                    NIS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kode"
                    value={formData.kode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all"
                    placeholder="Nomor Induk Siswa"
                    required
                  />
                </div>
              </div>

              {/* Role & Gender - Grid 2 kolom di desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value="Siswa"
                    readOnly
                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all bg-white"
                    required
                  >
                    <option value="">Pilih Gender</option>
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              {/* Sekolah */}
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">
                  Sekolah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value="SD"
                  readOnly
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              {/* Kelas */}
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-700">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  name="kelas"
                  value={formData.kelas}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all bg-white"
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {renderKelasOptions().map(kelas => (
                    <option key={kelas} value={kelas}>{kelas}</option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 text-red-600 font-medium border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSelesaiClick}
                  disabled={loading}
                  className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </>
                  ) : 'Tambah Siswa SD'}
                </button>
              </div>

              {/* Informasi tambahan */}
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-red-500">*</span> Field wajib diisi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2024 StelkBook - Sistem Manajemen Perpustakaan</p>
      </div>
    </div>
  );
}

export default Page;