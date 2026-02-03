"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HapusUserModal from "./hapus_user";
import Navbar from "@/components/Navbar_Admin_Perpus2";
import { useAuth } from "@/context/authContext";
import { getStorageUrl } from '@/helpers/storage';


interface Perpus {
  id: string;
  user_id: string;
  username: string;
  nip: string;
  gender: string;
  avatar: string;
}

function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerpus, setSelectedPerpus] = useState({
    id: "",
    name: "",
    nip: "",
    avatar: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const { fetchAllPerpus, perpusData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const getPerpusData = async () => {
      try {
        setIsLoading(true);
        await fetchAllPerpus();
      } catch (error) {
        console.error("Gagal mengambil data perpus:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getPerpusData();
  }, [fetchAllPerpus]);

  const handleDeleteUser = (perpus: Perpus) => {
    setSelectedPerpus({
      id: perpus.id,
      name: perpus.username,
      nip: perpus.nip,
      avatar: perpus.avatar
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (perpus: Perpus) => {
    router.push(`/admin_perpus/Data_perpus/Edit_user_perpus?id=${perpus.id}`);
  };

  const handleDeleteSuccess = async () => {
    try {
      setIsLoading(true);
      await fetchAllPerpus();
    } catch (error) {
      console.error("Gagal refresh data perpus:", error);
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
          onClick={() => handleButtonClick("admin_perpus/")}
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
            style={{ width: "auto", height: "auto" }}
          />
        </div>
        <p className="text-xl font-semibold text-left font-poppins translate-y-[-15px]">
          Perpus
        </p>
      </div>

      {/* Tambah Perpus Button */}
      <div className="relative mb-4">
        <button
          className="absolute right-0 top-0 w-10 h-10 bg-red text-white text-xl rounded-full flex items-center justify-center shadow translate-y-[-60px]"
          onClick={() => router.push("/admin_perpus/Create_User_Perpus")}
          title="Create_User"
        >
          +
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          {perpusData?.length > 0 ? (
            perpusData?.map((perpus: Perpus) => (
              <div
                key={perpus.id}
                className="grid grid-cols-12 gap-4 items-center py-4 border-b"
              >
                <div className="col-span-4 flex items-center">
                  <Image
                    src={
                      perpus.avatar
                        ? getStorageUrl(perpus.avatar)
                        : "/assets/Class/icon_user.png"
                    }
                    alt="User Icon"
                    width={48}
                    height={48}
                    quality={100}
                    className="object-cover rounded-full mr-3"
                    style={{ width: "48px", height: "48px" }}
                  />
                  <div>
                    <p className="font-semibold">{perpus.username}</p>
                    <p className="text-sm text-gray-500">{perpus.nip}</p>
                  </div>
                </div>
                <div className="col-span-8 flex justify-end space-x-2">
                  <button
                    className="flex flex-col items-center justify-center w-12 h-12 md:w-auto md:h-auto md:flex-row md:px-8 md:py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                    onClick={() => handleEditUser(perpus)}
                  >
                    <Image
                      src="/assets/icon/edit.svg"
                      alt="Edit Icon"
                      width={16}
                      height={16}
                      className="md:mr-2"
                      style={{ width: "auto", height: "auto" }}
                    />
                    <span className="hidden md:block">Edit User</span>
                  </button>

                  <button
                    className="flex flex-col items-center justify-center w-12 h-12 md:w-auto md:h-auto md:flex-row md:px-8 md:py-2 text-white bg-red rounded-lg hover:bg-red-600"
                    onClick={() => handleDeleteUser(perpus)}
                  >
                    <Image
                      src="/assets/icon/delete.svg"
                      alt="Delete Icon"
                      width={16}
                      height={16}
                      className="md:mr-2"
                      style={{ width: "auto", height: "auto" }}
                    />
                    <span className="hidden md:block">Hapus User</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Tidak ada data pengurus perpus tersedia.
            </p>
          )}
        </div>
      )}

      {isModalOpen && (
        <HapusUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          perpus={selectedPerpus}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

export default Page;
