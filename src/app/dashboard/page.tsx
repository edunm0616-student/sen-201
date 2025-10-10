'use client';

import { useFirestore, useUser } from '@/firebase';
import {
  getUserApplications,
  getLoanPlans,
} from '@/lib/data-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ApplicationsList } from '@/components/dashboard/applications-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LoanApplication, LoanPlan } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [plans, setPlans] = useState<LoanPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user?.uid) {
        setLoading(true);
        const [userApps, loanPlans] = await Promise.all([
          getUserApplications(db, user.uid),
          getLoanPlans(db),
        ]);
        setApplications(userApps);
        setPlans(loanPlans);
        setLoading(false);
      }
    }
    if (!userLoading) {
        fetchData();
    }
  }, [user, userLoading, db]);

  const recentApplications = applications.slice(0, 3);

  if (userLoading || loading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-6 w-96" />
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
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s a quick overview of your account.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Your last {recentApplications.length} loan applications.
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/applications">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ApplicationsList
            applications={recentApplications}
            plans={plans}
          />
        </CardContent>
      </Card>
    </div>
  );
}