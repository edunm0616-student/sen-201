'use server';

import { fraudDetectionAILoanApplication } from '@/ai/flows/fraud-detection-ai-loan-application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { serviceAccount } from './service-account';


const ApplicationSchema = z.object({
  planId: z.string(),
  amount: z.coerce.number().min(1, { message: 'Please enter a valid amount.' }),
  income: z.coerce.number().min(1, { message: 'Please enter your annual income.' }),
  employmentHistory: z.string().min(5, { message: 'Please provide your employment history.' }),
  creditScore: z.coerce.number().min(300).max(850),
  applicationDetails: z.string().min(10, { message: 'Please provide some details.' }),
});

export type State = {
  errors?: {
    amount?: string[];
    income?: string[];
    employmentHistory?: string[];
    creditScore?: string[];
    applicationDetails?: string[];
  };
  message?: string | null;
  success?: boolean;
};

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
}

export async function submitLoanApplication(prevState: State | undefined, formData: FormData) {

  const validatedFields = ApplicationSchema.safeParse({
    planId: formData.get('planId'),
    amount: formData.get('amount'),
    income: formData.get('income'),
    employmentHistory: formData.get('employmentHistory'),
    creditScore: formData.get('creditScore'),
    applicationDetails: formData.get('applicationDetails'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Submit Application.',
    };
  }
  
  const { planId, amount, income, employmentHistory, creditScore, applicationDetails } = validatedFields.data;
  
  const userId = formData.get('userId') as string;
  const applicantName = formData.get('applicantName') as string;

  if (!userId || !applicantName) {
     return {
      message: 'User information is missing. You must be logged in to apply.',
    };
  }

  try {
    initializeFirebaseAdmin();
    
    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.data()?.isBlacklisted) {
      return { message: 'Your account is blacklisted and cannot submit applications.' };
    }

    const fraudCheckResult = await fraudDetectionAILoanApplication({
      applicantName,
      loanAmount: amount,
      income,
      employmentHistory,
      creditScore,
      applicationDetails,
    });
    
    const applicationRef = db.collection('applications').doc();

    await applicationRef.set({
      id: applicationRef.id,
      userId,
      planId,
      amount,
      income,
      employmentHistory,
      creditScore,
      applicationDetails,
      submissionDate: new Date().toISOString(),
      status: 'Under Review',
      fraudCheck: { ...fraudCheckResult, checkedOn: new Date().toISOString() },
    });

  } catch (error) {
    console.error(error);
    return {
      message: 'AI Fraud Check Failed or could not save application. Please try again later.',
    };
  }

  revalidatePath('/dashboard/applications');
  revalidatePath('/admin');
  revalidatePath('/admin/analytics');
  redirect('/dashboard/applications');
}


export async function changeApplicationStatus(id: string, status: 'Approved' | 'Rejected') {
    initializeFirebaseAdmin();
    const db = getAdminFirestore();
    try {
        await db.collection('applications').doc(id).update({ status });
        revalidatePath('/admin');
        revalidatePath('/admin/analytics');
    } catch(error) {
        console.error(error);
        return { message: 'Failed to update status.' };
    }
}


const PlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  interestRate: z.coerce.number({ invalid_type_error: "Please enter a valid rate." }),
  minAmount: z.coerce.number({ invalid_type_error: "Please enter a valid amount." }),
  maxAmount: z.coerce.number({ invalid_type_error: "Please enter a valid amount." }),
  imageId: z.string({ required_error: "Please select an image." }),
});


export async function createLoanPlan(prevState: State | undefined, formData: FormData): Promise<State> {
    const validatedFields = PlanSchema.omit({ id: true }).safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Failed to create plan.',
        }
    }
    
    initializeFirebaseAdmin();
    const db = getAdminFirestore();
    
    try {
        const newPlanRef = db.collection('loanPlans').doc();
        const newPlan = { id: newPlanRef.id, ...validatedFields.data };
        await newPlanRef.set(newPlan);

    } catch (e) {
        return { message: 'Database Error: Failed to create plan.' };
    }

    revalidatePath('/admin/plans');
    revalidatePath('/');
    return { success: true };
}

export async function updateLoanPlan(prevState: State | undefined, formData: FormData): Promise<State> {
    const validatedFields = PlanSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Failed to update plan.',
        }
    }
    
    initializeFirebaseAdmin();
    const db = getAdminFirestore();
    
    const { id, ...planData } = validatedFields.data;

    if (!id) {
      return { message: 'Plan ID is missing.' };
    }

    try {
        await db.collection('loanPlans').doc(id).update(planData);
    } catch (e) {
        return { message: 'Database Error: Failed to update plan.' };
    }

    revalidatePath('/admin/plans');
    revalidatePath('/');
    return { success: true };
}

export async function deleteLoanPlan(planId: string) {
    initializeFirebaseAdmin();
    const db = getAdminFirestore();
    try {
        await db.collection('loanPlans').doc(planId).delete();
    } catch (e) {
        return { message: 'Database Error: Failed to delete plan.' };
    }
    revalidatePath('/admin/plans');
    revalidatePath('/');
}

export async function changeUserRole(userId: string, role: 'admin' | 'user') {
    initializeFirebaseAdmin();
    const db = getAdminFirestore();
    const auth = getAdminAuth();
    try {
        await db.collection('users').doc(userId).update({ role: role });
        await auth.setCustomUserClaims(userId, { role: role });
        revalidatePath('/admin/users');
    } catch (error) {
        console.error(error);
        return { message: 'Failed to update user role.' };
    }
}

export async function toggleUserBlacklist(userId: string, isBlacklisted: boolean) {
    initializeFirebaseAdmin();
    const db = getAdminFirestore();
    try {
        await db.collection('users').doc(userId).update({ isBlacklisted });
        revalidatePath('/admin/users');
    } catch (error) {
        console.error(error);
        return { message: 'Failed to update user blacklist status.' };
    }
}
