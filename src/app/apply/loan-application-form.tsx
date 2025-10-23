
'use client';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState } from 'react';
import { applyForLoan, type LoanApplicationState } from '@/app/actions';
import { LoanApplicationSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PartyPopper, Frown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

type LoanApplicationFormValues = z.infer<typeof LoanApplicationSchema>;

export default function LoanApplicationForm() {
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const initialState: LoanApplicationState = { message: '' };
  const [state, formAction, isPending] = useActionState(applyForLoan, initialState);

  const form = useForm<LoanApplicationFormValues>({
    resolver: zodResolver(LoanApplicationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      age: 18,
      employmentStatus: undefined,
      monthlyIncome: 0,
      loanAmount: 1000,
      loanPurpose: '',
      kycDocument: undefined,
    },
  });
  
  const fileRef = form.register("kycDocument");

  useEffect(() => {
    if (state.message === 'success' && state.data) {
      setResultModalOpen(true);

      if (state.data.isEligible && user && firestore) {
        const loanData = {
          userId: user.uid,
          loanAmount: form.getValues('loanAmount'),
          loanPurpose: form.getValues('loanPurpose'),
          applicationDate: new Date().toISOString(),
          status: 'Outstanding',
          ...form.getValues()
        };

        const loanApplicationsRef = collection(firestore, `users/${user.uid}/loanApplications`);
        addDocumentNonBlocking(loanApplicationsRef, loanData);

        toast({
          title: "Application Saved!",
          description: "Your loan application has been saved to your profile."
        });
      }
      form.reset();

    } else if (state.message === 'error' && state.error) {
      toast({
        variant: 'destructive',
        title: 'Application Failed',
        description: state.error,
      });
    }
  }, [state, toast, form, user, firestore]);
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Apply for a Loan</CardTitle>
          <CardDescription>Fill in your details to check your loan eligibility.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form action={formAction} className="space-y-8">
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your employment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="self-employed">Self-Employed</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50000" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100000" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="loanPurpose"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Purpose of Loan</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., To finance a small business startup" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kycDocument"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>KYC Document (BVN, NIN, etc.)</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*,.pdf" {...fileRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending || !user}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Eligibility...
                  </>
                ) : (
                  'Check Eligibility'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      {state.data && (
        <AlertDialog open={resultModalOpen} onOpenChange={setResultModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 font-headline">
                {state.data.isEligible ? <PartyPopper className="text-green-500 h-8 w-8" /> : <Frown className="text-red-500 h-8 w-8" />}
                Eligibility Result
              </AlertDialogTitle>
              <AlertDialogDescription>
                {state.data.isEligible ? "Congratulations! You are eligible for the loan." : "We're sorry, you are not eligible for the loan at this time."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="text-sm space-y-4 py-4">
              <p><strong className="text-foreground">Reason:</strong> {state.data.eligibilityReason}</p>
              {state.data.isEligible && (
                 <div className="p-4 bg-secondary rounded-lg">
                    <p className="font-bold">Loan Offer</p>
                    <p><strong className="text-foreground">Approved Amount:</strong> ₦{state.data.recommendedLoanAmount?.toLocaleString() || form.getValues('loanAmount').toLocaleString()}</p>
                    <p><strong className="text-foreground">Interest Rate:</strong> 5% (fixed)</p>
                    <p className="mt-2"><strong className="text-foreground">Repayment Options:</strong></p>
                    <ul className="list-disc pl-5 text-muted-foreground">
                        <li>Weekly</li>
                        <li>Monthly</li>
                        <li>Quarterly</li>
                    </ul>
                 </div>
              )}
              {!state.data.isEligible && state.data.recommendedLoanAmount && (
                <p className="p-4 bg-secondary rounded-lg"><strong className="text-foreground">Suggestion:</strong> You might be eligible for a lower amount of <span className="font-bold">₦{state.data.recommendedLoanAmount.toLocaleString()}</span>. Consider reapplying with this amount.</p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
