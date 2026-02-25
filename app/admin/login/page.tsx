'use client';

import { useState } from 'react';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleLoginSuccess = (user: any) => {
    // Redirect to admin dashboard
    router.push('/admin/dashboard');
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <AdminLoginModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
