
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Search, UserCircle } from 'lucide-react'; // Sparkles removed, UserCircle for Profile
import { useSession } from 'next-auth/react'; // Import useSession

export function MainNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/properties', label: 'Propiedades', icon: Search },
    // { href: '/generate-description', label: 'Descripción IA', icon: Sparkles }, // Removed
    // Add profile link if user is logged in
    ...(isAuthenticated ? [{ href: '/profile', label: 'Mi Perfil', icon: UserCircle }] : []),
  ];

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
