import Image from 'next/image';
import Link from 'next/link';
import type { LoanPlan } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export function PlanCard({ plan }: { plan: LoanPlan }) {
  const placeholder = PlaceHolderImages.find((p) => p.id === plan.imageId);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
            {placeholder && (
                <Image
                    src={placeholder.imageUrl}
                    alt={placeholder.description}
                    data-ai-hint={placeholder.imageHint}
                    fill
                    style={{ objectFit: 'cover' }}
                />
            )}
        </div>
      </CardHeader>
      <div className="flex flex-1 flex-col p-6">
        <CardTitle className="mb-2">{plan.name}</CardTitle>
        <CardDescription className="flex-1">{plan.description}</CardDescription>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
                <span className="font-semibold text-foreground">Rate</span>
                <p className="text-muted-foreground">{plan.interestRate}%</p>
            </div>
            <div>
                <span className="font-semibold text-foreground">Amount</span>
                <p className="text-muted-foreground">₦{plan.minAmount.toLocaleString()} - ₦{plan.maxAmount.toLocaleString()}</p>
            </div>
        </div>
      </div>
      <CardFooter className="bg-muted/50 p-6">
        <Button asChild className="w-full">
          <Link href={`/apply/${plan.id}`}>
            Apply Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
