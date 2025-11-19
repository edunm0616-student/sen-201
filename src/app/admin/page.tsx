
'use client';
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, doc } from "firebase/firestore";
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDoc } from "@/firebase/firestore/use-doc";

interface LoanWithUser extends Record<string, any> {
    user?: {
        email: string;
        isAdmin?: boolean;
    };
}

export default function AdminDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [loansWithUsers, setLoansWithUsers] = useState<LoanWithUser[]>([]);

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ isAdmin?: boolean }>(userProfileRef);

    useEffect(() => {
        // Wait until both user and profile loading are complete
        if (isUserLoading || isProfileLoading) {
            return; // Do nothing while loading
        }
        
        // After loading, if there's no user, redirect to login
        if (!user) {
            router.push('/login');
            return;
        }

        // After loading, if the user is present but is not an admin, redirect to dashboard
        if (user && userProfile?.isAdmin === false) {
            router.push('/dashboard');
        }
    }, [user, userProfile, isUserLoading, isProfileLoading, router]);
    
    const isConfirmedAdmin = !isProfileLoading && userProfile?.isAdmin === true;

    const allLoansQuery = useMemoFirebase(() => {
        if (!firestore || !isConfirmedAdmin) return null;
        return query(collection(firestore, 'loanApplications'));
    }, [firestore, isConfirmedAdmin]);

    const { data: allLoans, isLoading: loansLoading } = useCollection(allLoansQuery);

    const allUsersQuery = useMemoFirebase(() => {
        if (!firestore || !isConfirmedAdmin) return null;
        return query(collection(firestore, 'users'));
    }, [firestore, isConfirmedAdmin]);
    
    const { data: allUsers, isLoading: usersLoading } = useCollection(allUsersQuery);

    useEffect(() => {
        if (isConfirmedAdmin && allLoans && allUsers) {
            const usersById = new Map(allUsers.map(u => [u.id, u]));
            const combinedData = allLoans.map(loan => ({
                ...loan,
                user: usersById.get(loan.userId)
            }));
            setLoansWithUsers(combinedData);
        }
    }, [isConfirmedAdmin, allLoans, allUsers]);

    // Show a loading screen while verifying admin status, which prevents premature redirects
    if (isUserLoading || isProfileLoading || !isConfirmedAdmin) {
        return (
            <AppLayout>
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl font-headline">Admin Dashboard</h1>
                </div>
                 <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                    <p>Verifying admin status...</p>
                </div>
            </AppLayout>
        );
    }
    
    const isLoading = loansLoading || usersLoading;

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
                                    <TableHead>User Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                     <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            Loading all loans...
                                        </TableCell>
                                    </TableRow>
                                ) : !loansWithUsers || loansWithUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No loan applications found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    loansWithUsers.map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell>{loan.user?.email || 'Unknown User'}</TableCell>
                                            <TableCell>
                                                <Badge variant={loan.user?.isAdmin ? 'destructive' : 'outline'}>
                                                    {loan.user?.isAdmin ? 'Admin' : 'User'}
                                                </Badge>
                                            </TableCell>
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
