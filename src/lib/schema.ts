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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

export const LoanApplicationSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  age: z.coerce.number().min(18, 'You must be at least 18 years old'),
  employmentStatus: z.string().min(1, 'Employment status is required'),
  monthlyIncome: z.coerce.number().min(0, 'Monthly income must be a positive number'),
  loanAmount: z.coerce.number().min(100, 'Loan amount must be at least ₦100'),
  loanPurpose: z.string().min(10, 'Please describe the loan purpose in more detail (min. 10 characters)'),
  kycDocument: z
    .any()
    .refine((files) => files?.length == 1, "KYC Document is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png, .webp and .pdf files are accepted."
    ),
});
