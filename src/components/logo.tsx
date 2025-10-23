import { Landmark } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} aria-label="QuickLoan Home">
      <Landmark className="h-7 w-7 text-accent" />
      <span className="text-xl font-bold text-primary font-headline">
        QuickLoan
      </span>
    </Link>
  );
}
