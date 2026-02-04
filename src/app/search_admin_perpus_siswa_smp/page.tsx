'use client'
import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/authContext";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import ConfirmationModal from "./hapus_user";
import Navbar from "@/components/Navbar_Admin_Perpus_SMP";
import { getStorageUrl } from '@/helpers/storage';


interface Siswa {
  id: string;
  username: string;
  nis: string;
  sekolah: string;
  kelas: string;
  avatar?: string;
}

const SearchSiswaSMPContent: React.FC = () => {
  const { siswaSmpData, fetchAllSiswaSmp } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [filteredSiswa, setFilteredSiswa] = useState<Siswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  useEffect(() => {
    const getSiswaData = async () => {
      try {
        setIsLoading(true);
        await fetchAllSiswaSmp(); // Ambil data siswa SMP
      } catch (error) {
        console.error("Gagal mengambil data siswa:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getSiswaData();
  }, [fetchAllSiswaSmp]);

  useEffect(() => {
    if (query && siswaSmpData?.length > 0) {
      const results = siswaSmpData.filter(
        (siswa: Siswa) =>
          siswa.username.toLowerCase().includes(query) ||
          (siswa.nis && siswa.nis.toLowerCase().includes(query)) ||
          (siswa.sekolah && siswa.sekolah.toLowerCase().includes(query)) ||
          (siswa.kelas && siswa.kelas.toLowerCase().includes(query))
      );
      setFilteredSiswa(results);
    } else {
      setFilteredSiswa(siswaSmpData || []);
    }
  }, [query, siswaSmpData]);

  const handleDeleteSiswa = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setIsModalOpen(true);
  };

  const handleDeleteSuccess = async () => {
    try {
      setIsLoading(true);
      await fetchAllSiswaSmp();
    } catch (error) {
      console.error("Gagal refresh data siswa:", error);
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

      {/* Breadcrumb */}
      <div className="mb-8 flex items-center">
        <p
          className="text-xl font-semibold text-left font-poppins translate-y-[-15px] hover:underline cursor-pointer"
          onClick={() => handleButtonClick('admin_perpus/Sekolah_Siswa')}
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
          Siswa SMP {query && `- Hasil pencarian: "${query}"`}
        </p>
      </div>

      {/* Tambah Siswa Button */}
      <div className="relative mb-4">
        <button
          className="absolute right-0 top-0 w-10 h-10 bg-red text-white text-xl rounded-full flex items-center justify-center shadow translate-y-[-60px]"
          onClick={() => router.push("/admin_perpus/Create_User_Siswa_SMP")}
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
          {filteredSiswa?.length > 0 ? (
            filteredSiswa.map((siswa: Siswa) => (
              <div
                key={siswa.id}
                className="grid grid-cols-12 gap-4 items-center py-4 border-b"
              >
                {/* Info Siswa */}
                <div className="col-span-4 flex items-center">
                  <Image
                    src={
                      siswa.avatar
                        ? getStorageUrl(siswa.avatar)
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
                    <p className="font-semibold">{siswa.username}</p>
                    <p className="text-sm text-gray-500">{siswa.nis}</p>
                    <p className="font-semibold text-sm text-OldRed">Sekolah: {siswa.sekolah}</p>
                    <p className="font-semibold text-sm text-OldRed">Kelas: {siswa.kelas}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="col-span-8 flex justify-end space-x-2">
                  <button
                    className="flex flex-col items-center justify-center w-12 h-12 md:w-auto md:h-auto md:flex-row md:px-8 md:py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                    onClick={() => router.push(`/admin_perpus/Sekolah_Siswa/Data_SMP/Edit_user?id=${siswa.id}`)}
                  >
                   <Image
                                         src="/assets/icon/edit.svg"
                                         alt="Edit Icon"
                                         width={16}
                                         height={16}
                                         className="md:mr-2"
                                         style={{ width: 'auto', height: 'auto' }}
                                       />
                    <span className="hidden md:block">Edit Siswa</span>
                  </button>

                  <button
                    className="flex flex-col items-center justify-center w-12 h-12 md:w-auto md:h-auto md:flex-row md:px-8 md:py-2 text-white bg-red rounded-lg hover:bg-red-600"
                    onClick={() => handleDeleteSiswa(siswa)}
                  >
                      <Image
                                          src="/assets/icon/delete.svg"
                                          alt="Delete Icon"
                                          width={16}
                                          height={16}
                                          className="md:mr-2"
                                          style={{ width: 'auto', height: 'auto' }}
                                        />
                    <span className="hidden md:block">Hapus Siswa</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              {query ? "Tidak ada hasil ditemukan untuk pencarian Anda." : "Tidak ada data siswa SMP tersedia."}
            </p>
          )}
        </div>
      )}

      {isModalOpen && selectedSiswa && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          siswa={selectedSiswa}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default function SearchSiswaSMP() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    }>
      <SearchSiswaSMPContent />
    </Suspense>
  );
}