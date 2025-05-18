'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Building2, Sparkles, Search } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/properties', label: 'Properties', icon: Search },
  { href: '/generate-description', label: 'AI Description', icon: Sparkles },
];

export function MainNav() {
  const pathname = usePathname();

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
