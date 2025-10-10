import Image from 'next/image';
import Link from 'next/link';
import { getLoanPlans } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { PlanCard } from '@/components/loan/plan-card';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  const plans = await getLoanPlans();
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-image');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full bg-muted">
          <div className="container relative z-10 grid items-center gap-8 py-20 text-center lg:py-32">
            <div className="space-y-6">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Fast, Simple, and Secure Loans
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
                QuickLoan offers a streamlined application process with competitive
                rates. Get the funding you need without the hassle.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="#loan-plans">
                    Explore Plans <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard/applications">Track Application</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Loan Plans Section */}
        <section id="loan-plans" className="w-full py-20 md:py-32">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Find the Right Loan for You
              </h2>
              <p className="mt-4 text-muted-foreground">
                We offer a variety of loan options to suit your specific needs.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
