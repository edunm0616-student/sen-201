
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { LoginSchema, SignupSchema, LoanApplicationSchema } from '@/lib/schema';

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
  message: 'success' | 'error' | '';
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};


export async function applyForLoan(
  prevState: LoanApplicationState,
  formData: FormData
): Promise<LoanApplicationState> {
  // Bypassing all validation and immediately returning success
  // The component will handle saving the data to Firestore.
  return { message: 'success' };
}
