'use client';
import React, { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import { MdEdit } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import Image from "next/image";
import { Eye, EyeOff } from 'lucide-react';

function Page() {
  const router = useRouter();
  const { register2 } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showSekolahField, setShowSekolahField] = useState(false);
  const [showKelasField, setShowKelasField] = useState(false);
  const [status, setStatus] = useState('');
  const [sekolah, setSekolah] = useState('');
  const [kelas, setKelas] = useState('');
  const [gender, setGender] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kode, setKode] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // ✅ Spinner State
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [kodeError, setKodeError] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasLength: false,
  });

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setStatus(selectedRole);
    setRole(selectedRole);

    if (selectedRole === 'Siswa' || selectedRole === 'Guru') {
      setShowSekolahField(true);
      setShowKelasField(selectedRole === 'Siswa');
    } else {
      setShowSekolahField(false);
      setShowKelasField(false);
    }
  };

  const handleSekolahChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedSekolah = e.target.value;
    setSekolah(selectedSekolah);
    setKelas('');
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    // Trim leading/trailing whitespace before validation as per requirement
    const trimmedValue = value.trim();

    if (trimmedValue.length === 0 && value.length > 0) {
       // Handle case where user only typed spaces
       setUsernameError("Username must be 3–20 characters");
       return;
    }

    if (value === '') {
        setUsernameError('');
        return;
    }

    // Validation Rules
    const lengthValid = trimmedValue.length >= 3 && trimmedValue.length <= 20;
    const charsValid = /^[a-zA-Z0-9]+$/.test(trimmedValue);

    if (!lengthValid) {
      setUsernameError("Username must be 3–20 characters");
    } else if (!charsValid) {
      // User didn't specify error message for invalid chars, but logic requires it.
      // Using a descriptive message.
      setUsernameError("Username must contain only letters and numbers");
    } else {
      setUsernameError('');
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Google domain regex: allows gmail.com, googlemail.com, google.com
    // It matches case-insensitively due to logic check, but for regex we can be specific
    const googleDomainRegex = /@(?:gmail\.com|googlemail\.com|google\.com)$/i;

    if (value && !emailRegex.test(value)) {
      setEmailError("Enter a valid email address (example: name@gmail.com)"); 
    } else if (value && !googleDomainRegex.test(value)) {
      setEmailError("Please use a valid email address (example: @gmail.com, @googlemail.com)");
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasLength = value.length >= 8;

    setPasswordRequirements({
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
      hasLength
    });

    if (value.length > 15) {
      setPasswordError('character limit must only 15 character at the time on password');
    } else if (value && (!hasUpperCase || !hasNumber || !hasSpecialChar)) {
      setPasswordError('password must be symbols, capital or numbers');
    } else {
      setPasswordError('');
    }

    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Password does not match');
    } else if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleKodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKode(value);

    if (value) {
      if (!/^\d+$/.test(value)) {
        setKodeError('Kode must be numeric only');
      } else if (value.length < 5 || value.length > 18) {
        setKodeError('Kode must be between 5 and 18 digits');
      } else {
        setKodeError('');
      }
    } else {
      setKodeError('');
    }
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value !== password) {
      setConfirmPasswordError('Password does not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSelesaiClick = async () => {
    try {
      setIsLoading(true); // ✅ Start Spinner
      await register2(
        username,
        email,
        password,
        kode,
        role,
        gender,
        sekolah,
        kelas,
        avatarFile
      );
      setShowWarning(true);
    } catch (e: any) {
      console.error("Registrasi gagal:", e);
      let msg = "Registrasi gagal. Silakan coba lagi.";

      if (e?.response?.data?.message) {
        msg = e.response.data.message;
      } else if (typeof e === 'object' && e !== null && !e.message && !e.response) {
         // Handle validation errors object (e.g., { username: ["Taken"] })
         const values = Object.values(e);
         if (values.length > 0) {
            const firstError = values[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
               msg = firstError[0];
            } else if (typeof firstError === 'string') {
               msg = firstError;
            }
         }
      } else if (e?.message) {
        msg = e.message;
      }
      
      setErrorMessage(msg);
    } finally {
      setIsLoading(false); // ✅ Stop Spinner
    }
  };

  const renderKelasOptions = () => {
    if (sekolah === 'SD') {
      return ['I', 'II', 'III', 'IV', 'V', 'VI'].map((kelasOption) => (
        <option key={kelasOption} value={kelasOption}>
          {kelasOption}
        </option>
      ));
    } else if (sekolah === 'SMP') {
      return ['VII', 'VIII', 'IX'].map((kelasOption) => (
        <option key={kelasOption} value={kelasOption}>
          {kelasOption}
        </option>
      ));
    } else if (sekolah === 'SMK') {
      return ['X', 'XI', 'XII'].map((kelasOption) => (
        <option key={kelasOption} value={kelasOption}>
          {kelasOption}
        </option>
      ));
    }
    return null;
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
     <div className="mb-8 flex justify-center">
  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
    <Image
      src="/assets/icon/stelkbook-logo-navbar.svg"
      alt="Logo"
      width={148}
      height={88}
      style={{ width: 'auto', height: 'auto' }} // ✅ Perbaiki Warning
      priority={true}
    />
    <h1 className="text-3xl font-bold text-gray-700">Registrasi</h1>
  </div>
</div>


      <div className="flex justify-center">
        <div className="bg-white border border-gray-300 rounded-lg p-6 sm:p-8 shadow-lg w-full max-w-md flex flex-col items-center">

          {/* Avatar Upload */}
          <div className="relative group w-24 h-24 sm:w-32 sm:h-32">
            <div className="w-full h-full rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <FaUser className="text-gray-700 text-3xl sm:text-4xl" />
              )}
            </div>
            <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full cursor-pointer transition duration-200">
              <MdEdit className="text-white text-xl opacity-0 group-hover:opacity-100 transition duration-200" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setAvatarFile(file);
                    setAvatar(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
          </div>

          {/* Form */}
          <div className="grid gap-4 w-full">
            {/* Username */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Username <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  usernameError
                    ? 'border-red-500 ring-2 ring-red-500 text-red-900'
                    : 'border-gray-300 focus:ring-red'
                }`}
                required
              />
              {usernameError ? (
                <div className="mt-1 text-red-500 text-sm">
                  {usernameError}
                </div>
              ) : (
                <div className="mt-1 text-gray-500 text-sm">
                  3–20 characters, and Letters only
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  emailError
                    ? 'border-red-500 ring-2 ring-red-500 text-red-900'
                    : 'border-gray-300 focus:ring-red'
                }`}
                required
              />
              {emailError && (
                <div className="mt-2 text-red-500 text-sm">
                  {emailError}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 ${
                    passwordError
                      ? 'border-red-500 ring-2 ring-red-500 text-red-900'
                      : 'border-gray-300 focus:ring-red'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && (
                <div className="mt-2 text-red-500 text-sm">
                  {passwordError}
                </div>
              )}
               <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">Password requirements:</p>
                <ul className="text-xs space-y-1">
                  <li className={`flex items-center gap-2 ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordRequirements.hasUpperCase ? '✓' : '○'}</span> At least one uppercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordRequirements.hasNumber ? '✓' : '○'}</span> At least one number
                  </li>
                  <li className={`flex items-center gap-2 ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordRequirements.hasSpecialChar ? '✓' : '○'}</span> At least one special character
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 ${
                    confirmPasswordError
                      ? 'border-red-500 ring-2 ring-red-500 text-red-900'
                      : 'border-gray-300 focus:ring-red'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPasswordError && (
                <div className="mt-2 text-red-500 text-sm">
                  {confirmPasswordError}
                </div>
              )}
            </div>

            {/* Kode */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Kode (NIS/NIP) <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={kode}
                onChange={handleKodeChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  kodeError
                    ? 'border-red-500 ring-2 ring-red-500 text-red-900'
                    : 'border-gray-300 focus:ring-red'
                }`}
                required
              />
               {kodeError && (
                <div className="mt-2 text-red-500 text-sm">
                  {kodeError}
                </div>
              )}
               <p className="mt-1 text-xs text-gray-500">
                Must be 5-18 digits numeric code.
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Status <span className="text-red-500">*</span></label>
              <select
                value={role}
                onChange={handleStatusChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red"
                required
              >
                <option value="">Pilih Status</option>
                <option value="Siswa">Siswa</option>
                <option value="Guru">Guru</option>
                <option value="Perpus">Perpus</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Sekolah */}
            {showSekolahField && (
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Sekolah <span className="text-red-500">*</span></label>
                <select
                  value={sekolah}
                  onChange={handleSekolahChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red"
                  required
                >
                  <option value="">Pilih Sekolah</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMK">SMK</option>
                </select>
              </div>
            )}

            {/* Kelas */}
            {showKelasField && sekolah && (
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Kelas <span className="text-red-500">*</span></label>
                <select
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red"
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {renderKelasOptions()}
                </select>
              </div>
            )}

            {/* Gender */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Gender <span className="text-red-500">*</span></label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red"
                required
              >
                <option value="">Pilih Gender</option>
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red text-OldRed px-4 py-2 rounded text-sm text-center">
                {errorMessage}
              </div>
            )}

            {/* Warning Dialog */}
            {showWarning && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                  <p className="text-gray-800 text-lg font-medium mb-4">
                    Silakan menunggu persetujuan dari pihak perpustakaan.
                  </p>
                  <button
                    onClick={() => {
                      setShowWarning(false);
                      router.push('/');
                    }}
                    className="bg-red text-white px-4 py-2 rounded-md hover:bg-OldRed"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}

          <div className="flex justify-center mt-8">
  <button
    type="button" // ✅ supaya tidak trigger submit default
    className={`bg-red text-white px-6 py-2 rounded-lg shadow-md hover:bg-OldRed focus:outline-none focus:ring-2 focus:ring-red flex items-center gap-2 ${
      isLoading ? 'opacity-75 cursor-not-allowed' : ''
    }`}
    onClick={handleSelesaiClick}
    disabled={
      isLoading ||
      !!passwordError ||
      !!emailError ||
      !!confirmPasswordError ||
      !!kodeError ||
      !!usernameError ||
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !kode ||
      !role ||
      !gender ||
      (showSekolahField && !sekolah) ||
      (showKelasField && !kelas)
    }
  >
    {isLoading ? (
      <>
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span>Loading...</span>
      </>
    ) : (
      'Selesai'
    )}
  </button>
</div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
