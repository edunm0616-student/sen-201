import type { LoanPlan, User, LoanApplication } from '@/lib/definitions';

// This file now acts as a default/fallback data source.
// Most data will be fetched from Firestore, but this can be used for development
// or for parts of the app that are not yet connected to the database.

export let users: User[] = [
  {
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: 'user',
  },
  {
    id: 'INITIAL_ADMIN_UID', // This will be replaced by the actual UID from Firebase
    name: 'Admin User',
    email: 'meyigbenee@gmail.com',
    role: 'admin',
  },
];

export const loanPlans: LoanPlan[] = [
  {
    id: 'personal-loan',
    name: 'Personal Loan',
    description: 'Flexible financing for your personal needs, from vacations to debt consolidation.',
    interestRate: 5.5,
    minAmount: 1000,
    maxAmount: 50000,
    imageId: 'personal-loan',
  },
  {
    id: 'home-loan',
    name: 'Home Loan',
    description: 'Competitive rates to help you buy your dream home. Get pre-approved today.',
    interestRate: 3.2,
    minAmount: 50000,
    maxAmount: 800000,
    imageId: 'home-loan',
  },
  {
    id: 'car-loan',
    name: 'Car Loan',
    description: 'Get behind the wheel of your new car with our straightforward financing options.',
    interestRate: 4.0,
    minAmount: 5000,
    maxAmount: 75000,
    imageId: 'car-loan',
  },
  {
    id: 'education-loan',
    name: 'Education Loan',
    description: 'Invest in your future. Cover tuition and other expenses with our student loans.',
    interestRate: 4.5,
    minAmount: 10000,
    maxAmount: 150000,
    imageId: 'education-loan',
  },
];

export let loanApplications: LoanApplication[] = [
  {
    id: 'app-001',
    userId: 'user-1',
    planId: 'personal-loan',
    amount: 15000,
    income: 75000,
    employmentHistory: '5 years at TechCorp',
    creditScore: 720,
    applicationDetails: 'Loan for home renovation project.',
    submissionDate: '2024-05-01T10:00:00Z',
    status: 'Approved',
    fraudCheck: {
      isFraudulent: false,
      fraudExplanation: 'No suspicious activity detected. Applicant profile is consistent.',
      riskScore: 10,
      checkedOn: '2024-05-01T10:05:00Z',
    },
  },
  {
    id: 'app-002',
    userId: 'user-1',
    planId: 'car-loan',
    amount: 25000,
    income: 75000,
    employmentHistory: '5 years at TechCorp',
    creditScore: 720,
    applicationDetails: 'Looking to buy a new family car.',
    submissionDate: '2024-06-10T14:30:00Z',
    status: 'Pending',
    fraudCheck: {
      isFraudulent: false,
      fraudExplanation: 'Standard application. Data appears consistent.',
      riskScore: 5,
      checkedOn: '2024-06-10T14:35:00Z',
    },
  },
  {
    id: 'app-003',
    userId: 'user-2', // A user not in the main users list to simulate broader data
    planId: 'home-loan',
    amount: 450000,
    income: 90000,
    employmentHistory: '2 years at GigaCorp, 5 years at MegaIndustries',
    creditScore: 680,
    applicationDetails: 'First time home buyer.',
    submissionDate: '2024-06-12T09:00:00Z',
    status: 'Under Review',
    fraudCheck: {
      isFraudulent: true,
      fraudExplanation: 'High loan amount requested relative to income. Discrepancy found in employment history verification. Address provided appears to be a commercial property.',
      riskScore: 85,
      checkedOn: '2024-06-12T09:05:00Z',
    },
  },
    {
    id: 'app-004',
    userId: 'user-3',
    planId: 'business-loan',
    amount: 100000,
    income: 20000,
    employmentHistory: 'Self-employed, 1 year',
    creditScore: 550,
    applicationDetails: 'Startup funding for a new app that delivers socks by drone.',
    submissionDate: '2024-06-15T11:20:00Z',
    status: 'Rejected',
    fraudCheck: {
      isFraudulent: true,
      fraudExplanation: 'Very high risk profile. Low income and credit score for a large business loan. Business plan seems unrealistic. Applicant name appears on a watchlist.',
      riskScore: 98,
      checkedOn: '2024-06-15T11:25:00Z',
    },
  },
];

// In-memory "database" functions for server components
export const getLoanPlans = async () => {
  return loanPlans;
};

export const getLoanPlanById = async (id: string) => {
  return loanPlans.find((plan) => plan.id === id);
};

export const getAllApplications = async () => {
    return loanApplications.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
}

export const getAllUsers = async () => {
    return users;
}
