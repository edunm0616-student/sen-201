
'use client';
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collectionGroup, query } from "firebase/firestore";
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";

export default function AdminDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);

    const { data: userProfile } = useDoc<{ isAdmin?: boolean }>(userProfileRef);

    const allLoansQuery = useMemoFirebase(() => {
        if (!firestore || !userProfile?.isAdmin) return null;
        return query(collectionGroup(firestore, 'loanApplications'));
    }, [firestore, userProfile]);

    const { data: allLoans, isLoading } = useCollection(allLoansQuery);

    useEffect(() => {
        if (!isUserLoading && (!user || (userProfile && !userProfile.isAdmin))) {
            router.push('/dashboard');
        }
    }, [user, userProfile, isUserLoading, router]);

    if (isUserLoading || !userProfile) {
        return (
            <AppLayout>
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl font-headline">Admin Dashboard</h1>
                </div>
                 <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                    <p>Loading...</p>
                </div>
            </AppLayout>
        );
    }
    
    if (!userProfile.isAdmin) {
        return null; 
    }

    return (
        <AppLayout>
             <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Admin Dashboard</h1>
            </div>
            <div className="flex flex-1 rounded-lg">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>All User Loan Applications</CardTitle>
                        <CardDescription>A list of all loan applications submitted by users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User Email</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                     <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">
                                            Loading all loans...
                                        </TableCell>
                                    </TableRow>
                                ) : !allLoans || allLoans.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No loan applications found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    allLoans.map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell>{loan.email}</TableCell>
                                            <TableCell>₦{loan.loanAmount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={loan.status === 'Paid' ? 'secondary' : (loan.status === 'Outstanding' ? 'default' : 'destructive')}>
                                                    {loan.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{format(new Date(loan.applicationDate), 'PPP')}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
