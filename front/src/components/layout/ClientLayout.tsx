'use client';

import { usePathname } from 'next/navigation';
import AppSidebar from '@/layout/AppSidebar';
import FloatingChatButton from '@/components/chabot/FloatingChatButton';
import { ReactNode, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { setMiniChatOpen } = useChat();

  const shouldShowSidebar = pathname !== '/';
  const shouldShowFloatingChat = pathname !== '/garybot';

  useEffect(() => {
    if (pathname === '/garybot') {
      setMiniChatOpen(false);
    }
  }, [pathname, setMiniChatOpen]);

  return (
    <>
      {shouldShowSidebar && <AppSidebar />}
      {children}
      {shouldShowFloatingChat && <FloatingChatButton />}
    </>
  );
}
