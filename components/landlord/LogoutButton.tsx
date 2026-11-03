'use client';

import { logout } from '@netlify/identity';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.href = '/landlord/login';
    }
  }
  return (
    <button onClick={handleLogout} className="text-rose-600 text-xs font-bold border border-rose-200 px-3 py-1.5 rounded-full flex items-center space-x-1 hover:bg-rose-50">
      <LogOut className="w-3.5 h-3.5" /><span>Logout</span>
    </button>
  );
}
