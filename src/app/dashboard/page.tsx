
'use client';
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Landmark } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { format } from 'date-fns';


export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const loanHistoryQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/loanApplications`));
    }, [user, firestore]);

    const { data: loanHistory, isLoading } = useCollection(loanHistoryQuery);

    const outstandingLoans = loanHistory?.filter(loan => loan.status === 'Outstanding') || [];
    const outstandingBalance = outstandingLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);

    const totalPaid = loanHistory?.filter(loan => loan.status === 'Paid').reduce((sum, loan) => sum + loan.loanAmount, 0) || 0;

    const nextRepayment = outstandingLoans.length > 0 ? outstandingLoans[0] : null;


    return (
        <AppLayout>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
            </div>
            <div className="flex flex-1 rounded-lg">
                <div className="flex flex-col gap-4 w-full">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₦{outstandingBalance.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {outstandingLoans.length > 0 ? `From ${outstandingLoans.length} active loan(s)`: 'No active loans'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₦{totalPaid.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Across {loanHistory?.filter(l => l.status === 'Paid').length || 0} loans</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Next Repayment</CardTitle>
                                <Landmark className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {nextRepayment ? (
                                    <>
                                     <div className="text-2xl font-bold">₦{(nextRepayment.loanAmount / 12).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                      <p className="text-xs text-muted-foreground">
                                        Due on {format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'MMMM dd, yyyy')}
                                      </p>
                                    </>
                                ) : (
                                    <>
                                    <div className="text-2xl font-bold">No Repayments</div>
                                    <p className="text-xs text-muted-foreground">No upcoming payments</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Loan History</CardTitle>
                            <CardDescription>A record of your past and current loans.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Loan ID</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                         <TableRow>
                                            <TableCell colSpan={4} className="text-center">
                                                Loading loan history...
                                            </TableCell>
                                        </TableRow>
                                    ) : !loanHistory || loanHistory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No loan history found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        loanHistory.map((loan) => (
                                            <TableRow key={loan.id}>
                                                <TableCell className="font-medium">{loan.id.substring(0, 7)}</TableCell>
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
            </div>
        </AppLayout>
    );
}
