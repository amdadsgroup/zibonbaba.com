'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bike, User, Mail, Phone, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
  CheckCircle2, ShieldCheck, MapPin, Truck, AlertCircle, FileText
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const VEHICLE_TYPES = [
  { id: 'MOTORCYCLE', label: 'Motorcycle / Bike' },
  { id: 'CYCLE', label: 'Bicycle' },
  { id: 'VAN', label: 'Covered Van' },
  { id: 'TRUCK', label: 'Light Truck' },
  { id: 'ON_FOOT', label: 'Walker / On Foot' }
];

export default function DeliveryRegisterPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('MOTORCYCLE');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [preferredZone, setPreferredZone] = useState('Dhaka Central');
  const [district, setDistrict] = useState('Dhaka');
  const [division, setDivision] = useState('Dhaka');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) return setError('Full name is required.');
    if (!email.trim() || !email.includes('@')) return setError('A valid email address is required.');
    if (!phone.trim() || phone.length < 11) return setError('A valid 11-digit mobile number is required.');
    if (!password || password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (!termsAccepted) return setError('You must agree to rider safety and delivery policies.');

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          role: 'DELIVERY_MAN',
          vehicleType,
          vehicleNumber: vehicleNumber.trim() || undefined,
          drivingLicense: drivingLicense.trim() || undefined,
          nidNumber: nidNumber.trim() || undefined,
          emergencyContact: emergencyContact.trim() || undefined,
          preferredZone: preferredZone.trim(),
          district: district.trim(),
          division: division.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create delivery partner account.');
      }

      setSuccess(true);
      await login(email.trim().toLowerCase(), password);

      setTimeout(() => {
        router.push('/delivery');
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-gray-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-gray-900 text-lg shadow-glow">
              Z
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Zibon<span className="text-primary">baba</span>
            </span>
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold tracking-wide uppercase flex items-center gap-1">
            <Bike size={14} /> Delivery Registration
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
            <ArrowLeft size={14} /> Marketplace
          </Link>
          <Link href="/delivery/login" className="text-primary hover:underline font-bold">
            Already registered? Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />

        <div className="w-full max-w-3xl bg-gray-900/80 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
              <Bike size={14} /> Zibonbaba Express Fleet
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Join Our Fast-Growing Delivery Fleet
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">
              Deliver packages in your preferred zones, earn competitive fees per drop, and enjoy instant payouts to your mobile wallet.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-start gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>Rider account registered successfully! Loading courier console...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Rider Info */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <User size={14} /> 1. Personal & Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rakib Hossain"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rider@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Emergency Contact Number</label>
                  <input
                    type="tel"
                    placeholder="Parent / Spouse phone"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* 2. Vehicle & Zone */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <Bike size={14} /> 2. Vehicle & Delivery Zone
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Vehicle Type *</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-gray-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none"
                  >
                    {VEHICLE_TYPES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Vehicle Plate / Reg No.</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka Metro-HA-1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Preferred Zone *</label>
                  <input
                    type="text"
                    placeholder="e.g. Mirpur / Dhanmondi"
                    value={preferredZone}
                    onChange={(e) => setPreferredZone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">National ID (NID) No.</label>
                  <input
                    type="text"
                    placeholder="10 or 17 digit NID"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Driving License Number (if motorized)</label>
                  <input
                    type="text"
                    placeholder="BRTA Driving License Number"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Password */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <Lock size={14} /> 3. Password & Security
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Create Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Confirm Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Submit */}
            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-400 select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary mt-0.5"
                />
                <span>
                  I agree to the Zibonbaba Delivery Partner Code of Conduct, safe road regulations, and cash-on-delivery collection rules.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-primary hover:bg-primary-accent text-gray-950 font-black py-3.5 px-6 rounded-xl text-sm transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Registering Rider Profile...
                  </>
                ) : (
                  <>
                    Complete Registration & Open Rider Console <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-950 py-4 px-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Zibonbaba Express Logistics. All rights reserved.
      </footer>
    </div>
  );
}
