'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitLoanApplication } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import type { LoanPlan } from '@/lib/definitions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';
import { useUser } from '@/firebase';

const FormSchema = z.object({
  amount: z.coerce.number().min(1, 'Please enter a valid amount.'),
  income: z.coerce.number().min(1, 'Please enter your annual income.'),
  employmentHistory: z.string().min(5, 'Please provide your employment history.'),
  creditScore: z.coerce.number().min(300).max(850),
  applicationDetails: z.string().min(10, 'Please provide some details.'),
});

type FormValues = z.infer<typeof FormSchema>;

export function ApplicationForm({ plan }: { plan: LoanPlan }) {
  const [initialState, action] = useActionState(submitLoanApplication, undefined);
  const [amount, setAmount] = useState(plan.minAmount);
  const { user } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: plan.minAmount,
      income: 50000,
      employmentHistory: '',
      creditScore: 650,
      applicationDetails: '',
    },
  });

  if (user?.isBlacklisted) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Application Restricted</CardTitle>
                  <CardDescription>
                      Your account is currently restricted from submitting new applications.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Alert variant="destructive">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Account Blacklisted</AlertTitle>
                      <AlertDescription>
                          Please contact support for more information.
                      </AlertDescription>
                  </Alert>
              </CardContent>
          </Card>
      )
  }

  const onSubmit = (data: FormValues) => {
    if (!user) {
      // This should ideally be handled by redirecting to login
      alert('You must be logged in to apply.');
      return;
    }
    const formData = new FormData();
    formData.append('planId', plan.id);
    formData.append('userId', user.uid);
    formData.append('applicantName', user.name || user.email || 'Unknown');

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    action(formData);
  };
  
  const handleAmountChange = (value: number[]) => {
      setAmount(value[0]);
      form.setValue('amount', value[0]);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Apply for a {plan.name}</CardTitle>
            <CardDescription>
              Please fill out the form below to apply for your loan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Amount: ₦{amount.toLocaleString()}</FormLabel>
                  <FormControl>
                    <Slider
                      min={plan.minAmount}
                      max={plan.maxAmount}
                      step={100}
                      defaultValue={[amount]}
                      onValueChange={handleAmountChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Income</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 75000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Score</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="300-850" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="employmentHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment History</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Briefly describe your last 5 years of employment..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicationDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Loan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Home renovation, debt consolidation..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <SubmitButton />
             {initialState?.message && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Submission Error</AlertTitle>
                    <AlertDescription>{initialState.message}</AlertDescription>
                </Alert>
             )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? 'Submitting & Analyzing...' : 'Submit Application'}
    </Button>
  );
}
