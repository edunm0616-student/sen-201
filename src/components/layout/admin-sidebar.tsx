'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/shared/logo';
import {
  FileText,
  ListPlus,
  LogOut,
  ChevronLeft,
  Users,
  LineChart,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const menuItems = [
    {
      href: '/admin',
      label: 'Applications',
      icon: FileText,
    },
    {
      href: '/admin/plans',
      label: 'Loan Plans',
      icon: ListPlus,
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users,
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: LineChart,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo />
          <span className="rounded-lg bg-primary/20 px-2 py-1 text-xs font-bold text-primary">
            Admin
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex w-full items-center justify-between p-2">
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {loading ? (
                <>
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-20" />
                </>
            ) : (
                <>
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium">{user?.name}</span>
                </>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
