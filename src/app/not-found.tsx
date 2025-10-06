'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-display font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold text-text mb-2">Page Not Found</h2>
          <p className="text-text-light">
            Sorry, the page you are looking for does not exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button variant="primary" leftIcon={<Home size={20} />}>
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="outline" leftIcon={<ArrowLeft size={20} />} onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>

        <div className="mt-8">
          <p className="text-sm text-text-lighter">
            Need help? <a href="mailto:support@tutorverse.com" className="text-primary hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
