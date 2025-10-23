
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SignupSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTransition, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { redirect } from 'next/navigation';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { doc } from 'firebase/firestore';


export function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const userCreatedRef = useRef(false);

  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !isUserLoading) {
      // Create user profile in Firestore if it hasn't been created yet
      if (!userCreatedRef.current && firestore) {
        const userRef = doc(firestore, 'users', user.uid);
        const userData = {
          id: user.uid,
          email: user.email,
          firstName: form.getValues('name').split(' ')[0] || '',
          lastName: form.getValues('name').split(' ').slice(1).join(' ') || '',
          dateOfBirth: '', // This can be collected in a user profile page later
          isAdmin: false, // Default to not being an admin
          photoURL: `https://picsum.photos/seed/${user.uid}/200/200`,
        };
        setDocumentNonBlocking(userRef, userData, { merge: true });
        userCreatedRef.current = true;
      }
      redirect('/dashboard');
    }
  }, [user, isUserLoading, firestore, form]);

  function onSubmit(values: z.infer<typeof SignupSchema>) {
    startTransition(async () => {
      try {
        userCreatedRef.current = false; // Reset before new signup attempt
        initiateEmailSignUp(auth, values.email, values.password);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Signup Failed',
          description:
            'Could not create account. The email might be taken or there was a network error.',
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending || isUserLoading}>
          {(isPending || isUserLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>
    </Form>
  );
}
