
export const getStorageUrl = (path: string | null | undefined) => {
  if (!path) return '/assets/default-cover.png';
  if (path.startsWith('http')) return path;
  
  const SUPABASE_URL = 'https://wflgdeqrzwtithgscpsi.supabase.co/storage/v1/object/public';
  
  // Check for common prefixes used in BookController
  if (path.startsWith('books/')) {
    return `${SUPABASE_URL}/pdf_buku/${path}`;
  }
  
  if (path.startsWith('covers/')) {
    return `${SUPABASE_URL}/img_cover/${path}`;
  }

  // Fallback for other paths (or legacy)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stelkbook-be-production.up.railway.app';
  return `${backendUrl}/storage/${path}`;
};
