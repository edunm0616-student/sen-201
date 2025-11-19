'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

export function UserFeedback() {
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim() && firestore) {
      const feedbackCollection = collection(firestore, 'feedback');
      const feedbackData = {
        feedbackText: feedback,
        submittedAt: new Date().toISOString(),
        userId: user?.uid || null, // Store user ID if available
      };
      
      addDocumentNonBlocking(feedbackCollection, feedbackData);

      toast({
        title: 'Feedback Received!',
        description: "Thank you for your feedback. We'll use it to improve our service.",
      });
      setFeedback('');
    }
  };

  return (
    <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-foreground/80">Send us your feedback</h3>
            <Textarea
            placeholder="Your thoughts, suggestions, or issues..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="bg-muted/50"
            />
            <Button type="submit" variant="secondary" size="sm" className="self-end" disabled={!feedback.trim()}>
            Send Feedback
            </Button>
        </form>
    </div>
  );
}
