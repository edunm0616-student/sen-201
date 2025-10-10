'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '../ui/button';

export function SubmitButton({ buttonText, ...props }: { buttonText: string } & ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? 'Saving...' : buttonText}
    </Button>
  );
}
