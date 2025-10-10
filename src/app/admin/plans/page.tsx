'use client';

import { PlanManager } from '@/components/admin/plan-manager';
import { Skeleton } from '@/components/ui/skeleton';
import { getLoanPlans } from '@/lib/data-client';
import { LoanPlan } from '@/lib/definitions';
import { useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';

export default function AdminPlansPage() {
  const db = useFirestore();
  const [plans, setPlans] = useState<LoanPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const plansCollection = collection(db, 'loanPlans');
    const unsubscribe = onSnapshot(plansCollection, (snapshot) => {
        const loanPlans: LoanPlan[] = [];
        snapshot.forEach(doc => {
            loanPlans.push(doc.data() as LoanPlan);
        });
        setPlans(loanPlans);
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [db]);
  
  if (loading) {
      return (
          <div>
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="mt-1 h-5 w-72" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
             <div className="mt-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          </div>
      )
  }

  return <PlanManager plans={plans} />;
}
