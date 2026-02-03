import React from 'react';

const SkeletonBookDetail: React.FC = () => {
  return (
    <div className="h-screen p-8 bg-gray-50 overflow-y-auto animate-pulse">
      {/* Navbar Skeleton */}
      <header className="flex justify-between items-center mb-4">
        <div className="pt-12 px-8 w-full">
          <div className="h-16 bg-gray-200 rounded-lg w-full"></div>
        </div>
      </header>

      {/* Breadcrumb Skeleton */}
      <div className="mb-8 flex items-center gap-2">
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        {/* Left Side (Cover & Info) */}
        <div className="flex flex-col items-center lg:items-start w-full lg:w-auto">
          {/* Cover Image */}
          <div className="w-[200px] h-[280px] bg-gray-300 rounded-lg shadow-md mb-6"></div>

          {/* Text Info */}
          <div className="text-center lg:text-left w-full max-w-[200px] space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto lg:mx-0"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col gap-3 w-full max-w-[200px]">
            <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
          </div>
        </div>

        {/* Right Side (Flipbook Placeholder) */}
        <div className="flex-grow w-full h-[600px] bg-gray-200 rounded-lg shadow-inner flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonBookDetail;
