'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-50 rounded-2xl">
              <AlertCircle size={64} className="text-red-500" />
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-text mb-2">Something went wrong!</h1>
          <p className="text-text-light mb-4">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          {error.message && (
            <div className="p-4 bg-red-50 rounded-xl text-left mb-4">
              <p className="text-sm font-mono text-red-600">{error.message}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" leftIcon={<RefreshCcw size={20} />} onClick={reset}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
            Go to Dashboard
          </Button>
        </div>

        <div className="mt-8">
          <p className="text-sm text-text-lighter">
            If the problem persists, <a href="mailto:support@tutorverse.com" className="text-primary hover:underline">contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
