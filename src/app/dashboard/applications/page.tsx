'use client';

import { getUserApplications, getLoanPlans } from "@/lib/data-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationsList } from "@/components/dashboard/applications-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { useEffect, useState } from "react";
import { LoanApplication, LoanPlan } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserApplicationsPage() {
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
                    getLoanPlans(db)
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


    if (userLoading || loading) {
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
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Loan Applications</CardTitle>
                    <CardDescription>Track the status of all your submitted applications.</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/#loan-plans">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        New Application
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <ApplicationsList applications={applications} plans={plans} />
            </CardContent>
        </Card>
    );
}