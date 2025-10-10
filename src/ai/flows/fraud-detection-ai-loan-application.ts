'use server';
/**
 * @fileOverview AI-powered fraud detection for loan applications.
 *
 * This file contains a Genkit flow that analyzes loan application data to identify potentially fraudulent applications.
 * - fraudDetectionAILoanApplication - The main function to trigger the fraud detection flow.
 * - FraudDetectionInput - The input type for the fraudDetectionAILoanApplication function.
 * - FraudDetectionOutput - The output type for the fraudDetectionAILoanApplication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FraudDetectionInputSchema = z.object({
  applicantName: z.string().describe('The name of the loan applicant.'),
  loanAmount: z.number().describe('The amount of the loan requested.'),
  income: z.number().describe('The applicant’s annual income.'),
  employmentHistory: z.string().describe('The applicant’s employment history.'),
  creditScore: z.number().describe('The applicant’s credit score.'),
  applicationDetails: z
    .string()
    .describe('Any additional details provided in the loan application.'),
});

export type FraudDetectionInput = z.infer<typeof FraudDetectionInputSchema>;

const FraudDetectionOutputSchema = z.object({
  isFraudulent: z
    .boolean()
    .describe(
      'A boolean indicating whether the loan application is potentially fraudulent.'
    ),
  fraudExplanation: z
    .string()
    .describe(
      'A detailed explanation of why the application is flagged as potentially fraudulent.'
    ),
  riskScore: z
    .number()
    .describe('A numerical risk score indicating the likelihood of fraud.'),
});

export type FraudDetectionOutput = z.infer<typeof FraudDetectionOutputSchema>;

export async function fraudDetectionAILoanApplication(
  input: FraudDetectionInput
): Promise<FraudDetectionOutput> {
  return fraudDetectionFlow(input);
}

const fraudDetectionPrompt = ai.definePrompt({
  name: 'fraudDetectionPrompt',
  input: {schema: FraudDetectionInputSchema},
  output: {schema: FraudDetectionOutputSchema},
  prompt: `You are an AI assistant specializing in fraud detection for loan applications.
  Analyze the following loan application data to determine if it is potentially fraudulent.
  Provide a detailed explanation of your reasoning, including a risk score (0-100).

  Applicant Name: {{{applicantName}}}
  Loan Amount: {{{loanAmount}}}
  Income: {{{income}}}
  Employment History: {{{employmentHistory}}}
  Credit Score: {{{creditScore}}}
  Application Details: {{{applicationDetails}}}

  Based on this information, determine if the application is fraudulent and provide a fraud explanation.
  Set the isFraudulent boolean accordingly.
  The risk score should be between 0 and 100.
  `,
});

const fraudDetectionFlow = ai.defineFlow(
  {
    name: 'fraudDetectionFlow',
    inputSchema: FraudDetectionInputSchema,
    outputSchema: FraudDetectionOutputSchema,
  },
  async input => {
    const {output} = await fraudDetectionPrompt(input);
    return output!;
  }
);
