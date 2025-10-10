'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  User as UserIcon,
  ShieldCheck,
  MoreHorizontal,
  Ban,
  ShieldX,
} from 'lucide-react';
import { changeUserRole, toggleUserBlacklist } from '@/lib/actions';
import { useFormStatus } from 'react-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function UsersTable({ users }: { users: User[] }) {
  const { user: currentUser } = useUser();
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={cn(user.isBlacklisted && 'bg-red-50/50 dark:bg-red-900/10')}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    {user.name}
                    {user.isBlacklisted && (
                        <Badge variant="destructive" className="w-fit">
                            <Ban className="mr-1 h-3 w-3"/>
                            Blacklisted
                        </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell className="text-right">
                {currentUser?.id !== user.id && <ActionMenu user={user} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RoleBadge({ role }: { role?: 'admin' | 'user' }) {
  if (role === 'admin') {
    return (
      <Badge>
        <Shield className="mr-2 h-3 w-3" />
        Admin
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <UserIcon className="mr-2 h-3 w-3" />
      User
    </Badge>
  );
}

function ActionMenu({ user }: { user: User }) {
  const makeAdminAction = () => changeUserRole(user.id, 'admin');
  const makeUserAction = () => changeUserRole(user.id, 'user');
  const toggleBlacklistAction = () => toggleUserBlacklist(user.id, !user.isBlacklisted);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user.role === 'user' ? (
          <form action={makeAdminAction} className="w-full">
            <ActionButton>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Make Admin
              </DropdownMenuItem>
            </ActionButton>
          </form>
        ) : (
          <form action={makeUserAction} className="w-full">
            <ActionButton>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <UserIcon className="mr-2 h-4 w-4" /> Make User
              </DropdownMenuItem>
            </ActionButton>
          </form>
        )}
        <form action={toggleBlacklistAction} className="w-full">
            <ActionButton>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className={cn(user.isBlacklisted && "text-green-600")}>
                {user.isBlacklisted ? (
                  <><UserIcon className="mr-2 h-4 w-4" /> Un-blacklist</>
                ) : (
                  <><Ban className="mr-2 h-4 w-4 text-destructive" /> Blacklist</>
                )}
              </DropdownMenuItem>
            </ActionButton>
          </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ActionButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full relative">
        {children}
    </button>
  )
}
