"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import Image from "next/image";
import WarningModalBuku from "./WarningModalBuku3";


function Page() {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const router = useRouter();

  // Chapter data
  const chapters = [
    "Konsep Ilmu Ekonomi",
    "Masalah Ekonomi Dalam Sistem Ekonomi",
    "Peran Pelaku Ekonomi Dalam Kegiatan Ekonomi",
    "Keseimbangan dan Struktur Pasar",
    "Lembaga Jasa Keuangan",
    "Bank Sentral Sistem Pembayaran, dan Alat Pembayaran",
    "Badan Usaha dalam Perekonomian Indonesia",
    "Koperasi",
    "Manajemen",
  ];

  return (
    <>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <div className="h-screen p-8 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-4">
          <div className="flex-shrink-0">
            <Image
              src="/assets/Class/Stelk_bookTitle.png"
              alt="Stelkbook"
              width={165}
              height={100}
            />
          </div>

          <div className="relative flex-grow max-w-md mx-4">
            <input
              type="text"
              placeholder="Pencarian disini"
              className="w-full pl-10 pr-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Image
                src="/assets/Class/Search_icon.png"
                alt="Search Icon"
                width={20}
                height={20}
              />
            </div>
          </div>

          <div className="flex-shrink-0">
            <Image
              src="/assets/Class/icon_user.png"
              alt="User Icon"
              width={45}
              height={40}
              className="rounded-full"
            />
          </div>
        </header>

        <div className="mb-8">
          <Image
            src="/assets/Class/Lines.png"
            alt="Header Divider"
            width={3000}
            height={100}
          />
        </div>

        <div className="mb-8 flex items-center">
          <p className="text-xl font-semibold font-poppins">Studi Anda</p>
          <div className="mx-2">
            <Image
              src="/assets/Kelas_X/Primary_Direct.png"
              alt="Breadcrumb Divider"
              width={10}
              height={16}
            />
          </div>
          <p className="text-xl font-semibold font-poppins">Kelas X</p>
          <div className="mx-2">
            <Image
              src="/assets/Kelas_X/Primary_Direct.png"
              alt="Breadcrumb Divider"
              width={10}
              height={16}
            />
          </div>
          <p className="text-xl font-semibold font-poppins">
            Ekonomi
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          <div className="flex flex-col items-center lg:items-start">
            <div className="mb-6 translate-y-[-15px]">
              <Image
                src="/assets/Kelas_X/Buku_Ekonomi.png"
                alt="Ekonomi"
                width={200}
                height={280}
                className="rounded-lg shadow-md"
              />
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-base font-bold translate-y-[-30px]">
                Buku Paket <br /> Ekonomi SMA <br /> Kelas X
              </h2>
              <ul className="mt-2 text-xs space-y-1 translate-y-[-30px]">
                <li className="whitespace-nowrap">
                  <strong>Penerbit:</strong> Yudistira
                </li>
                <li className="whitespace-nowrap">
                  <strong>Penulis:</strong> Endang Mulyadi
                </li>
                <li className="whitespace-nowrap">
                  <strong>Tahun:</strong> 2018
                </li>
                <li className="whitespace-nowrap">
                  <strong>ISBN:</strong> 9786022995708
                </li>
              </ul>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button onClick={() => router.push("/perpustakaan/Edit_Buku/Edit_Ekonomi_X")} 
              className="bg-green-500 text-white px-4 py-2 rounded-lg 
              shadow-md hover:bg-green-600 transition scale-100 duration-300 
              translate-y-[-30px] translate-x-[40px]">
                                  <Image
                                    src="/assets/Admin/Edit_user.png"
                                    alt="Edit Icon"
                                    width={16}
                                    height={16}
                                    className="md:mr-2"
                                  />
                                  <span className="hidden md:block">Edit Buku</span>
              </button>
              <button
                onClick={() => setShowWarningModal(true)}
                className="bg-red text-white px-4 py-2 rounded-lg shadow-md hover:bg-red transition duration-300 scale-100 translate-y-[-20px] translate-x-[40px]"
              >
                                  <Image
                                    src="/assets/Admin/Delete_user.png"
                                    alt="Delete Icon"
                                    width={16}
                                    height={16}
                                    className="md:mr-2"
                                  />
                                  <span className="hidden md:block">Hapus Buku</span>
              </button>
            </div>
          </div>

          <div
            className="bg-white shadow-md rounded-lg overflow-hidden w-full "
            style={{ transform: "scale(0.9)", transformOrigin: "top center" }}
          >
            {chapters.map((chapter, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0"
              >
                <div className="flex items-center justify-center bg-transparent rounded-md p-2">
                  {/* <Image
                    src="/assets/Kelas_details/Book.png"
                    alt={`Bab ${index + 1} Icon`}
                    width={14}
                    height={30}
                  /> */}
                </div>
                <p className="text-sm font-medium text-gray-800 font-poppins">{`Bab ${index + 1}: ${chapter}`}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <WarningModalBuku
          isVisible={showWarningModal}
          onConfirm={() => {
            setShowWarningModal(false);
            console.log("Buku dihapus");
          }}
          onCancel={() => setShowWarningModal(false)}
        />
      )}
    </>
  );
}

export default Page;
