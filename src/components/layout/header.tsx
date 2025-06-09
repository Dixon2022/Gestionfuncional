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
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Selector de moneda */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="border rounded px-2 py-1 mr-2"
            aria-label="Seleccionar moneda"
          >
            <option value="CRC">₡ CRC</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="MXN">$ MXN</option>
          </select>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/properties" aria-label="Buscar Propiedades">
              <Search className="h-5 w-5" />
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
                  >
                    <UserCircle className="h-5 w-5" />
                    <span className="sr-only">Menú de usuario</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
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
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild>
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
