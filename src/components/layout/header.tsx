"use client";

import Link from "next/link";
import { Search, UserCircle, LogOut, LogIn, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNav } from "./main-nav";
import { useAuth } from "@/contexts/auth-context";
import { useCurrency } from "@/contexts/currency-context";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, logout, loading } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={100}
            height={100}
            className="rounded-sm"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1">
          <MainNav />
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Currency selector */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-sm font-medium text-gray-700"
            aria-label="Seleccionar moneda"
          >
            <option value="CRC">₡ CRC</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="MXN">$ MXN</option>
          </select>

          {/* Search button */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hover:bg-blue-100 transition"
          >
            <Link href="/properties" aria-label="Buscar Propiedades">
              <Search className="h-6 w-6 text-blue-600" />
              <span className="sr-only">Buscar Propiedades</span>
            </Link>
          </Button>

          {/* User menu */}
          {!loading &&
            (user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Menú de usuario"
                    className="hover:bg-blue-100 transition"
                  >
                    <UserCircle className="h-6 w-6 text-blue-600" />
                    <span className="sr-only">Menú de usuario</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-xl shadow-2xl border border-blue-100 bg-white/95 backdrop-blur-lg"
                >
                  <DropdownMenuLabel className="font-semibold text-blue-700">
                    Hola, {user.name || user.email.split("@")[0]}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Mi Perfil</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-red-600">Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                asChild
                className={cn(
                  "flex-grow relative z-0 overflow-hidden group",
                  "bg-white border border-blue-500 text-blue-700 font-semibold shadow-md",
                  "hover:bg-gradient-to-r hover:from-blue-500 hover:via-sky-400 hover:to-indigo-400",
                  "hover:text-white hover:scale-105 hover:shadow-lg",
                  "transition-all duration-200"
                )}
              >
                <Link href="/login" className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  <span className="px-3 transition-transform group-hover:scale-110 group-hover:underline">
                    Acceder
                  </span>
                </Link>
              </Button>
            ))}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            aria-label="Abrir menú móvil"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 hover:bg-blue-100"
          >
            Inicio
          </Link>
          <Link
            href="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 hover:bg-blue-100"
          >
            Propiedades
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 hover:bg-blue-100"
          >
            Nosotros
          </Link>
          <Link
            href="/FAQ"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 hover:bg-blue-100"
          >
            Preguntas Frecuentes
          </Link>
        </nav>
      )}

    </header>
  );
}
