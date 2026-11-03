'use client';

import React, { useState } from 'react';
import { 
  Building2, Search, MapPin, ShieldCheck, 
  User, LogOut, Heart, Bookmark, CheckCircle2, AlertCircle, 
  Plus, UserPlus, ChevronRight, Filter, IndianRupee, X
} from 'lucide-react';

type Role = 'tenant' | 'landlord';

interface TenantInfo {
  name: string;
  mobile: string;
  aadhaar: string;
  address: string;
  monthlyRent: number;
  securityDeposit: number;
  dueDate: string;
}

interface Room {
  id: string;
  roomNumber: string;
  type: 'Single' | 'Double Sharing' | 'Triple Sharing';
  status: 'Empty' | 'Full';
  tenant?: TenantInfo;
}

interface Property {
  id: string;
  title: string;
  city: string;
  locality: string;
  price: number;
  roomTypes: string[];
  amenities: string[];
  image: string;
  verified: boolean;
  ownerName: string;
  ownerContact: string;
  description: string;
  rooms: Room[];
}

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Sai Comfort Luxury PG for Gents',
    city: 'Bangalore',
    locality: 'Koramangala',
    price: 9500,
    roomTypes: ['Single', 'Double Sharing'],
    amenities: ['Wi-Fi', 'AC', 'Food included', 'Power Backup'],
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
    verified: true,
    ownerName: 'Ramesh Kumar',
    ownerContact: '+91 98765 43210',
    description: 'Fully furnished PG with high-speed Wi-Fi, 3 times home-cooked meals, and 24/7 power backup located near tech parks.',
    rooms: [
      { id: 'r101', roomNumber: '101', type: 'Single', status: 'Empty' },
      { id: 'r102', roomNumber: '102', type: 'Double Sharing', status: 'Full', tenant: {
        name: 'Amit Sharma',
        mobile: '9811122233',
        aadhaar: 'XXXX-XXXX-1234',
        address: 'MG Road, Pune',
        monthlyRent: 9500,
        securityDeposit: 15000,
        dueDate: '5th of every month'
      }},
      { id: 'r103', roomNumber: '103', type: 'Double Sharing', status: 'Empty' }
    ]
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'discovery' | 'dashboard'>('home');
  const [user, setUser] = useState<{ mobile: string; role: Role } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileInput, setMobileInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('tenant');
  const [mockOtpCode, setMockOtpCode] = useState('');

  const [searchCity, setSearchCity] = useState('');
  const [searchLocality, setSearchLocality] = useState('');
  const [filterBudget, setFilterBudget] = useState<number>(20000);
  const [filterOccupancy, setFilterOccupancy] = useState<string>('All');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);

  const [shortlisted, setShortlisted] = useState<string[]>(['prop-1']);
  const [bookingRequests, setBookingRequests] = useState<string[]>(['prop-1']);

  const [onboardingModal, setOnboardingModal] = useState<{ propertyId: string; roomId: string } | null>(null);
  const [tenantForm, setTenantForm] = useState<TenantInfo>({
    name: '', mobile: '', aadhaar: '', address: '', monthlyRent: 8000, securityDeposit: 10000, dueDate: '1st of every month'
  });
  const [aadhaarError, setAadhaarError] = useState('');

  const handleSendOtp = () => {
    if (mobileInput.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOtpCode(code);
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otpInput === mockOtpCode || otpInput === '123456') {
      setUser({ mobile: mobileInput, role: selectedRole });
      setAuthModalOpen(false);
      setOtpSent(false);
      setMobileInput('');
      setOtpInput('');
      setActiveTab('dashboard');
    } else {
      alert('Invalid OTP. Use mock code shown on screen or 123456.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
  };

  const validateAadhaar = (val: string) => {
    const clean = val.replace(/\s+/g, '');
    if (/^\d{12}$/.test(clean)) {
      setAadhaarError('');
      return true;
    } else {
      setAadhaarError('Aadhaar must be exactly 12 digits.');
      return false;
    }
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAadhaar(tenantForm.aadhaar)) return;
    if (!onboardingModal) return;

    setProperties(prev => prev.map(prop => {
      if (prop.id === onboardingModal.propertyId) {
        return {
          ...prop,
          rooms: prop.rooms.map(room => {
            if (room.id === onboardingModal.roomId) {
              return {
                ...room,
                status: 'Full',
                tenant: { ...tenantForm, aadhaar: `XXXX-XXXX-${tenantForm.aadhaar.slice(-4)}` }
              };
            }
            return room;
          })
        };
      }
      return prop;
    }));

    setOnboardingModal(null);
  };

  const handleVacateRoom = (propId: string, roomId: string) => {
    if (confirm('Are you sure you want to vacate this room?')) {
      setProperties(prev => prev.map(prop => {
        if (prop.id === propId) {
          return {
            ...prop,
            rooms: prop.rooms.map(room => {
              if (room.id === roomId) {
                return { ...room, status: 'Empty', tenant: undefined };
              }
              return room;
            })
          };
        }
        return prop;
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">Nest<span className="text-indigo-600">Finder</span></span>
              <span className="block text-[10px] font-medium tracking-wider text-slate-400 uppercase">Direct Owner Rentals</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}>Home</button>
            <button onClick={() => setActiveTab('discovery')} className={activeTab === 'discovery' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}>Discovery</button>
            {user && <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}>Dashboard</button>}
          </nav>
          <div>
            {user ? (
              <button onClick={handleLogout} className="text-rose-600 text-xs font-bold border px-3 py-1.5 rounded-full flex items-center space-x-1">
                <LogOut className="w-3.5 h-3.5" /><span>Logout</span>
              </button>
            ) : (
              <button onClick={() => setAuthModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Sign In</button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'home' && (
          <div className="text-center py-16">
            <h1 className="text-4xl font-black mb-4">Find Your Ideal Living Space Hassle-Free</h1>
            <p className="text-slate-600 mb-8">Direct owner PGs and rentals with zero brokerage.</p>
            <button onClick={() => setActiveTab('discovery')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">Explore Properties</button>
          </div>
        )}
        {activeTab === 'discovery' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Discovery & Search</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.map(p => (
                <div key={p.id} className="bg-white border rounded-2xl p-4 shadow-sm">
                  <img src={p.image} alt={p.title} className="w-full h-40 object-cover rounded-xl mb-3" />
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="text-sm text-slate-500">{p.locality}, {p.city}</p>
                  <p className="text-indigo-600 font-bold mt-2">₹{p.price} /mo</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'dashboard' && user && (
          <div>
            <h2 className="text-2xl font-bold mb-4 capitalize">{user.role} Dashboard</h2>
            <p className="text-slate-600">Welcome! You are logged in with mobile: {user.mobile}</p>
          </div>
        )}
      </main>

      {authModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full relative">
            <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-4">Sign In</h3>
            {!otpSent ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase">Role</label>
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as Role)} className="w-full border p-2 rounded-xl text-sm">
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase">Mobile</label>
                  <input type="text" maxLength={10} placeholder="10-digit number" value={mobileInput} onChange={(e) => setMobileInput(e.target.value)} className="w-full border p-2 rounded-xl text-sm" />
                </div>
                <button onClick={handleSendOtp} className="w-full bg-indigo-600 text-white p-2.5 rounded-xl font-bold">Send OTP</button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-indigo-600 font-bold">Mock OTP Code: {mockOtpCode} (or use 123456)</p>
                <input type="text" maxLength={6} placeholder="Enter OTP" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className="w-full border p-2 rounded-xl text-center text-lg font-bold" />
                <button onClick={handleVerifyOtp} className="w-full bg-emerald-600 text-white p-2.5 rounded-xl font-bold">Verify OTP</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
