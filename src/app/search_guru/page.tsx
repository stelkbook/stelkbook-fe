import { Suspense } from "react";
import SearchGuruContent from "./SearchGuruContent";

const Page = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center items-center bg-white">
        <div className="w-14 h-14 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4 text-lg">Memuat pencarian...</p>
      </div>
    }>
      <SearchGuruContent />
    </Suspense>
  );
};

export default Page;
