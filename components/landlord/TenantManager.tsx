'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, IndianRupee, Loader2, Phone, Trash2, UserPlus, Users } from 'lucide-react';

export type RentStatus = 'Paid' | 'Pending';

export interface TenantRow {
  id: number;
  tenantName: string;
  roomNumber: string;
  monthlyRent: number;
  contactNumber: string;
  rentStatus: string;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = { tenantName: '', roomNumber: '', monthlyRent: '', contactNumber: '' };
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function TenantManager({ initialTenants }: { initialTenants: TenantRow[] }) {
  const [tenants, setTenants] = useState<TenantRow[]>(initialTenants);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'All' | RentStatus>('All');

  const stats = useMemo(() => {
    const paid = tenants.filter((t) => t.rentStatus === 'Paid');
    const pending = tenants.filter((t) => t.rentStatus !== 'Paid');
    return {
      total: tenants.length,
      collected: paid.reduce((s, t) => s + t.monthlyRent, 0),
      pendingAmount: pending.reduce((s, t) => s + t.monthlyRent, 0),
      pendingCount: pending.length,
    };
  }, [tenants]);

  const visible = filter === 'All' ? tenants : tenants.filter((t) => t.rentStatus === filter);

  async function addTenant(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, monthlyRent: Number(form.monthlyRent) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not add tenant.');
      setTenants((prev) => [data, ...prev]);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not add tenant.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(t: TenantRow) {
    const next: RentStatus = t.rentStatus === 'Paid' ? 'Pending' : 'Paid';
    setBusyId(t.id);
    setTenants((prev) => prev.map((x) => (x.id === t.id ? { ...x, rentStatus: next } : x))); // optimistic
    try {
      const res = await fetch(`/api/tenants/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentStatus: next }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
    } catch (err) {
      setTenants((prev) => prev.map((x) => (x.id === t.id ? { ...x, rentStatus: t.rentStatus } : x)));
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  }

  async function removeTenant(t: TenantRow) {
    if (!confirm(`Remove ${t.tenantName} (Room ${t.roomNumber})?`)) return;
    setBusyId(t.id);
    try {
      const res = await fetch(`/api/tenants/${t.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
      setTenants((prev) => prev.filter((x) => x.id !== t.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  }

  const input = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center text-slate-500 text-xs font-bold uppercase"><Users className="w-4 h-4 mr-1.5" />Tenants</div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center text-emerald-600 text-xs font-bold uppercase"><CheckCircle2 className="w-4 h-4 mr-1.5" />Collected</div>
          <p className="text-3xl font-black text-slate-900 mt-2">{inr(stats.collected)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center text-amber-600 text-xs font-bold uppercase"><Clock className="w-4 h-4 mr-1.5" />Pending ({stats.pendingCount})</div>
          <p className="text-3xl font-black text-slate-900 mt-2">{inr(stats.pendingAmount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Add tenant form */}
        <form onSubmit={addTenant} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-lg flex items-center"><UserPlus className="w-5 h-5 mr-2 text-indigo-600" />Add new tenant</h2>
          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Tenant name</label>
            <input required value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} className={input} placeholder="Amit Sharma" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Room no.</label>
              <input required value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} className={input} placeholder="102" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Monthly rent</label>
              <input required type="number" min={1} step={1} value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} className={input} placeholder="9500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Contact number</label>
            <input required type="tel" maxLength={13} value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} className={input} placeholder="9811122233" />
          </div>
          {formError && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{formError}</p>}
          <button disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl flex items-center justify-center">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Add tenant
          </button>
        </form>

        {/* Rent tracking table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-lg">Rent tracking</h2>
            <div className="flex bg-slate-100 rounded-xl p-1 text-xs font-bold">
              {(['All', 'Paid', 'Pending'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg ${filter === f ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>{f}</button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-16">
              {tenants.length === 0 ? 'No tenants yet. Add your first tenant using the form.' : `No ${filter.toLowerCase()} tenants.`}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-bold">Tenant</th>
                    <th className="px-4 py-3 font-bold">Room</th>
                    <th className="px-4 py-3 font-bold">Rent</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((t) => {
                    const paid = t.rentStatus === 'Paid';
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60">
                        <td className="px-6 py-3">
                          <p className="font-semibold text-slate-900">{t.tenantName}</p>
                          <a href={`tel:${t.contactNumber}`} className="text-xs text-slate-500 flex items-center mt-0.5"><Phone className="w-3 h-3 mr-1" />{t.contactNumber}</a>
                        </td>
                        <td className="px-4 py-3 font-medium">{t.roomNumber}</td>
                        <td className="px-4 py-3 font-medium"><span className="inline-flex items-center"><IndianRupee className="w-3.5 h-3.5" />{t.monthlyRent.toLocaleString('en-IN')}</span></td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${paid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {paid ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Clock className="w-3.5 h-3.5 mr-1" />}
                            {paid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleStatus(t)}
                              disabled={busyId === t.id}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg border disabled:opacity-50 ${paid ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                            >
                              {paid ? 'Mark Pending' : 'Mark Paid'}
                            </button>
                            <button onClick={() => removeTenant(t)} disabled={busyId === t.id} aria-label="Remove tenant" className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-50">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
