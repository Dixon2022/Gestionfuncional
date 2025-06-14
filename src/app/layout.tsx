import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { CurrencyProvider } from "@/contexts/currency-context";
import { AutoLogout } from "@/components/layout/AutoLogout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FindHome - Encuentra la propiedad de tus sueños",
  description: "Búsqueda avanzada de propiedades con FindHome.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CurrencyProvider>
          <AuthProvider>
            <AutoLogout>
            {children}
            </AutoLogout>
            <Toaster />
          </AuthProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
