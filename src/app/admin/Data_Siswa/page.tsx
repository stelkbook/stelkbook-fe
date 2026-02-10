"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HapusUserModal from "./hapus_user";
import Navbar from "@/components/Navbar_Admin";
import { useAuth } from "@/context/authContext";

// Definisi tipe Siswa
interface Siswa {
  id: string;
  user_id: string;
  username: string; // Gunakan ini sebagai `name`
  nis: string;
  gender: string;
  sekolah: string;
  kelas:string;
}

function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState({ id: "", name: "", sekolah: "", nis: "",kelas:"" });
  const { fetchAllSiswaSd, fetchAllSiswaSmp, fetchAllSiswaSmk, siswaSdData, siswaSmpData, siswaSmkData } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("SD"); // Default tab
  const [loading, setLoading] = useState(false);

  // Fetch data based on active tab
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        if (activeTab === "SD") {
            if (!siswaSdData || siswaSdData.length === 0) await fetchAllSiswaSd();
        } else if (activeTab === "SMP") {
            if (!siswaSmpData || siswaSmpData.length === 0) await fetchAllSiswaSmp();
        } else if (activeTab === "SMK") {
            if (!siswaSmkData || siswaSmkData.length === 0) await fetchAllSiswaSmk();
        }
      } catch (error) {
        console.error(`Gagal mengambil data siswa ${activeTab}:`, error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [activeTab, fetchAllSiswaSd, fetchAllSiswaSmp, fetchAllSiswaSmk]); // Removed data dependencies to avoid infinite loops, but we check length inside

  // Helper to get current data
  const getCurrentData = () => {
    switch (activeTab) {
      case "SD": return siswaSdData || [];
      case "SMP": return siswaSmpData || [];
      case "SMK": return siswaSmkData || [];
      default: return [];
    }
  };

  const currentData = getCurrentData();

  // Fungsi untuk membuka modal hapus user
  const handleDeleteUser = (siswa: Siswa) => {
    setSelectedSiswa({ id: siswa.id, name: siswa.username, sekolah: siswa.sekolah, nis: siswa.nis , kelas:siswa.kelas });
    setIsModalOpen(true);
  };

  const handleEditUser = (siswa: Siswa) => {
    router.push(`/admin/Data_Siswa/Edit_user?id=${siswa.id}`);
  };
  
  return (
    <div className="min-h-screen p-8 bg-gray-50 overflow-y-auto">
      <header className="flex justify-between items-center mb-4 pt-20 px-8">
        <Navbar />
      </header>

      <div className="mb-8 flex items-center ">
        <p className="text-xl font-semibold text-left font-poppins translate-y-[-15px]">
          Database Anda
        </p>
        <div className="mx-2">
          <Image
            src="/assets/Kelas_X/Primary_Direct.png"
            alt="Divider Icon"
            width={10}
            height={16}
            className="translate-y-[-15px] translate-x-[1px]"
          />
        </div>
        <p className="text-xl font-semibold text-left font-poppins translate-y-[-15px]">
          Siswa
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {['SD', 'SMP', 'SMK'].map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 font-semibold transition-colors duration-200 ${
              activeTab === tab 
                ? 'border-b-2 border-OldRed text-OldRed' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data List */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="text-xl text-OldRed font-semibold mb-4">{activeTab}</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-OldRed"></div>
          </div>
        ) : currentData.length > 0 ? (
          currentData.map((siswa: Siswa) => (
            <div
              key={siswa.id}
              className="grid grid-cols-12 gap-4 items-center py-4 border-b last:border-0"
            >
              <div className="col-span-4 flex items-center">
                <Image
                  src="/assets/Class/icon_user.png"
                  alt="User Icon"
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">{siswa.username}</p>
                  <p className="font-semibold text-sm text-OldRed">{siswa.sekolah}</p>
                  <p className="text-sm text-gray-500">{siswa.nis}</p>
                  <p className="text-sm text-gray-500">Kelas {siswa.kelas}</p>
                </div>
              </div>
              <div className="col-span-8 flex justify-end space-x-2">
                <button
                  className="flex flex-col items-center justify-center w-12 h-12 md:w-auto md:h-auto md:flex-row md:px-8 md:py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                  onClick={() => handleEditUser(siswa)}
                >
                  <Image
                    src="/assets/icon/edit.svg"
                    alt="Edit Icon"
                    width={16}
                    height={16}
                    className="md:mr-2"
                  />
                  <span className="hidden md:block">Edit User</span>
                </button>
                <button
                  className="flex flex-col items-center justify-center w-12 h-12 md:w-auto md:h-auto md:flex-row md:px-8 md:py-2 text-white bg-red rounded-lg hover:bg-red-600"
                  onClick={() => handleDeleteUser(siswa)}
                >
                  <Image
                    src="/assets/icon/delete.svg"
                    alt="Delete Icon"
                    width={16}
                    height={16}
                    className="md:mr-2"
                  />
                  <span className="hidden md:block">Hapus User</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data siswa {activeTab} tersedia.
          </div>
        )}
      </div>

      {/* Modal Hapus User */}
      {isModalOpen && (
        <HapusUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          siswa={selectedSiswa}
        />
      )}
    </div>
  );
}

export default Page;