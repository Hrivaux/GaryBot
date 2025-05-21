'use client';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import AppSidebar from '../AppSidebar';

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isLoginPage = pathname === '/' || pathname === '/login';

    if (!token && !isLoginPage) {
      router.push('/'); // redirige vers la page de login
      return;
    }

    setIsAuthenticated(!!token);
  }, [pathname, router]);

  // En attendant la vérif du token : rien
  if (isAuthenticated === null) return null;

  // Pas de sidebar sur la page login
  const isLoginPage = pathname === '/' || pathname === '/login';

  return (
    <div className="flex min-h-screen">
      {!isLoginPage && <AppSidebar />}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default AuthLayout;
