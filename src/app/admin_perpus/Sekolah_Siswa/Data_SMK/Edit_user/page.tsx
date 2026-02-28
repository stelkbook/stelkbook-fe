'use client';
import React, { useEffect, useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import Head from 'next/head';
import { getStorageUrl } from '@/helpers/storage';
import { 
  FaHome, 
  FaUsers, 
  FaBook, 
  FaChartBar, 
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaEnvelope,
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaTimes,
  FaBars,
  FaChevronRight,
  FaUserGraduate,
  FaSchool,
  FaVenusMars,
  FaLandmark,
  FaBookOpen,
  FaClipboardList,
  FaChild,
  FaIndustry,
  FaCogs
} from 'react-icons/fa';

function EditUserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchSiswaSmk, siswaSmkDetail, updateSiswaSmk, user } = useAuth();
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
    jurusan: '',
    avatar: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const id = searchParams.get('id');

  // Cek status user
  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase();
      if (role !== 'admin' && role !== 'perpus' && role !== 'pengurusperpustakaan') {
        router.push('/homepage');
      }
    }
  }, [user, router]);

  useEffect(() => {
    if (id) {
      setInitialLoading(true);
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
        jurusan: siswaSmkDetail.jurusan || '',
        avatar: siswaSmkDetail.avatar || '',
      });

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
        formData.append('jurusan', form.jurusan);
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

  const handleLogout = async () => {
    try {
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat data siswa SMK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-red-50 to-orange-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-red-600 text-white rounded-lg shadow-lg"
      >
        <FaBars size={20} />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gradient-to-b from-red-600 to-red-700 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-red-500">
          <div className="bg-white p-3 rounded-xl shadow-lg flex items-center justify-center">
            <FaBook className="text-red-600 text-2xl mr-2" />
            <span className="font-bold text-xl text-red-600">StelkBook</span>
          </div>
          <p className="text-white text-xs text-center mt-2 opacity-80">Admin Perpustakaan</p>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {/* Dashboard */}
          <a 
            href="/admin_perpus/Sekolah_Siswa" 
            className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-500 hover:bg-opacity-50 rounded-lg transition-all group"
          >
            <FaHome className="text-white text-lg" />
            <span>Dashboard</span>
          </a>

          {/* Data Perpus */}
          <div className="pt-2">
            <p className="text-red-200 text-xs uppercase tracking-wider px-4 mb-2">Manajemen Perpus</p>
            <a 
              href="/admin_perpus/Data_perpus" 
              className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-500 hover:bg-opacity-50 rounded-lg transition-all group"
            >
              <FaLandmark className="text-white text-lg" />
              <span>Data Perpus</span>
            </a>
          </div>
          
          {/* Data Siswa */}
          <div className="pt-2">
            <p className="text-red-200 text-xs uppercase tracking-wider px-4 mb-2">Data Sekolah</p>
            
            <a 
              href="/admin_perpus/Sekolah_Siswa/Data_SD" 
              className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-500 hover:bg-opacity-50 rounded-lg transition-all"
            >
              <FaChild className="text-white text-lg" />
              <span>Data Siswa SD</span>
            </a>

            <a 
              href="/admin_perpus/Sekolah_Siswa/Data_SMP" 
              className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-500 hover:bg-opacity-50 rounded-lg transition-all mt-1"
            >
              <FaUserGraduate className="text-white text-lg" />
              <span>Data Siswa SMP</span>
            </a>

            {/* Data Siswa SMK - Active */}
            <a 
              href="/admin_perpus/Sekolah_Siswa/Data_SMK" 
              className="flex items-center space-x-3 px-4 py-3 bg-red-800 text-white rounded-lg shadow-inner mt-1"
            >
              <FaIndustry className="text-white text-lg" />
              <span>Data Siswa SMK</span>
            </a>
          </div>

          {/* Data Guru */}
          <div className="pt-2">
            <p className="text-red-200 text-xs uppercase tracking-wider px-4 mb-2">Data Guru</p>
            <a 
              href="/admin_perpus/Sekolah_Guru/Data_SD" 
              className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-500 hover:bg-opacity-50 rounded-lg transition-all"
            >
              <FaUserGraduate className="text-white text-lg" />
              <span>Data Guru SD</span>
            </a>
            <a 
              href="/admin_perpus/Sekolah_Guru/Data_SMP" 
              className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-500 hover:bg-opacity-50 rounded-lg transition-all mt-1"
            >
              <FaUserGraduate className="text-white text-lg" />
              <span>Data Guru SMP</span>
            </a>
            <a 
              href="/admin_perpus/Sekolah_Guru/Data_SMK" 
              className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-500 hover:bg-opacity-50 rounded-lg transition-all mt-1"
            >
              <FaUserGraduate className="text-white text-lg" />
              <span>Data Guru SMK</span>
            </a>
          </div>

          {/* Koleksi Buku */}
          <div className="pt-2">
            <p className="text-red-200 text-xs uppercase tracking-wider px-4 mb-2">Koleksi</p>
            <a 
              href="/perpustakaan/Daftar_Buku" 
              className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-500 hover:bg-opacity-50 rounded-lg transition-all"
            >
              <FaBookOpen className="text-white text-lg" />
              <span>Daftar Buku</span>
            </a>
          </div>
        </nav>

        {/* User Info Section */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-red-500 bg-red-800 bg-opacity-50">
          <div className="flex items-center space-x-3 text-white">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center border-2 border-white">
              {user?.avatar ? (
                <Image
                  src={getStorageUrl(user.avatar)}
                  alt={user.username}
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <FaUserCircle className="text-white text-xl" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" title={user?.username}>
                {user?.username || 'Admin Perpus'}
              </p>
              <p className="text-xs text-red-200 flex items-center truncate">
                <FaEnvelope className="mr-1 text-xs flex-shrink-0" />
                <span className="truncate" title={user?.email}>
                  {user?.email || 'admin@perpus.com'}
                </span>
              </p>
              <p className="text-xs text-red-300 mt-0.5 capitalize">
                {user?.role || 'Admin Perpus'}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-red-200 hover:text-white transition-colors flex-shrink-0"
              title="Logout"
            >
              <FaSignOutAlt size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header dengan Breadcrumb */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center text-sm text-gray-600 mb-2 flex-wrap gap-1">
              <span 
                onClick={() => router.push('/admin_perpus/Sekolah_Siswa')}
                className="hover:text-red-600 cursor-pointer transition-colors"
              >
                Dashboard
              </span>
              <FaChevronRight className="mx-1 text-xs" />
              <span 
                onClick={() => router.push('/admin_perpus/Sekolah_Siswa/Data_SMK')}
                className="hover:text-red-600 cursor-pointer transition-colors"
              >
                Data Siswa SMK
              </span>
              <FaChevronRight className="mx-1 text-xs" />
              <span className="text-red-600 font-medium">Edit Siswa</span>
            </div>
            
            {/* Welcome Message */}
            <div className="mb-4">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                Selamat datang, {user?.username || 'Admin'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Anda sedang mengelola data siswa Sekolah Menengah Kejuruan (SMK)
              </p>
            </div>
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Edit Siswa SMK</h2>
                <p className="text-gray-500 mt-1">Perbarui informasi data siswa</p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <FaTimes size={16} />
                <span>Batal</span>
              </button>
            </div>
          </div>

          {/* Info Card - Admin Perpus */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center space-x-3">
              <FaLandmark className="text-red-500 text-xl" />
              <div>
                <h3 className="font-semibold text-gray-700">Admin Perpustakaan</h3>
                <p className="text-sm text-gray-500">
                  Anda memiliki akses penuh ke manajemen data siswa SMK
                </p>
              </div>
            </div>
          </div>

          {/* Form Edit Siswa SMK */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Profile Image Section */}
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50 flex flex-col items-center relative">
              <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-4 ring-red-100">
                  <Image
                    src={previewImage || '/assets/Class/icon_user.png'}
                    alt="Profile Preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-red-600 bg-opacity-75 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110">
                  <FaCamera className="text-white text-2xl" />
                </div>
              </div>
              <p className="mt-3 text-sm text-red-600 font-medium">Klik foto untuk mengubah avatar</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-red-200 rounded-br-full opacity-20"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-red-200 rounded-tl-full opacity-20"></div>
            </div>

            {/* Form Fields */}
            <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaUserGraduate className="mr-2 text-red-500" />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="Masukkan username"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaEnvelope className="mr-2 text-red-500" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="nama@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaEye className="mr-2 text-red-500" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all pr-10"
                    placeholder="Kosongkan jika tidak diubah"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaBook className="mr-2 text-red-500" />
                  NIS
                </label>
                <input
                  type="text"
                  name="nis"
                  value={form.nis}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="Nomor Induk Siswa"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaVenusMars className="mr-2 text-red-500" />
                  Jenis Kelamin
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white"
                  required
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-Laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaSchool className="mr-2 text-red-500" />
                  Kelas
                </label>
                <select
                  name="kelas"
                  value={form.kelas}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white"
                  required
                >
                  <option value="">Pilih Kelas</option>
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaCogs className="mr-2 text-red-500" />
                  Jurusan
                </label>
                <select
                  name="jurusan"
                  value={form.jurusan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white"
                  required
                >
                  <option value="">Pilih Jurusan</option>
                  <option value="Teknik Komputer dan Jaringan">Teknik Komputer dan Jaringan</option>
                  <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                  <option value="Multimedia">Multimedia</option>
                  <option value="Akuntansi">Akuntansi</option>
                  <option value="Administrasi Perkantoran">Administrasi Perkantoran</option>
                  <option value="Pemasaran">Pemasaran</option>
                  <option value="Tata Boga">Tata Boga</option>
                  <option value="Tata Busana">Tata Busana</option>
                  <option value="Teknik Kendaraan Ringan">Teknik Kendaraan Ringan</option>
                  <option value="Teknik Sepeda Motor">Teknik Sepeda Motor</option>
                  <option value="Teknik Elektronika Industri">Teknik Elektronika Industri</option>
                  <option value="Teknik Mesin">Teknik Mesin</option>
                  <option value="Teknik Pengelasan">Teknik Pengelasan</option>
                  <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                  <option value="Perhotelan">Perhotelan</option>
                </select>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaIndustry className="mr-2 text-red-500" />
                  Sekolah
                </label>
                <input
                  type="text"
                  value="SMK"
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-t border-gray-100 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 text-red-600 font-medium hover:bg-red-100 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FaTimes />
                <span>Batal</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => router.push('/admin_perpus/Data_perpus')}
              className="bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center space-y-1"
            >
              <FaLandmark className="text-red-500 text-lg" />
              <span className="text-xs text-gray-600">Data Perpus</span>
            </button>
            <button
              onClick={() => router.push('/admin_perpus/Sekolah_Siswa/Data_SMK')}
              className="bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center space-y-1"
            >
              <FaIndustry className="text-red-500 text-lg" />
              <span className="text-xs text-gray-600">Siswa SMK</span>
            </button>
            <button
              onClick={() => router.push('/admin_perpus/Sekolah_Siswa/Data_SMP')}
              className="bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center space-y-1"
            >
              <FaUserGraduate className="text-red-500 text-lg" />
              <span className="text-xs text-gray-600">Siswa SMP</span>
            </button>
            <button
              onClick={() => router.push('/perpustakaan/Daftar_Buku')}
              className="bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center space-y-1"
            >
              <FaBookOpen className="text-red-500 text-lg" />
              <span className="text-xs text-gray-600">Daftar Buku</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© 2024 StelkBook - Sistem Manajemen Perpustakaan</p>
            <p className="text-xs mt-1">
              Login sebagai: <span className="font-semibold text-red-600">{user?.username || 'Admin'}</span> ({user?.role || 'Admin Perpus'})
            </p>
          </div>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat halaman...</p>
        </div>
      </div>
    }>
      <EditUserContent />
    </Suspense>
  );
}