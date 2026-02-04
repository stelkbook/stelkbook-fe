import { Suspense } from 'react';
import SearchGuruSDContent from './SearchGuruSDContent';

export default function SearchGuruSD() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchGuruSDContent />
    </Suspense>
  );
}
