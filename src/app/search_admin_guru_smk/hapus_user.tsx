'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/authContext';
import { getStorageUrl } from '@/helpers/storage';


interface Guru {
  id: string;
  username: string;
  nip: string;
  sekolah: string;
  kelas: string;
  avatar?: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  guru: Guru;
  onSuccess?: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  guru,
  onSuccess,
}) => {
  const { deleteGuruSmk, fetchAllGuruSmk } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteGuruSmk(guru.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError('Gagal menghapus guru SMK. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] text-center">
        <p className="text-lg font-semibold mb-4">
          Apakah Anda yakin ingin menghapus guru SMK ini?
        </p>
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="relative w-12 h-12">
           <Image
                                   src={
                                     guru.avatar
                                       ? getStorageUrl(guru.avatar)
                                       : "/assets/Class/icon_user.png"
                                   }
                                   alt="User Icon"
                                   width={48}
                                   height={48}
                                   className="rounded-full object-cover"
                                   style={{width:'48px',height:'48px'}}
                                 />
          </div>
          <div>
            <p className="font-bold">{guru.username}</p>
            <p className="font-semibold text-OldRed">{guru.sekolah}</p>
            <p className="font-semibold text-OldRed">Kelas {guru.kelas}</p>
            <p className="text-gray-500">{guru.nip}</p>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <div className="flex justify-around mt-4">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-10 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Menghapus...' : 'Ya'}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-8 py-2 text-white bg-red rounded-lg hover:bg-red ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Tidak
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;