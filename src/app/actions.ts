'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { LoginSchema, SignupSchema, LoanApplicationSchema } from '@/lib/schema';
import { automateLoanEligibilityCheck } from '@/ai/flows/automate-loan-eligibility-check';
import type { AutomateLoanEligibilityCheckOutput } from '@/ai/flows/automate-loan-eligibility-check';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';


export async function login(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  // This is now safe because we are not calling a client function
  const { email, password } = validatedFields.data;
  
  // We will handle the auth logic on the client
  // For now, this action will just validate.
  // The actual sign-in will be triggered from the client form.

  redirect('/dashboard');
}

export async function signup(values: z.infer<typeof SignupSchema>) {
  const validatedFields = SignupSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }
  
  // We will handle the auth logic on the client
  // For now, this action will just validate.
  // The actual sign-up will be triggered from the client form.

  redirect('/dashboard');
}

export type LoanApplicationState = {
  message: string;
  data?: AutomateLoanEligibilityCheckOutput;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};


export async function applyForLoan(
  prevState: LoanApplicationState,
  formData: FormData
): Promise<LoanApplicationState> {
  try {
    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = LoanApplicationSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      return { 
        message: 'error', 
        error: 'Invalid form data. Please check your entries.',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { kycDocument, loanAmount, loanPurpose, ...personalData } = validatedFields.data;
    const file = kycDocument[0] as File;

    // Convert file to data URI
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dataURI = `data:${file.type};base64,${buffer.toString('base64')}`;

    const personalDetails = `Full Name: ${personalData.fullName}, Age: ${personalData.age}, Email: ${personalData.email}, Employment: ${personalData.employmentStatus}, Monthly Income: ${personalData.monthlyIncome}`;

    const aiInput = {
      personalDetails,
      loanAmount: loanAmount,
      loanPurpose: loanPurpose,
      kycDocuments: dataURI,
    };
    
    const result = await automateLoanEligibilityCheck(aiInput);

    // This will be handled on the client now
    // if (result.isEligible) {
    // }

    return { message: 'success', data: result };
  } catch (error) {
    console.error(error);
    return { message: 'error', error: 'An unexpected error occurred. Please try again.' };
  }
}
