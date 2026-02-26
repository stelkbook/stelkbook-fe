'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import useAuthMiddleware from '@/hooks/auth';
import Navbar from '@/components/Navbar_Lainnya_Perpus2'; // Assuming this is the correct navbar
import { FaCheck, FaTimes, FaSort, FaSortUp, FaSortDown, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface PendingUser {
  id: number;
  username: string;
  email: string;
  role: string;
  kode: string;
  sekolah: string;
  kelas?: string;
  created_at?: string; // Assuming timestamp is available
  // Add other fields as necessary
}

export default function RegistrationRequestsPage() {
  useAuthMiddleware();
  const router = useRouter();
  const { user, fetchPendingUsers, approveUser, rejectUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof PendingUser; direction: 'asc' | 'desc' } | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // Track loading state for specific user action

  useEffect(() => {
    const loadData = async () => {
      try {
        const users = await fetchPendingUsers();
        setPendingUsers(users);
      } catch (error) {
        console.error("Failed to fetch pending users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchPendingUsers]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await approveUser(id);
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
      // Optionally show success message
    } catch (error) {
      console.error("Failed to approve user:", error);
      alert("Gagal menyetujui pengguna.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menolak permintaan ini?")) return;
    setActionLoading(id);
    try {
      await rejectUser(id);
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Failed to reject user:", error);
      alert("Gagal menolak pengguna.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSort = (key: keyof PendingUser) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...pendingUsers];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [pendingUsers, sortConfig]);

  const getSortIcon = (key: keyof PendingUser) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort className="ml-1 inline text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp className="ml-1 inline text-gray-600" /> : <FaSortDown className="ml-1 inline text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Navbar />
      
      <div className="px-6 mt-6 pt-20 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800 transition-colors">
                <FaArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Daftar Permintaan Registrasi</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {pendingUsers.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                    <p className="text-lg">Tidak ada permintaan registrasi yang menunggu persetujuan.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    No
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('username')}
                                >
                                    Username {getSortIcon('username')}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('email')}
                                >
                                    Email {getSortIcon('email')}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('role')}
                                >
                                    Role {getSortIcon('role')}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('kode')}
                                >
                                    NIS/NIP {getSortIcon('kode')}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('sekolah')}
                                >
                                    Sekolah {getSortIcon('sekolah')}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Kelas
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('created_at')}
                                >
                                    Tanggal {getSortIcon('created_at')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedUsers.map((user, index) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.role === 'Siswa' ? 'bg-red-100 text-red-800' : 
                                            user.role === 'Guru' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.kode}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.sekolah}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.kelas || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                disabled={actionLoading === user.id}
                                                className={`text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md text-xs transition-colors flex items-center gap-1 ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <FaCheck /> Setujui
                                            </button>
                                            <button
                                                onClick={() => handleReject(user.id)}
                                                disabled={actionLoading === user.id}
                                                className={`text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-xs transition-colors flex items-center gap-1 ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <FaTimes /> Tolak
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
