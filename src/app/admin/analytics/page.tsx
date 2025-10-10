'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore } from '@/firebase';
import { getAllApplications, getLoanPlans } from '@/lib/data-client';
import { LoanApplication, LoanPlan } from '@/lib/definitions';
import { useEffect, useState } from 'react';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';

export default function AnalyticsPage() {
  const db = useFirestore();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [plans, setPlans] = useState<LoanPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [apps, loanPlans] = await Promise.all([
        getAllApplications(db),
        getLoanPlans(db),
      ]);
      setApplications(apps);
      setPlans(loanPlans);
      setLoading(false);
    }
    fetchData();
  }, [db]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-5 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return <AnalyticsDashboard applications={applications} plans={plans} />;
}
