import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export const SignupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

// Remove all specific validation to allow any data to be submitted.
export const LoanApplicationSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  age: z.string(),
  employmentStatus: z.string().optional(), // optional because it's a select field
  monthlyIncome: z.string(),
  loanAmount: z.string(),
  loanPurpose: z.string(),
  bvn: z.string(),
  nin: z.string(),
});
