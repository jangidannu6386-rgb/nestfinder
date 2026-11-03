import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@netlify/identity';
import { Building2, ShieldAlert } from 'lucide-react';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { isLandlord } from '@/lib/auth';
import TenantManager from '@/components/landlord/TenantManager';
import LogoutButton from '@/components/landlord/LogoutButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Landlord Dashboard | NestFinder' };

export default async function LandlordDashboardPage() {
  const user = await getUser();
  if (!user) redirect('/landlord/login');

  if (!isLandlord(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md bg-white border rounded-3xl p-8 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-2">Landlord access only</h1>
          <p className="text-sm text-slate-600 mb-6">
            Your account ({user.email}) does not have the LANDLORD role. Sign up with a landlord account to use this dashboard.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/landlord/signup" className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl">Landlord sign up</Link>
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  const rows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.landlordId, user.id))
    .orderBy(desc(tenants.createdAt));

  const initialTenants = rows.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  const displayName = (user.name || (user.userMetadata?.full_name as string | undefined) || user.email) ?? 'Landlord';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <span className="bg-indigo-600 text-white p-2 rounded-xl"><Building2 className="w-5 h-5" /></span>
            <span className="text-lg font-extrabold text-slate-900">Nest<span className="text-indigo-600">Finder</span></span>
          </Link>
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline text-sm text-slate-600">{displayName}</span>
            <span className="text-[10px] font-bold tracking-wider bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">LANDLORD</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Landlord Dashboard</h1>
        <p className="text-sm text-slate-500 mb-8">Add tenants and keep track of who has paid this month&apos;s rent.</p>
        <TenantManager initialTenants={initialTenants} />
      </main>
    </div>
  );
}
