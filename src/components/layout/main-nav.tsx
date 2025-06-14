'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Search, Info, MessageCircleQuestion, UserCircle, Flag, FlagOff, FlashlightOff, FlagIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // NavItems fijos que siempre se muestran
  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/properties', label: 'Propiedades', icon: Search },
    { href: '/about', label: 'Nosotros', icon: Info },
    { href: '/FAQ', label: 'Preguntas Frecuentes', icon: MessageCircleQuestion },
  ];

  // Si el usuario es admin, agrega el enlace admin
  if (user?.role === 'admin') {
    navItems.push({
      href: '/admin',
      label: 'Propiedades Reportadas',
      icon: FlagIcon, // Puedes cambiar el icono si quieres
    });
  }

  return (
    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === item.href ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          <item.icon className="mr-2 inline-block h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
