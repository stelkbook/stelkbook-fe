"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { getStorageUrl } from '@/helpers/storage';


const Navbar: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      router.push(
        `/search_admin_perpus_siswa_smp?q=${encodeURIComponent(searchTerm.trim())}`
      );
    }
  };

  return (
    <>
      {/* Navbar */}
      <header className="w-full fixed top-0 left-0 bg-white shadow-md z-50 h-20">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-full space-x-4">
          {/* Logo */}
          <div className="flex items-center">
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={() => handleNavigation("/admin_perpus")}
            >
              {/* Mobile Logo */}
              <div className="block md:hidden w-[50px] h-[50px] relative">
                <Image
                  src="/assets/Class/iconstelkbook.png"
                  alt="Logo Small"
                  fill
                  sizes="50px"
                  className="object-contain"
                />
              </div>

              {/* Desktop Logo */}
              <div className="hidden md:block w-[148px] h-[88px] relative">
                <Image
                  src="/assets/icon/stelkbook-logo-navbar.svg"
                  alt="Logo Full"
                  fill
                  sizes="148px"
                  className="object-contain"
                  priority={true}
                />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-grow flex justify-center relative">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 flex items-center bg-[#F5F5F5] rounded-full px-4 py-2 shadow-sm"
            >
              <div className="w-[20px] h-[20px] relative mr-3">
                <Image
                  src="/assets/icon/search.svg"
                  alt="Search Icon"
                  fill
                  sizes="20px"
                  className="object-contain"
                />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari siswa SMP..."
                className="flex-grow bg-transparent border-none text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-0"
              />
            </form>
          </div>

          {/* Profile Icon */}
          <div className="flex items-center space-x-4">
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={() => handleNavigation("/profile_perpus3")}
            >
              <div className="w-[30px] h-[30px] md:w-[35px] md:h-[35px] relative rounded-full overflow-hidden">
                <Image
                  src={
                    user?.avatar
                      ? getStorageUrl(user?.avatar)
                      : "/assets/Class/Icon_user.png"
                  }
                  alt="User Icon"
                  fill
                  sizes="35px"
                  className="object-cover"
                  quality={100}
                />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
