"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./hapus_user";
import Navbar from "@/components/Navbar_Admin_Guru_SMK";
import { useAuth } from "@/context/authContext";
import { getStorageUrl } from '@/helpers/storage';


interface Guru {
  id: string;
  username: string;
  nip: string;
  sekolah: string;
  avatar?: string;
  kelas: string;
}

function DataGuruSMK() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchAllGuruSmk, guruSmkData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const getGuruData = async () => {
      try {
        setIsLoading(true);
        await fetchAllGuruSmk();
      } catch (error) {
        console.error("Gagal mengambil data guru:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getGuruData();
  }, [fetchAllGuruSmk]);

  const handleDeleteUser = (guru: Guru) => {
    setSelectedGuru(guru);
    setIsModalOpen(true);
  };

  const handleEditUser = (guru: Guru) => {
    router.push(`/admin/Sekolah_Guru/Data_SMK/Edit_user?id=${guru.id}`);
  };

  const handleDeleteSuccess = async () => {
    try {
      setIsLoading(true);
      await fetchAllGuruSmk();
    } catch (error) {
      console.error("Gagal refresh data guru:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (destination: string) => {
    router.push(`/${destination}`);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 overflow-y-auto">
      <header className="flex justify-between items-center mb-4 pt-20 px-8">
        <Navbar />
      </header>

      <div className="mb-8 flex items-center">
        <p 
          className="text-xl font-semibold text-left font-poppins translate-y-[-15px] hover:underline cursor-pointer"
          onClick={() => handleButtonClick('admin/Sekolah_Guru')}
        >
          Database Anda
        </p>
        <div className="mx-2">
          <Image
            src="/assets/Kelas_X/Primary_Direct.png"
            alt="Divider Icon"
            width={10}
            height={16}
            className="translate-y-[-15px] translate-x-[1px]"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
        <p className="text-xl font-semibold text-left font-poppins translate-y-[-15px]">
          Guru SMK
        </p>
      </div>

      {/* Tambah Guru Button */}
      <div className="relative mb-4">
        <button
          className="absolute right-0 top-0 w-10 h-10 bg-red text-white text-xl rounded-full flex items-center justify-center shadow translate-y-[-60px]"
          onClick={() => router.push("/admin/Create_User_Guru_SMK")}
          title="Create_User"
        >
          +
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          {guruSmkData?.length > 0 ? (
            guruSmkData.map((guru: Guru) => (
              <div
                key={guru.id}
                className="grid grid-cols-12 gap-4 items-center py-4 border-b"
              >
                <div className="col-span-4 flex items-center">
                  <Image
                    src={
                      guru.avatar
                        ? getStorageUrl(guru.avatar)
                        : "/assets/Class/icon_user.png"
                    }
                    alt="User Icon"
                    width={48}
                    height={48}
                    quality={100}
                    className="object-cover rounded-full mr-3"
                    style={{ width: '48px', height: '48px' }}
                  />
                  <div>
                    <p className="font-semibold">{guru.username}</p>
                    <p className="text-sm text-gray-500">{guru.nip}</p>
                    <p className="font-semibold text-sm text-OldRed">Sekolah: {guru.sekolah}</p>
                  </div>
                </div>
                <div className="col-span-8 flex justify-end space-x-2">
                  <button
                  type="button"
                    className="flex flex-col items-center justify-center w-12 h-12 md:w-auto md:h-auto md:flex-row md:px-8 md:py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                    onClick={() => handleEditUser(guru)}
                  >
                    <Image
                      src="/assets/icon/edit.svg"
                      alt="Edit Icon"
                      width={16}
                      height={16}
                      className="md:mr-2"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                    <span className="hidden md:block">Edit Guru</span>
                  </button>

                  <button
                  type="button"
                    className="flex flex-col items-center justify-center w-12 h-12 md:w-auto md:h-auto md:flex-row md:px-8 md:py-2 text-white bg-red rounded-lg hover:bg-red-600"
                    onClick={() => handleDeleteUser(guru)}
                  >
                    <Image
                      src="/assets/icon/delete.svg"
                      alt="Delete Icon"
                      width={16}
                      height={16}
                      className="md:mr-2"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                    <span className="hidden md:block">Hapus Guru</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Tidak ada data guru SMK tersedia.
            </p>
          )}
        </div>
      )}

      {isModalOpen && selectedGuru && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          guru={selectedGuru}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

export default DataGuruSMK;