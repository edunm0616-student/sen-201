import { getLoanPlanById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ApplicationForm } from '@/components/loan/application-form';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default async function ApplyPage({
  params,
}: {
  params: { planId: string };
}) {
  const plan = await getLoanPlanById(params.planId);

  if (!plan) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/40 py-12 md:py-24">
        <div className="container max-w-3xl">
          <ApplicationForm plan={plan} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
