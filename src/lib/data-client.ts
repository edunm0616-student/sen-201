// This file contains client-side data fetching functions.
// These functions interact with Firestore to get real-time or updated data.

import { collection, getDocs, query, where, type Firestore } from 'firebase/firestore';
import type { LoanPlan, User, LoanApplication } from '@/lib/definitions';

export const getLoanPlans = async (db: Firestore): Promise<LoanPlan[]> => {
  const plansCollection = collection(db, 'loanPlans');
  const planSnapshot = await getDocs(plansCollection);
  const plans: LoanPlan[] = [];
  planSnapshot.forEach((doc) => {
    plans.push(doc.data() as LoanPlan);
  });
  // If no plans in firestore, return from static data
  if (plans.length === 0) {
      const { loanPlans } = await import('@/lib/data');
      return loanPlans;
  }
  return plans;
};

export const getUserApplications = async (db: Firestore, userId: string): Promise<LoanApplication[]> => {
  const appsCollection = collection(db, 'applications');
  const q = query(appsCollection, where('userId', '==', userId));
  const appSnapshot = await getDocs(q);
  const applications: LoanApplication[] = [];
  appSnapshot.forEach((doc) => {
    applications.push(doc.data() as LoanApplication);
  });
  return applications.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
};

export const getAllApplications = async (db: Firestore): Promise<LoanApplication[]> => {
    const appsCollection = collection(db, 'applications');
    const appSnapshot = await getDocs(appsCollection);
    const applications: LoanApplication[] = [];
    appSnapshot.forEach((doc) => {
        applications.push(doc.data() as LoanApplication);
    });
    return applications.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
}

export const getAllUsers = async (db: Firestore): Promise<User[]> => {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const users: User[] = [];
    userSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() } as User);
    });
    return users;
}