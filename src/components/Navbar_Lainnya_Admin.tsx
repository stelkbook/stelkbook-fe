"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/authContext";
import { getStorageUrl } from '@/helpers/storage';


const Navbar: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Navbar */}
      <header className="w-full fixed top-0 left-0 bg-white shadow-md z-50 h-20">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-full space-x-4">
          {/* Logo and Menu Icon */}
          <div className="flex items-center space-x-4">
            {/* Menu Icon */}
            <button onClick={toggleSidebar} className="focus:outline-none">
              {/* Add your menu icon here */}
            </button>

            {/* Logo (Responsive Changes) */}
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={() => handleNavigation("/admin")}
            >
              {/* Mobile Logo */}
              <div className="relative w-[50px] h-[50px] block md:hidden">
                <Image
                  src="/assets/Class/iconstelkbook.png"
                  alt="Logo Small"
                  fill
                  sizes="50px"
                  className="object-contain"
                 priority = {true}
                />
              </div>
                
              {/* Desktop Logo */}
              <div className="relative w-28 h-[35px] md:w-40 md:h-[50px] hidden md:block">
                <Image
                  src="/assets/icon/stelkbook-logo-navbar.svg"
                  alt="Logo Full"
                  fill
                  sizes="(max-width: 768px) 112px, 160px"
                  className="object-contain"
                  priority={true}
                />
              </div>
            </div>
          </div>

          {/* Profile Icon */}
          <div className="flex items-center space-x-4">
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={() => handleNavigation("/profile_admin")}
            >
              <div className="relative w-[30px] h-[30px] md:w-[35px] md:h-[35px]">
                <Image
                  src={
                    user?.avatar
                      ? getStorageUrl(user.avatar)
                      : "/assets/Class/Icon_user.png"
                  }
                  alt="User Icon"
                  fill
                  sizes="(max-width: 768px) 30px, 35px"
                  className="rounded-full object-cover"
                  quality={100}
                  priority={false}
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