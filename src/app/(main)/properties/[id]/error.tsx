'use client'; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container py-12 text-center">
      <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
      <h2 className="text-2xl font-semibold mb-4">Oops! Something went wrong.</h2>
      <p className="text-muted-foreground mb-6">
        We encountered an error while trying to load this property. Please try again later.
      </p>
      <div className="space-x-4">
        <Button onClick={() => reset()} variant="outline">
          Try again
        </Button>
        <Button asChild>
          <Link href="/properties">Back to Properties</Link>
        </Button>
      </div>
    </div>
  );
}
