import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Landmark } from "lucide-react";

const loanHistory:any[] = [];

export default function DashboardPage() {
    const outstandingLoan = loanHistory.find(loan => loan.status === 'Outstanding');
    const totalPaid = loanHistory.filter(loan => loan.status === 'Paid').reduce((sum, loan) => sum + loan.amount, 0);

    return (
        <AppLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₦{outstandingLoan ? outstandingLoan.amount.toLocaleString() : '0.00'}</div>
                            <p className="text-xs text-muted-foreground">
                                {outstandingLoan ? `Due from loan ${outstandingLoan.id}`: 'No active loans'}
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
                            <p className="text-xs text-muted-foreground">Across {loanHistory.filter(l => l.status === 'Paid').length} loans</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Next Repayment</CardTitle>
                            <Landmark className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">No Repayments</div>
                            <p className="text-xs text-muted-foreground">No upcoming payments</p>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Loan History</CardTitle>
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
                                {loanHistory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            No loan history found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    loanHistory.map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell className="font-medium">{loan.id}</TableCell>
                                            <TableCell>₦{loan.amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={loan.status === 'Paid' ? 'secondary' : 'destructive'}>
                                                    {loan.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{loan.date}</TableCell>
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
