'use client';

import { useActionState, useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LoanPlan } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { createLoanPlan, deleteLoanPlan, updateLoanPlan } from '@/lib/actions';
import { SubmitButton } from './submit-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function PlanManager({ plans }: { plans: LoanPlan[] }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Loan Plans</h2>
          <p className="text-muted-foreground">
            Manage available loan plans for customers.
          </p>
        </div>
        <AddPlanDialog />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Interest Rate</TableHead>
              <TableHead>Amount Range</TableHead>
              <TableHead className="w-[50px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{plan.interestRate}%</TableCell>
                <TableCell>
                  ₦{plan.minAmount.toLocaleString()} - ₦
                  {plan.maxAmount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <PlanActions plan={plan} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function PlanActions({ plan }: { plan: LoanPlan }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditPlanDialog plan={plan}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </EditPlanDialog>
        <DeletePlanDialog planId={plan.id}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DeletePlanDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AddPlanDialog() {
  const [state, formAction] = useActionState(createLoanPlan, null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <PlanForm formAction={formAction} buttonText="Create Plan" />
      </DialogContent>
    </Dialog>
  );
}

function EditPlanDialog({ plan, children }: { plan: LoanPlan, children: React.ReactNode }) {
    const [state, formAction] = useActionState(updateLoanPlan, null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (state?.success) {
            setOpen(false);
        }
    }, [state]);
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <PlanForm formAction={formAction} plan={plan} buttonText="Save Changes" />
            </DialogContent>
        </Dialog>
    )
}

function DeletePlanDialog({ planId, children }: { planId: string, children: React.ReactNode }) {
    const formAction = deleteLoanPlan.bind(null, planId);
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <form action={formAction}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this loan plan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <SubmitButton buttonText="Delete" variant="destructive" />
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}


function PlanForm({
  formAction,
  plan,
  buttonText,
}: {
  formAction: (payload: FormData) => void;
  plan?: LoanPlan;
  buttonText: string;
}) {
  return (
    <form action={formAction}>
      <DialogHeader>
        <DialogTitle>{plan ? 'Edit' : 'Add New'} Loan Plan</DialogTitle>
        <DialogDescription>
          Fill in the details for the loan plan.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {plan && <input type="hidden" name="id" value={plan.id} />}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name" name="name" className="col-span-3" defaultValue={plan?.name} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            className="col-span-3"
            defaultValue={plan?.description}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="interestRate" className="text-right">
            Rate (%)
          </Label>
          <Input
            id="interestRate"
            name="interestRate"
            type="number"
            step="0.1"
            className="col-span-3"
            defaultValue={plan?.interestRate}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="minAmount" className="text-right">
            Min Amount
          </Label>
          <Input
            id="minAmount"
            name="minAmount"
            type="number"
            className="col-span-3"
            defaultValue={plan?.minAmount}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="maxAmount" className="text-right">
            Max Amount
          </Label>
          <Input
            id="maxAmount"
            name="maxAmount"
            type="number"
            className="col-span-3"
            defaultValue={plan?.maxAmount}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="imageId" className="text-right">
            Image
          </Label>
          <Select name="imageId" defaultValue={plan?.imageId}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select an image" />
            </SelectTrigger>
            <SelectContent>
              {PlaceHolderImages.filter((p) => p.id !== 'hero-image').map(
                (image) => (
                  <SelectItem key={image.id} value={image.id}>
                    {image.description}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <SubmitButton buttonText={buttonText} />
      </DialogFooter>
    </form>
  );
}
