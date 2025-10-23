'use server';
/**
 * @fileOverview An AI agent to automate loan eligibility checks.
 *
 * - automateLoanEligibilityCheck - A function that determines loan eligibility based on user data and documents.
 * - AutomateLoanEligibilityCheckInput - The input type for the automateLoanEligibilityCheck function.
 * - AutomateLoanEligibilityCheckOutput - The return type for the automateLoanEligibilityCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomateLoanEligibilityCheckInputSchema = z.object({
  personalDetails: z
    .string()
    .describe('A summary of the user\'s personal details including age, employment status, and income.'),
  loanAmount: z.number().describe('The amount of loan the user is requesting.'),
  loanPurpose: z.string().describe('The stated purpose of the loan.'),
  kycDocuments: z
    .string()
    .describe(
      'KYC documents uploaded by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' + 
      'These documents will be used to verify the user\'s identity and financial status. Include all relevant information such as BVN and NIN.'
    ),
});
export type AutomateLoanEligibilityCheckInput = z.infer<
  typeof AutomateLoanEligibilityCheckInputSchema
>;

const AutomateLoanEligibilityCheckOutputSchema = z.object({
  isEligible: z
    .boolean()
    .describe('Whether the user is eligible for the loan or not.'),
  eligibilityReason: z
    .string()
    .describe(
      'The detailed reason for the eligibility determination, including factors considered and specific issues found.'
    ),
  recommendedLoanAmount: z
    .number()
    .optional()
    .describe(
      'The recommended loan amount based on the user\'s financial situation, if applicable.'
    ),
});
export type AutomateLoanEligibilityCheckOutput = z.infer<
  typeof AutomateLoanEligibilityCheckOutputSchema
>;

export async function automateLoanEligibilityCheck(
  input: AutomateLoanEligibilityCheckInput
): Promise<AutomateLoanEligibilityCheckOutput> {
  return automateLoanEligibilityCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automateLoanEligibilityCheckPrompt',
  input: {schema: AutomateLoanEligibilityCheckInputSchema},
  output: {schema: AutomateLoanEligibilityCheckOutputSchema},
  prompt: `You are an AI loan eligibility expert. Analyze the following information to determine if the user is eligible for a loan. Be very detailed and explain your reasoning.

Personal Details: {{{personalDetails}}}
Loan Amount: {{{loanAmount}}}
Loan Purpose: {{{loanPurpose}}}
KYC Documents: {{media url=kycDocuments}}

Based on this information, determine if the user is eligible for the loan and provide a detailed explanation. If the user is not eligible, clearly state the reasons why. Also, if applicable, recommend a different loan amount that they might be eligible for.
`,
});

const automateLoanEligibilityCheckFlow = ai.defineFlow(
  {
    name: 'automateLoanEligibilityCheckFlow',
    inputSchema: AutomateLoanEligibilityCheckInputSchema,
    outputSchema: AutomateLoanEligibilityCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
