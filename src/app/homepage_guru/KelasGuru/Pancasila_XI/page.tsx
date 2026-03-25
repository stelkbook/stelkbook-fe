"use client";

import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar_Guru";
import PageFlipBook from "@/components/PageFlipBook2";

function Page() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Navbar */}
      <div className="mb-8"><Navbar /></div>

      {/* Main Content */}
      <main className="pt-20 px-8"> {/* Added padding to avoid overlap with navbar */}

        {/* Studi Anda Section */}
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
                  <p className="text-xl font-semibold font-poppins">Kelas XI</p>
                  <div className="mx-2">
                    <Image
                      src="/assets/Kelas_X/Primary_Direct.png"
                      alt="Breadcrumb Divider"
                      width={10}
                      height={16}
                    />
                  </div>
                  <p className="text-xl font-semibold font-poppins">
                    Pancasila
                  </p>
                </div>

        {/* Book and Flipbook Section */}
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Book Cover and Metadata */}
          <div className="flex flex-col items-center lg:items-start">
            {/* Book Cover */}
            <div className="mb-6">
              <Image
                src="/assets/Kelas_XI/Buku_Pancasila.png"
                alt="Pancasila SMA Kelas XI"
                width={200}
                height={280}
                className="rounded-lg shadow-md"
              />
            </div>

            {/* Book Metadata */}
            <div className="text-center lg:text-left">
              <h2 className="text-lg font-bold">
                Pendidikan <br /> Pancasila untuk  <br /> SMA/MA/SMK/ <br/> MAK Kelas XI
              </h2>
              <ul className="mt-2 text-sm space-y-1">
                <li className="whitespace-nowrap">
                  <strong>Penerbit:</strong> Pusat Perbukuan
                </li>
                <li className="whitespace-nowrap">
                  <strong>Penulis:</strong> Sri Cahyati
                </li>
                <li className="whitespace-nowrap">
                  <strong>Tahun:</strong> 2023
                </li>
                <li className="whitespace-nowrap">
                  <strong>ISBN:</strong> 9786231946232
                </li>
              </ul>
            </div>
          </div>

          {/* Flipbook */}
          <div className="flex-grow">
            <PageFlipBook pdfUrl="/assets/pdfs/MTK-OLM.pdf" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Page;
