import type { FraudDetectionOutput } from '@/ai/flows/fraud-detection-ai-loan-application';

export type User = {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  isBlacklisted?: boolean;
};

export type LoanPlan = {
  id: string;
  name: string;
  description: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  imageId: string;
};

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Under Review';

export type LoanApplication = {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  income: number;
  employmentHistory: string;
  creditScore: number;
  applicationDetails: string;
  submissionDate: string;
  status: ApplicationStatus;
  fraudCheck: FraudDetectionOutput & { checkedOn: string };
};
