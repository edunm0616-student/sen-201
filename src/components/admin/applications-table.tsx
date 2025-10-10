'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/status-badge';
import type { LoanApplication, LoanPlan, User } from '@/lib/definitions';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  FileQuestion,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { changeApplicationStatus } from '@/lib/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useFormStatus } from 'react-dom';
import {
    Avatar,
    AvatarFallback,
} from '@/components/ui/avatar';

type EnrichedApplication = LoanApplication & {
  plan?: LoanPlan;
  user?: User;
};

const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export function ApplicationsTable({
  applications,
  plans,
  users,
}: {
  applications: LoanApplication[];
  plans: LoanPlan[];
  users: User[];
}) {
  const enrichedApplications: EnrichedApplication[] = applications.map(
    (app) => ({
      ...app,
      plan: plans.find((p) => p.id === app.planId),
      user: users.find((u) => u.id === app.userId),
    })
  );

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Loan Plan</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Fraud Risk</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrichedApplications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{getInitials(app.user?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span>{app.user?.name || 'Unknown User'}</span>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(app.submissionDate), 'MMM d, yyyy')}
                        </span>
                    </div>
                </div>
              </TableCell>
              <TableCell>{app.plan?.name || 'Unknown Plan'}</TableCell>
              <TableCell className="text-right">
                ₦{app.amount.toLocaleString()}
              </TableCell>
              <TableCell className="text-center">
                <RiskBadge score={app.fraudCheck.riskScore} />
              </TableCell>
              <TableCell>
                <StatusBadge status={app.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <FraudDetailsDialog application={app} />
                  {app.status === 'Under Review' || app.status === 'Pending' ? (
                    <ActionButtons id={app.id} />
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RiskBadge({ score }: { score: number }) {
  const getRiskConfig = () => {
    if (score > 75)
      return {
        icon: ShieldAlert,
        color:
          'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        label: 'High',
      };
    if (score > 40)
      return {
        icon: ShieldAlert,
        color:
          'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
        label: 'Medium',
      };
    return {
      icon: ShieldCheck,
      color:
        'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      label: 'Low',
    };
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn('flex w-fit items-center justify-center gap-1.5', config.color)}
    >
      <Icon className="h-4 w-4" />
      <span>
        {config.label} ({score})
      </span>
    </Badge>
  );
}

function ActionButtons({ id }: { id: string }) {
  const approveWithId = () => changeApplicationStatus(id, 'Approved');
  const rejectWithId = () => changeApplicationStatus(id, 'Rejected');

  return (
    <>
      <form action={approveWithId}>
        <ApproveButton />
      </form>
      <form action={rejectWithId}>
        <RejectButton />
      </form>
    </>
  );
}

function ApproveButton() {
    const { pending } = useFormStatus();
    return <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" disabled={pending}><Check className="h-4 w-4" /></Button>
}

function RejectButton() {
    const { pending } = useFormStatus();
    return <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" disabled={pending}><X className="h-4 w-4" /></Button>
}

function FraudDetailsDialog({ application }: { application: EnrichedApplication }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <FileQuestion className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fraud Analysis Report</DialogTitle>
          <DialogDescription>
            AI-powered analysis for application submitted by {application.user?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-lg border p-4">
            <div className="flex-shrink-0">
                <RiskBadge score={application.fraudCheck.riskScore} />
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {application.fraudCheck.isFraudulent
                  ? 'Potential Fraud Detected'
                  : 'No Fraud Detected'}
              </p>
              <p className="text-sm text-muted-foreground">
                Checked on{' '}
                {format(new Date(application.fraudCheck.checkedOn), 'PP pp')}
              </p>
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">AI Explanation</h3>
            <p className="text-sm text-muted-foreground">
              {application.fraudCheck.fraudExplanation}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
