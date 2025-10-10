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
  LayoutDashboard,
  FileText,
  User as UserIcon,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

export function UserSidebar() {
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
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/applications',
      label: 'My Applications',
      icon: FileText,
    },
    {
      href: '/dashboard/profile',
      label: 'Profile',
      icon: UserIcon,
    },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
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
                        <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
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
            <Link href="/"><ChevronLeft className="mr-2 h-4 w-4"/> Back to Home</Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
