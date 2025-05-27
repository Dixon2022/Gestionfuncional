import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// import { AuthProvider } from '@/contexts/auth-context'; // Removed AuthProvider
import { SessionProvider } from "next-auth/react"; // Added SessionProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PropVerse - Encuentra la propiedad de tus sueños',
  description: 'Búsqueda avanzada de propiedades y descripciones con IA por PropVerse.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider> {/* Wrapped with SessionProvider */}
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
