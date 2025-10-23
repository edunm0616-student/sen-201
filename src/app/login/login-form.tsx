
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoginSchema } from '@/lib/schema';
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
import { useTransition, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth, useFirestore, useMemoFirebase } from '@/firebase';
import { redirect } from 'next/navigation';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';


export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<{ isAdmin?: boolean }>(userProfileRef);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !isUserLoading && userProfile) {
        if (userProfile.isAdmin) {
            redirect('/admin');
        } else {
            redirect('/dashboard');
        }
    }
  }, [user, isUserLoading, userProfile]);


  function onSubmit(values: z.infer<typeof LoginSchema>) {
    startTransition(async () => {
      try {
        initiateEmailSignIn(auth, values.email, values.password);
        // The redirect is handled by the effect now
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid credentials or network error.',
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
          Login
        </Button>
      </form>
    </Form>
  );
}
