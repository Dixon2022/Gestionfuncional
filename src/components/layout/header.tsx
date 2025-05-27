'use client';

import Link from 'next/link';
import { Home, Building2, Sparkles, Search, UserCircle, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainNav } from './main-nav';
import { useSession, signOut } from "next-auth/react"; // Import useSession and signOut
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === "loading";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-xl">
            PropVerse
          </span>
        </Link>
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/properties" aria-label="Buscar Propiedades">
              <Search className="h-5 w-5" />
              <span className="sr-only">Buscar Propiedades</span>
            </Link>
          </Button>
          
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Menú de usuario">
                    <UserCircle className="h-5 w-5" />
                     <span className="sr-only">Menú de usuario</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Hola, {user?.name || user?.email?.split('@')[0]}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Mi Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
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
            )
          )}
        </div>
      </div>
    </header>
  );
}
