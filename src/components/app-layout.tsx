
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, ShieldCheck, PanelLeft } from 'lucide-react';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { UserFeedback } from './user-feedback';


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading, userError } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ isAdmin?: boolean }>(userProfileRef);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, admin: false },
    { href: '/apply', label: 'Apply for Loan', icon: FileText, admin: false },
    { href: '/admin', label: 'Admin Dashboard', icon: ShieldCheck, admin: true },
  ];

  const NavLinks = ({ className }: { className?: string}) => (
     <nav className={cn('flex flex-col items-start gap-2 text-sm font-medium', className)}>
        {menuItems.map((item) => {
            if (item.admin && !userProfile?.isAdmin) {
            return null;
            }
            if (!item.admin && userProfile?.isAdmin) {
                return null;
            }
            return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-primary hover:bg-muted",
                    pathname === item.href && "text-primary bg-muted"
                )}
            >
                <item.icon className="h-4 w-4" />
                {item.label}
            </Link>
            );
        })}
    </nav>
  );

  useEffect(() => {
    if (!isUserLoading && !isProfileLoading && !user && !userError) {
      // Redirect to login if not loading, no user, and no auth error
      // Note: This might need adjustment based on specific public routes inside the app
      if (pathname !== '/login' && pathname !== '/signup') {
         // window.location.href = '/login'; // Using window.location for hard redirect
      }
    }
  }, [user, isUserLoading, isProfileLoading, userError, pathname]);

  useEffect(() => {
    // This effect handles redirection based on auth state and admin status.
    // It waits until both user and profile loading are complete.
    if (!isUserLoading && !isProfileLoading) {
        // If there's no user, redirect to login (if not already there)
        if (!user && pathname !== '/login' && pathname !== '/signup') {
            // router.push('/login');
            return;
        }

        // If on the admin page without being an admin, redirect.
        if (pathname === '/admin' && user && !userProfile?.isAdmin) {
            // router.push('/dashboard');
        }
    }
}, [user, userProfile, isUserLoading, isProfileLoading, pathname]);


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
            <Logo />
          </div>
          <div className="flex-1">
            <NavLinks className="grid p-2 lg:p-4" />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Logo />
                </div>
                <NavLinks className="grid gap-2 text-lg font-medium p-2" />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
          <UserNav />
        </header>
        <div className="flex flex-1 flex-col overflow-auto">
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
              {children}
          </main>
           <footer className="flex flex-col sm:flex-row items-center gap-4 p-4 lg:p-6 border-t bg-muted/40 mt-auto">
                <div className="text-xs text-foreground/70 text-center sm:text-left">
                    &copy; 2024 QuickLoan. All rights reserved.
                </div>
                <div className="sm:ml-auto w-full sm:w-auto">
                    <UserFeedback />
                </div>
            </footer>
        </div>
      </div>
    </div>
  );
}
