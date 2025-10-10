import { Badge } from '@/components/ui/badge';
import type { ApplicationStatus } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { CheckCircle2, CircleHelp, XCircle, Hourglass } from 'lucide-react';

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const statusConfig = {
    Approved: {
      label: 'Approved',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-700',
      icon: CheckCircle2,
    },
    Pending: {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700',
      icon: CircleHelp,
    },
    Rejected: {
      label: 'Rejected',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-700',
      icon: XCircle,
    },
    'Under Review': {
      label: 'Under Review',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-700',
      icon: Hourglass,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn('whitespace-nowrap', config.color)}
    >
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
