import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <span className="sr-only">Loading page content...</span>
    </div>
  );
}
