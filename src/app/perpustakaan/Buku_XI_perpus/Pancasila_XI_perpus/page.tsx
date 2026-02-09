"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import WarningModalBuku from "./WarningModalBuku2";
import PageFlipBook from "@/components/PageFlipBook2";
import Navbar from '@/components/Navbar_Perpus';

function Page() {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const router = useRouter();

  return (
    <div className="h-screen p-8 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <div className="pt-12 px-8">
          <Navbar />
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mb-8 flex items-center justify-start">
        <p className="text-xl font-semibold font-poppins">Studi Anda</p>
        <Image src="/assets/Kelas_X/Primary_Direct.png" alt="Breadcrumb Divider" width={10} height={16} className="mx-2" />
        <p className="text-xl font-semibold font-poppins">Kelas XI</p>
        <Image src="/assets/Kelas_X/Primary_Direct.png" alt="Breadcrumb Divider" width={10} height={16} className="mx-2" />
        <p className="text-xl font-semibold font-poppins">Pendidikan Pancasila</p>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Book Info */}
        <div className="flex flex-col items-center lg:items-start">
          <Image src="/assets/Kelas_XI/Buku_Pancasila.png" alt="Ekonomi" width={200} height={280} className="rounded-lg shadow-md mb-6" />

          <div className="text-center lg:text-left">
            <h2 className="text-lg font-bold">Pendidikan <br /> Pancasila untuk <br /> SMA/MA/SMK/ <br/> MAK Kelas XI </h2>
            <ul className="mt-2 text-sm space-y-1">
              <li><strong>Penerbit:</strong> Pusat Perbukuan</li>
              <li><strong>Penulis:</strong> Sri Cahyati</li>
              <li><strong>Tahun:</strong> 2023</li>
              <li><strong>ISBN:</strong> 9786231946232</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <button onClick={() => router.push("/perpustakaan/Edit_Buku/Edit_Pancasila_XI")} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 flex items-center gap-2">
              <Image src="/assets/icon/edit.svg" alt="Edit Icon" width={16} height={16} />
              <span>Edit Buku</span>
            </button>
            <button onClick={() => setShowWarningModal(true)} className="bg-red text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 flex items-center gap-2">
              <Image src="/assets/icon/delete.svg" alt="Delete Icon" width={16} height={16} />
              <span>Hapus Buku</span>
            </button>
          </div>
        </div>

        {/* Flipbook */}
        <div className="flex-grow overflow-x-auto w-full">
          <PageFlipBook pdfUrl="/assets/pdfs/MTK-OLM.pdf" align="start" />
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
    </div>
  );
}

export default Page;
