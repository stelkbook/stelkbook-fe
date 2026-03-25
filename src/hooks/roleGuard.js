'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/authContext';

export default function useRoleGuard(allowedRoles = []) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Convert to string to avoid infinite loops if an array literal is passed
  const allowedRolesStr = JSON.stringify(allowedRoles);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
        return;
      }

      const roles = JSON.parse(allowedRolesStr);
      const userRole = user.role;
      const isAllowed = roles.includes(userRole);

      if (!isAllowed) {
        // Redirect logic based on what was observed in perpustakaan/page.tsx
        if (userRole === 'Guru') {
          router.push('/homepage_guru');
        } else if (userRole === 'Siswa') {
          router.push('/homepage');
        } else if (['Admin', 'Perpus', 'PengurusPerpustakaan'].includes(userRole)) {
          router.push('/admin_perpus');
        } else {
          router.push('/');
        }
      }
    }
  }, [user, loading, router, allowedRolesStr]);
}
