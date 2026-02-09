const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL!;

export const getStorageUrl = (path?: string | null): string => {
  if (!path) return "/assets/default-cover.png";

  // sudah full url
  if (path.startsWith("http")) return path;

  // Laravel local storage
  if (path.startsWith("/storage/")) {
    return `${BACKEND_URL}${path}`;
  }

  // Supabase buckets
  if (path.startsWith("books/")) {
    return `${SUPABASE_URL}/pdf_buku/${path}`;
  }

  if (path.startsWith("covers/")) {
    return `${SUPABASE_URL}/img_cover/${path}`;
  }

  // fallback legacy
  return `${BACKEND_URL}/storage/${path}`;
};
