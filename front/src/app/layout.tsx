// app/layout.tsx
import { Outfit } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';


const outfit = Outfit({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}
