'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar_Lainnya_Admin';
import WarningModal from '@/app/profile_admin/WarningLogout';
import { useAuth } from '@/context/authContext';
import useAuthMiddleware from '@/hooks/auth';
import { getStorageUrl } from '@/helpers/storage';


function Page() {
  useAuthMiddleware();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user data is available
    if (user !== null && user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  const handleLogoutClick = () => {
    setShowWarningModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowWarningModal(false);
  };

  // Show loading while user data is not available
  if (isLoading || !user) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <header className="flex justify-between items-center mb-4">
          <div className="mb-8"><Navbar /></div>
        </header>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <header className="flex justify-between items-center mb-4">
        <div className="mb-8"><Navbar /></div>
      </header>

      {/* Profile Section */}
      <div className="flex justify-center pt-12 px-8">
        <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-lg w-full max-w-3xl flex flex-col items-center">
          {/* Profile Image */}
          <div className="flex justify-center items-center mb-6">
            <Image
              src={user.avatar ? getStorageUrl(user.avatar) : "/assets/Class/Icon_user.png"} 
              alt="Profile Picture"
              width={200}
              height={200}
              quality={100}
              className="w-48 h-48 object-cover rounded-full"
              priority = {true}
              style={{ width: 'auto', height: 'auto' }}
              onError={(e) => {
                e.currentTarget.src = "/assets/Class/Icon_user.png";
              }}
            />
          </div>

          {/* Profile Details */}
          <div className="flex flex-col w-full">
            {/* Input Fields */}
            <div className="grid gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Nama</label>
                <input
                  type="text"
                  value={user.username || ''}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">NIP</label>
                <input
                  type="text"
                  value={user.kode || user.nip || ''}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <input
                  type="text"
                  value={user.email || ''}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Status</label>
                  <input
                    type="text"
                    value={user.role || ''}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Gender</label>
                  <input
                    type="text"
                    value={user.gender || ''}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
              {/* Action Buttons */}
<div className="flex justify-center mt-6">
  <button
    onClick={handleLogoutClick}
    disabled={isLoading}
    className="w-full md:w-auto bg-red text-white px-10 py-2  rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
  >
    <Image
      src="/assets/Class/logout.png"
      alt="Logout Icon"
      width={24} // lebih besar
      height={24}
      className="w-5 h-5 md:w-6 md:h-6 object-contain"
    />
    <span className="text-sm md:text-base">
      {isLoading ? 'Logging out...' : 'Logout'}
    </span>
  </button>
</div>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <WarningModal
          onClose={handleCloseModal}
          onConfirm={handleConfirmLogout}
          isLoading={isLoading} // ← TAMBAHKAN INI
        />
      )}
    </div>
  );
}

export default Page;