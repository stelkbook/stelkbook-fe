'use client';
import React, { useEffect, useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import Head from 'next/head';
import { getStorageUrl } from '@/helpers/storage';


function EditUserForm() {
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
        if (selectedFile) {
          formData.append('avatar', selectedFile);
        }

        await updateSiswaSd(id, formData);
        router.push('/admin_perpus/Sekolah_Siswa/Data_SD');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <Head>
        <title>Edit Siswa SD</title>
      </Head>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Data Siswa SD</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Avatar & Basic Info */}
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div 
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 mb-4 cursor-pointer relative group"
                onClick={triggerFileInput}
              >
                {previewImage ? (
                  <Image 
                    src={previewImage} 
                    alt="Avatar Preview" 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <span className="text-4xl">?</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-semibold">Ubah Foto</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-sm text-gray-500">Klik foto untuk mengubah</p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password (Kosongkan jika tidak diubah)</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">NIS</label>
              <input
                type="text"
                name="nis"
                value={form.nis}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Jenis Kelamin</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Kelas</label>
              <select
                name="kelas"
                value={form.kelas}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Pilih Kelas</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
                <option value="VI">VI</option>
              </select>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition duration-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red text-white py-2 rounded-lg hover:bg-red-600 transition duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    }>
      <EditUserForm />
    </Suspense>
  );
}
