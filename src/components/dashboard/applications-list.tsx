import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/status-badge';
import type { LoanApplication, LoanPlan } from '@/lib/definitions';
import { format } from 'date-fns';

type EnrichedApplication = LoanApplication & {
  plan?: LoanPlan;
};

export function ApplicationsList({ applications, plans }: { applications: LoanApplication[], plans: LoanPlan[] }) {
  
  const enrichedApplications: EnrichedApplication[] = applications.map(app => ({
      ...app,
      plan: plans.find(p => p.id === app.planId),
  }));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Loan Plan</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrichedApplications.map((app) => (
          <TableRow key={app.id}>
            <TableCell className="font-medium">{app.plan?.name || 'Unknown Plan'}</TableCell>
            <TableCell className="text-right">₦{app.amount.toLocaleString()}</TableCell>
            <TableCell>{format(new Date(app.submissionDate), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              <StatusBadge status={app.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
