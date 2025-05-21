'use client';

import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ChatProvider, useChat } from '@/context/ChatContext'; // ✅ useChat
import { usePathname } from 'next/navigation';
import FloatingChatButton from '@/components/chabot/FloatingChatButton';
import { useEffect } from 'react'; // ✅ useEffect

const outfit = Outfit({
  subsets: ['latin'],
});

function ChatRouteHandler() {
  const pathname = usePathname();
  const { setMiniChatOpen } = useChat();

  useEffect(() => {
    if (pathname === '/garybot') {
      setMiniChatOpen(false);
    }
  }, [pathname, setMiniChatOpen]);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const shouldShowFloatingChat = pathname !== '/garybot';

  return (
    <html lang="fr">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <ChatProvider>
              <ChatRouteHandler />
              {children}
              {shouldShowFloatingChat && <FloatingChatButton />}
            </ChatProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
