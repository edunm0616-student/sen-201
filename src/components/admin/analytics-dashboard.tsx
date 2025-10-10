'use client';

import { LoanApplication, LoanPlan } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function AnalyticsDashboard({
  applications,
  plans,
}: {
  applications: LoanApplication[];
  plans: LoanPlan[];
}) {
  const totalApplications = applications.length;
  const approvedApplications = applications.filter(
    (app) => app.status === 'Approved'
  ).length;
  const rejectedApplications = applications.filter(
    (app) => app.status === 'Rejected'
  ).length;
  const totalLoanValue = applications
    .filter((app) => app.status === 'Approved')
    .reduce((sum, app) => sum + app.amount, 0);

  const statusDistribution = [
    { name: 'Approved', value: approvedApplications, fill: '#22c55e' },
    { name: 'Rejected', value: rejectedApplications, fill: '#ef4444' },
    { name: 'Pending/Review', value: totalApplications - approvedApplications - rejectedApplications, fill: '#3b82f6' },
  ];

  const applicationsByPlan = plans.map(plan => ({
      name: plan.name,
      applications: applications.filter(app => app.planId === plan.id).length
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loan Analytics</h1>
        <p className="text-muted-foreground">
          An overview of loan application data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approved Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{approvedApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rejected Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{rejectedApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Approved Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ₦{totalLoanValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Distribution of loan application statuses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Applications per Plan</CardTitle>
            <CardDescription>
              Number of applications for each loan plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={applicationsByPlan}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#8884d8" name="Applications" />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
