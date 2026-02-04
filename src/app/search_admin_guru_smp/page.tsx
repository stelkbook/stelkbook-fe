import { Suspense } from "react";
import SearchGuruSMPContent from "./SearchGuruSMPContent";

export default function SearchGuruSMP() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    }>
      <SearchGuruSMPContent />
    </Suspense>
  );
}
