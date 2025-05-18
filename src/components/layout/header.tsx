import Link from 'next/link';
import { Home, Building2, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainNav } from './main-nav';

export function Header() {
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
            <Link href="/properties">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search Properties</span>
            </Link>
          </Button>
           {/* Add User/Auth button here later if needed */}
        </div>
      </div>
    </header>
  );
}
