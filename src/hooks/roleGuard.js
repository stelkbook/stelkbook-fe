'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';

export default function useRoleGuard(allowedRoles = []) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      router.push('/');
      return;
    }
    if (!user) return;

    const role = (user.role || '').toLowerCase();
    const allowed = allowedRoles.map((r) => r.toLowerCase());
    if (allowed.length && !allowed.includes(role)) {
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'perpus' || role === 'pengurusperpustakaan') {
        router.push('/perpustakaan');
      } else if (role === 'guru') {
        router.push('/homepage_guru');
      } else {
        router.push('/homepage');
      }
    }
  }, [user, loading, router, allowedRoles]);
}
