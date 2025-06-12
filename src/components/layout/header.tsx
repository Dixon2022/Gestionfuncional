"use client";

import Link from "next/link";
import {
  Home,
  Building2,
  Sparkles,
  Search,
  UserCircle,
  LogOut,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNav } from "./main-nav";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useCurrency } from "@/contexts/currency-context";

export function Header() {
  const { user, logout, loading } = useAuth();
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={100}
            height={100}
            className="rounded-sm"
          />
        </Link>
        <MainNav />
        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Selector de moneda mejorado */}
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

          {/* Botón de búsqueda más visible */}
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

                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/">Propiedades Reportadas</Link>
                    </DropdownMenuItem>
                  )}

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
                className="border-blue-500 text-blue-700 hover:bg-blue-50 transition"
              >
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Acceder
                </Link>
              </Button>
            ))}
        </div>
      </div>
    </header>
  );
}
