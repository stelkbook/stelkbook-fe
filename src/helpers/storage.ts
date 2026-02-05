
export const getStorageUrl = (path: string | null | undefined) => {
  if (!path) return '/assets/default-cover.png';
  if (path.startsWith('http')) return path;

  // Handle local storage paths returned by backend (e.g., /storage/covers/...)
  if (path.startsWith('/storage/')) {
    return `http://localhost:8000${path}`;
  }
  
  const SUPABASE_URL = 'https://wflgdeqrzwtithgscpsi.supabase.co/storage/v1/object/public';
  
  // Check for common prefixes used in BookController
  if (path.startsWith('books/')) {
    return `${SUPABASE_URL}/pdf_buku/${path}`;
  }
  
  if (path.startsWith('covers/')) {
    return `${SUPABASE_URL}/img_cover/${path}`;
  }

  // Fallback for other paths (or legacy)
  return `http://localhost:8000/storage/${path}`;
};
