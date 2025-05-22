'use client';

import { Outfit } from 'next/font/google';
import '@/app/globals.css';
import 'leaflet/dist/leaflet.css';


import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { usePathname } from 'next/navigation';
import FloatingChatButton from '@/components/chabot/FloatingChatButton';
import AppSidebar from '@/layout/AppSidebar'; // <== n'oublie ça si sidebar doit s'afficher
import { useEffect } from 'react';

const outfit = Outfit({ subsets: ['latin'] });

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
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  const shouldShowSidebar = pathname !== '/auth'; 
  const shouldShowFloatingChat = pathname !== '/garybot';

  return (
    <html lang="fr">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <ChatProvider>
              <ChatRouteHandler />

              {shouldShowSidebar && <AppSidebar />}

              <main
                className={`transition-all ${
                  shouldShowSidebar ? 'lg:ml-[290px]' : ''
                }`}
              >
                {children}
              </main>

              {shouldShowFloatingChat && <FloatingChatButton />}
            </ChatProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
