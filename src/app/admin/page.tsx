'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ApplicationsTable } from '@/components/admin/applications-table';
import { useEffect, useState } from 'react';
import { LoanApplication, LoanPlan, User } from '@/lib/definitions';
import {
  getAllApplications,
  getAllUsers,
  getLoanPlans,
} from '@/lib/data-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore } from '@/firebase';

export default function AdminDashboardPage() {
  const db = useFirestore();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [plans, setPlans] = useState<LoanPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [apps, loanPlans, allUsers] = await Promise.all([
        getAllApplications(db),
        getLoanPlans(db),
        getAllUsers(db),
      ]);
      setApplications(apps);
      setPlans(loanPlans);
      setUsers(allUsers);
      setLoading(false);
    }
    fetchData();
  }, [db]);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-5 w-80" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
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
        <CardTitle>Loan Application Review</CardTitle>
        <CardDescription>
          Review, approve, or reject incoming loan applications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ApplicationsTable
          applications={applications}
          plans={plans}
          users={users}
        />
      </CardContent>
    </Card>
  );
}