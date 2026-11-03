'use client';

import { useEffect, useState } from 'react';
import { handleAuthCallback, AuthError } from '@netlify/identity';

/**
 * Processes Netlify Identity links (email confirmation, password recovery, invites)
 * that land on any page with a token in the URL hash.
 */
export default function AuthCallbackHandler() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!window.location.hash.includes('_token=')) return;
    handleAuthCallback()
      .then((result) => {
        if (!result) return;
        if (result.type === 'confirmation') {
          setMessage('Email confirmed! Redirecting to your dashboard…');
          window.location.href = '/dashboard/landlord';
        }
      })
      .catch((err) => {
        setMessage(err instanceof AuthError ? err.message : 'Could not verify the link.');
      });
  }, []);

  if (!message) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
      {message}
    </div>
  );
}
