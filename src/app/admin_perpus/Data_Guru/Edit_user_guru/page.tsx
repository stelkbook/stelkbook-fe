'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/authContext'; // Import useAuth

function EditUserGuruContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { fetchGuru, guruDetail, updateGuru } = useAuth(); // Ambil fungsi dan state dari AuthContext
  const [form, setForm] = useState({
    id: '',
    username: '',
    email: '',
    password: '',
    nip: '',
    gender: '',
    sekolah: '',
  });
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle password visibility

  // Ambil data guru berdasarkan ID saat komponen dimuat
  useEffect(() => {
    if (id) {
      fetchGuru(id); // Ambil data guru spesifik berdasarkan ID
    }
  }, [id, fetchGuru]);

  // Isi form dengan data guru saat guruDetail berubah
  useEffect(() => {
    if (guruDetail) {
      setForm({
        id: guruDetail.id || '',
        username: guruDetail.username || '',
        email: guruDetail.email || '',
        password: guruDetail.password || '', // Biarkan kosong untuk keamanan
        nip: guruDetail.nip || '',
        gender: guruDetail.gender || '',
        sekolah: guruDetail.sekolah || '',
      });
    }
  }, [guruDetail]);

  // Handle perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await updateGuru(id, form); // Update data guru
        alert('Data Guru berhasil diperbarui!');
        router.push('/admin/Data_Guru'); // Redirect ke halaman data guru
      }
    } catch (error: any) {
      alert('Gagal memperbarui data guru: ' + (error.message || 'Terjadi kesalahan'));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleStelkbookClick = () => {
    router.push('/admin'); // Navigasi ke homepage admin
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <header className="flex justify-between items-center mb-4">
        {/* Stelkbook Title */}
        <div className="flex-shrink-0 cursor-pointer" onClick={handleStelkbookClick}>
          <Image src="/assets/Class/Stelk_bookTitle.png" alt="Stelkbook" width={165} height={100} />
        </div>

        {/* Search Bar */}
        <div className="mx-4 flex-grow max-w-md relative">
          <input
            type="text"
            placeholder="Pencarian disini"
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Icon-Image */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Image
              src="/assets/Class/Search_icon.png"
              alt="Search Icon"
              width={20}
              height={20}
            />
          </div>
        </div>

        {/* Icon user */}
        <div className="flex-shrink-0 cursor-pointer">
          <Image
            src="/assets/Class/icon_user.png"
            alt="Icon-User"
            width={45}
            height={40}
            className="rounded-full translate-y-[-0px] translate-x-[-20px]"
          />
        </div>
      </header>

      {/* Header Line */}
      <div className="mb-8">
        <Image
          src="/assets/Class/Lines.png"
          alt="Header Line"
          width={3000}
          height={100}
        />
      </div>

      {/* Breadcrumb Text */}
      <div className="mb-8 flex items-center space-x-2">
        <p className="text-lg font-semibold text-gray-600">Database Anda</p>

        {/* First Arrow Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        {/* "Guru" Text */}
        <p className="text-lg font-semibold text-gray-600">Guru</p>

        {/* Second Arrow Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        {/* "Edit User" Text */}
        <p className="text-lg font-medium text-black">Edit User</p>
      </div>

      {/* Profile Section */}
      <div className="flex justify-center">
        <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-lg max-w-4xl w-full flex items-center space-x-8">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 rounded-full flex-shrink-0"></div>
          </div>

          {/* Profile Details */}
          <form onSubmit={handleSubmit} className="grid gap-4 w-full">
            {/* Username Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red pr-10"
              />
              <Image
                src={showPassword ? '/assets/Forgot-password/unhide2.png' : '/assets/Forgot-password/hide.png'}
                alt="Toggle Visibility"
                width={20}
                height={20}
                className="absolute top-1/2 right-3 transform -translate-y-[-6px] cursor-pointer"
                onClick={togglePasswordVisibility}
              />
            </div>

            {/* NIP Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">NIP</label>
              <input
                type="text"
                name="nip"
                value={form.nip}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red"
              />
            </div>

            {/* Sekolah Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Sekolah</label>
              <select
                name="sekolah"
                value={form.sekolah}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red"
              >
                <option value="">Pilih Sekolah</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMK">SMK</option>
              </select>
            </div>

            {/* Status and Gender Fields */}
            <div className="flex space-x-4">
              {/* Status Field */}
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-medium mb-2">Status</label>
                <input
                  type="text"
                  value="Guru"
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red"
                />
              </div>

              {/* Gender Field */}
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-medium mb-2">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red"
                >
                  <option value="">Pilih Gender</option>
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="bg-red text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 translate-x-[-50px]"
              >
                Selesai
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
    <Suspense fallback={<div>Loading...</div>}>
      <EditUserGuruContent />
    </Suspense>
  );
}