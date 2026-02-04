'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface NotificationProps {
  message: string;
  description: string;
  onClose: () => void;
}

const NotificationSuccess: React.FC<NotificationProps> = ({ message, description, onClose }) => {
  const router = useRouter();

  const handleRedirect = () => {
    // Direct to a full URL, e.g., 'http://localhost:3000/'
    router.push('/profile_perpus'); // Use full URL for redirection
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-80 p-6 text-center">
        <h2
          className="text-xl font-semibold mb-4"
          style={{ fontFamily: 'Poppins, sans-serif', color: '#333' }}
        >
          {message}
        </h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <button
          className="bg-red text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
          onClick={handleRedirect} // Trigger the redirect on button click
        >
          Oke
        </button>
      </div>
    </div>
  );
};

export default NotificationSuccess;
