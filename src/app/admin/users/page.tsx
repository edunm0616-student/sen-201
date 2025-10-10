'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UsersTable } from '@/components/admin/users-table';
import { getAllUsers } from '@/lib/data-client';
import { User } from '@/lib/definitions';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore } from '@/firebase';

export default function AdminUsersPage() {
  const db = useFirestore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const allUsers = await getAllUsers(db);
      setUsers(allUsers);
      setLoading(false);
    }
    fetchData();
  }, [db]);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-64" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View all users and manage their roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <UsersTable users={users} />
      </CardContent>
    </Card>
  );
}