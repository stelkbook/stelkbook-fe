import { Suspense } from 'react';
import EditBukuContent from './EditBukuContent';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    }>
      <EditBukuContent />
    </Suspense>
  );
}
