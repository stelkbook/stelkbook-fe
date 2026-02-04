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
  const { fetchSiswaSmk, siswaSmkDetail, updateSiswaSmk } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    id: '',
    username: '',
    email: '',
    password: '',
    nis: '',
    gender: '',
    sekolah: 'SMK',
    kelas: '',
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
      // Reset preview image ketika memuat data baru
      setPreviewImage(null);
      setSelectedFile(null);
      
      fetchSiswaSmk(id)
        .finally(() => setInitialLoading(false));
    }
  }, [id, fetchSiswaSmk]);

  useEffect(() => {
    if (siswaSmkDetail) {
      setForm({
        id: siswaSmkDetail.id || '',
        username: siswaSmkDetail.username || '',
        email: siswaSmkDetail.email || '',
        password: siswaSmkDetail.password || '',
        nis: siswaSmkDetail.nis || '',
        gender: siswaSmkDetail.gender || '',
        sekolah: 'SMK',
        kelas: siswaSmkDetail.kelas || '',
        avatar: siswaSmkDetail.avatar || '',
      });

      // Reset preview image jika tidak ada avatar
      if (!siswaSmkDetail.avatar) {
        setPreviewImage(null);
        setSelectedFile(null);
      } else {
        setPreviewImage(getStorageUrl(siswaSmkDetail.avatar));
      }
    }
  }, [siswaSmkDetail]);

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
        if (selectedFile) {
          formData.append('avatar', selectedFile);
        }

        await updateSiswaSmk(id, formData);
        router.push('/admin_perpus/Sekolah_Siswa/Data_SMK');
      }
    } catch (error) {
      console.error('Error updating siswa SMK:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat data siswa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:block">
        <div className="p-6 border-b flex items-center space-x-3">
          <Image src="/assets/icon/logo.svg" alt="Logo" width={32} height={32} />
          <span className="text-xl font-bold text-gray-800">StelkBook</span>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/admin_perpus/dashboard" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            <Image src="/assets/icon/home.svg" alt="Dashboard" width={20} height={20} />
            <span>Dashboard</span>
          </a>
          <a href="/admin_perpus/Sekolah_Siswa/Data_SMK" className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium">
            <Image src="/assets/icon/users.svg" alt="Siswa" width={20} height={20} />
            <span>Data Siswa SMK</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Siswa SMK</h1>
              <p className="text-gray-500 mt-1">Perbarui informasi data siswa</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Profile Image Section */}
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <Image
                    src={previewImage || '/assets/Class/icon_user.png'}
                    alt="Profile Preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Image src="/assets/icon/camera.svg" alt="Change" width={24} height={24} className="text-white" />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">Klik foto untuk mengubah avatar</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Masukkan username"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="nama@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Kosongkan jika tidak diubah"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <Image src="/assets/icon/eye-off.svg" alt="Hide" width={20} height={20} />
                    ) : (
                      <Image src="/assets/icon/eye.svg" alt="Show" width={20} height={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">NIS</label>
                <input
                  type="text"
                  name="nis"
                  value={form.nis}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Nomor Induk Siswa"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  required
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Kelas</label>
                <select
                  name="kelas"
                  value={form.kelas}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  required
                >
                  <option value="">Pilih Kelas</option>
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
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
