'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ROLE_REDIRECTS: Record<string, string> = {
  SUPER_ADMIN: '/admin',
  COMPANY_MANAGER: '/company',
  DRIVER: '/driver',
  SERVICE_CENTER: '/service',
};

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role) {
      router.replace(ROLE_REDIRECTS[user.role] || '/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} />
    </div>
  );
}
