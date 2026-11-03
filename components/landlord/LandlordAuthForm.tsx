'use client';

import Link from 'next/link';
import { useState } from 'react';
import { login, signup, AuthError, MissingIdentityError } from '@netlify/identity';
import { Building2, Loader2 } from 'lucide-react';

type Mode = 'login' | 'signup';

function describeError(err: unknown, mode: Mode): string {
  if (err instanceof MissingIdentityError) {
    return 'Authentication is not available here. Run the site with "netlify dev" or deploy it to Netlify.';
  }
  if (err instanceof AuthError) {
    if (err.status === 401) return 'Invalid email or password.';
    if (err.status === 403) return mode === 'signup' ? 'Sign-ups are currently disabled.' : 'Login not allowed.';
    if (err.status === 422) return 'Please check your email and use a password with at least 6 characters.';
    return err.message;
  }
  return 'Something went wrong. Please try again.';
}

export default function LandlordAuthForm({ mode }: { mode: Mode }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const isSignup = mode === 'signup';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (isSignup) {
        // account_type tells the signup event function to grant the LANDLORD role
        const user = await signup(email, password, { full_name: name, account_type: 'LANDLORD' });
        if (user.confirmedAt) {
          window.location.href = '/dashboard/landlord';
        } else {
          setInfo('Account created! Check your email and click the confirmation link, then log in.');
        }
      } else {
        await login(email, password);
        window.location.href = '/dashboard/landlord'; // full reload so the server sees the auth cookie
      }
    } catch (err) {
      setError(describeError(err, mode));
    } finally {
      setLoading(false);
    }
  }

  const input = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-sm p-7">
        <Link href="/" className="flex items-center space-x-2 mb-6">
          <span className="bg-indigo-600 text-white p-2 rounded-xl"><Building2 className="w-5 h-5" /></span>
          <span className="text-lg font-extrabold text-slate-900">Nest<span className="text-indigo-600">Finder</span></span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{isSignup ? 'Create landlord account' : 'Landlord login'}</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          {isSignup ? 'List your PG and manage tenants & rent in one place.' : 'Manage your tenants and track rent.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Full name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Ramesh Kumar" />
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Password</label>
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={input} placeholder="••••••••" />
          </div>

          {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}
          {info && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">{info}</p>}

          <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl flex items-center justify-center">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSignup ? 'Sign up as Landlord' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          {isSignup ? (
            <>Already have an account? <Link href="/landlord/login" className="text-indigo-600 font-semibold">Log in</Link></>
          ) : (
            <>New landlord? <Link href="/landlord/signup" className="text-indigo-600 font-semibold">Create an account</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
