"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar"; // Import the Sidebar component
import { useAuth } from "@/context/authContext";
import { getStorageUrl } from '@/helpers/storage';


const Navbar: React.FC = () => {
  const {user} = useAuth();
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
      <header className="w-full fixed top-0 left-0 bg-white shadow-md z-50 h-16 md:h-20">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-full space-x-4">
          {/* Logo and Menu Icon */}
          <div className="flex items-center space-x-4">
            {/* Menu Icon */}
            <button
              onClick={toggleSidebar}
              className="focus:outline-none"
            >
             
            </button>

            {/* Logo (Responsive Changes) */}
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={() => handleNavigation("/admin")}
            >
              {/* Use different logos based on screen size */}
              <Image
                src="/assets/Class/iconstelkbook.png"
                alt="Logo Small"
                width={50}
                height={50}
                className="block md:hidden"
                // priority = {true}
              />
              <Image
                src="/assets/icon/stelkbook-logo-navbar.svg"
                alt="Logo Full"
                width={148}
                height={88}
                className="w-28 md:w-40 hidden md:block"
                priority = {true}
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-grow flex justify-center relative">
            <div className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 flex items-center bg-[#F5F5F5] rounded-full px-4 py-2 shadow-sm">
              <Image
                src="/assets/icon/search.svg"
                alt="Search Icon"
                width={20}
                height={20}
                className="mr-3"
              />
              <input
                type="text"
                placeholder="Pencarian disini"
                className="flex-grow bg-transparent border-none text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Profile Icon */}
          <div className="flex items-center space-x-4">
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={() => handleNavigation("/profile_admin")}
            >
              <Image
               src={user?.avatar ? getStorageUrl(user?.avatar) : "/assets/Class/Icon_user.png"} alt="User Icon" width={30} height={30} quality={100}
                className="rounded-full object-cover md:w-[35px] md:h-[35px]"
                style={{width: 'auto', height: 'auto'}}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
