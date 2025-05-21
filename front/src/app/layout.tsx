'use client';
import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ChatProvider } from '@/context/ChatContext'; 
import { usePathname } from 'next/navigation';
import FloatingChatButton from '@/components/chabot/FloatingChatButton';

const outfit = Outfit({
  subsets: ['latin'],
});

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
              {children}
              {shouldShowFloatingChat && <FloatingChatButton />}
            </ChatProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
