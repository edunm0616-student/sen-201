
'use client';
import { useEffect, useState } from 'react';
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
import { Loader2, PartyPopper } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useUser, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, increment } from 'firebase/firestore';

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
      age: '',
      employmentStatus: undefined,
      monthlyIncome: '',
      loanAmount: '',
      loanPurpose: '',
      bvn: '',
      nin: '',
    },
  });

  useEffect(() => {
    if (state.message === 'success' && user && firestore) {
      setResultModalOpen(true);
      const userRef = doc(firestore, 'users', user.uid);

      // Get all form values
      const formValues = form.getValues();

      // Save loan application
      const loanData = {
        ...formValues, // include all form fields
        userId: user.uid,
        applicationDate: new Date().toISOString(),
        status: 'Pending', // Default status
      };

      const loanApplicationsRef = collection(firestore, 'loanApplications');
      addDocumentNonBlocking(loanApplicationsRef, loanData);
      
      // Update credit score slightly for applying
      updateDocumentNonBlocking(userRef, { creditScore: increment(1) });

      toast({
        title: "Application Submitted!",
        description: "Your loan application has been saved and is pending review."
      });

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
          <CardDescription>Fill in your details to submit a loan application.</CardDescription>
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
                        <Input type="text" {...field} />
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
                        <Input type="text" placeholder="50000" {...field} />
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
                        <Input type="text" placeholder="100000" {...field} />
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
                  name="bvn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Verification Number (BVN)</FormLabel>
                      <FormControl>
                        <Input placeholder="11-digit BVN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="nin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>National Identification Number (NIN)</FormLabel>
                      <FormControl>
                        <Input placeholder="11-digit NIN" {...field} />
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
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <AlertDialog open={resultModalOpen} onOpenChange={setResultModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-headline">
              <PartyPopper className="text-green-500 h-8 w-8" />
              Application Submitted!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your loan application has been successfully submitted for review. We will notify you once a decision has been made.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
