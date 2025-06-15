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

  // Si el usuario es admin, agrega el enlace users
  if (user?.role === 'admin') {
    navItems.push({
      href: '/admin/users',
      label: 'Usuarios',
      icon: UserCircle, // Usa el icono que prefieras
    });
  }

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded transition",
            pathname === item.href
              ? "bg-blue-100 text-blue-700 font-semibold"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
