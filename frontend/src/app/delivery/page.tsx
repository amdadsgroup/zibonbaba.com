'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bike, Navigation, Phone, MapPin, DollarSign, Wallet, CheckCircle2,
  AlertCircle, Clock, ShieldCheck, X, Check, Lock, Power, ChevronRight,
  TrendingUp, CreditCard, User, ExternalLink, RefreshCw, LogOut, Package,
  AlertTriangle, Truck, Compass, Store, Eye, Edit3, Save, Star, Award,
  FileText, BadgeCheck
} from 'lucide-react';
import { useStore } from '@/store/useStore';

type DeliveryTab = 'active' | 'orders' | 'earnings' | 'profile';

export default function DeliveryPortalPage() {
  const router = useRouter();
  const { isLoggedIn, role, username, logout, login } = useStore();

  const [activeTab, setActiveTab] = useState<DeliveryTab>('active');
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  // Active status toggle
  const [isOnline, setIsOnline] = useState(false);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);

  // Filter tab for orders
  const [orderFilterTab, setOrderFilterTab] = useState('ALL');

  // Modals & Action States
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isFailedModalOpen, setIsFailedModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<any | null>(null);
  const [customActiveTaskId, setCustomActiveTaskId] = useState<string | null>(null);
  const [selectedTaskForAction, setSelectedTaskForAction] = useState<any | null>(null);

  // Profile Edit Form States
  const [profileFullName, setProfileFullName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileVehicleType, setProfileVehicleType] = useState('BIKE');
  const [profileVehicleNumber, setProfileVehicleNumber] = useState('');
  const [profileDrivingLicense, setProfileDrivingLicense] = useState('');
  const [profileNidNumber, setProfileNidNumber] = useState('');
  const [profileEmergencyContact, setProfileEmergencyContact] = useState('');
  const [profilePreferredZone, setProfilePreferredZone] = useState('');
  const [profileDivision, setProfileDivision] = useState('Dhaka');
  const [profileDistrict, setProfileDistrict] = useState('Dhaka');
  const [profileUpazila, setProfileUpazila] = useState('');

  // Form States
  const [otpInput, setOtpInput] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [codCollectedChecked, setCodCollectedChecked] = useState(true);
  const [failedReasonInput, setFailedReasonInput] = useState('Customer unavailable / phone unreachable');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bKash');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Feedback Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  // 1. Fetch Dashboard
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery/dashboard', { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data);
        setIsOnline(data.profile?.isOnline ?? false);
      }
    } catch (_) {}
  }, []);

  // 2. Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/delivery/orders?tab=${orderFilterTab}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (_) {}
  }, [orderFilterTab]);

  // 3. Fetch Earnings
  const fetchEarnings = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery/earnings', { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setEarningsData(data);
      }
    } catch (_) {}
  }, []);

  // 4. Fetch Profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery/profile', { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setProfileData(data);
        if (data.deliveryProfile) {
          setIsOnline(data.deliveryProfile.isOnline ?? (data.deliveryProfile.availabilityStatus === 'ONLINE'));
        }
      }
    } catch (_) {}
  }, []);

  // Master Initial Load
  useEffect(() => {
    setIsMounted(true);
    const token = getAuthToken();
    if (token) {
      Promise.all([
        fetchDashboard(),
        fetchOrders(),
        fetchEarnings(),
        fetchProfile()
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchDashboard, fetchOrders, fetchEarnings, fetchProfile]);

  // Real-Time Cross-Portal Synchronization Listener
  useEffect(() => {
    const handleSync = () => {
      fetchDashboard();
      fetchOrders();
      fetchEarnings();
    };

    window.addEventListener('zibonbaba:order-sync', handleSync);
    window.addEventListener('zibonbaba:sync', handleSync);

    return () => {
      window.removeEventListener('zibonbaba:order-sync', handleSync);
      window.removeEventListener('zibonbaba:sync', handleSync);
    };
  }, [fetchDashboard, fetchOrders, fetchEarnings]);

  // Open Edit Profile Modal and Pre-populate Form
  const openEditProfileModal = () => {
    const user = profileData?.user || {};
    const dp = profileData?.deliveryProfile || {};
    setProfileFullName(user.fullName || username || '');
    setProfilePhone(user.phone || '');
    setProfileVehicleType(dp.vehicleType || 'BIKE');
    setProfileVehicleNumber(dp.vehicleNumber || '');
    setProfileDrivingLicense(dp.drivingLicense || '');
    setProfileNidNumber(dp.nidNumber || '');
    setProfileEmergencyContact(dp.emergencyContact || '');
    setProfilePreferredZone(dp.preferredZone || 'Dhaka Central');
    setProfileDivision(dp.division || 'Dhaka');
    setProfileDistrict(dp.district || 'Dhaka');
    setProfileUpazila(dp.upazila || '');
    setIsEditProfileModalOpen(true);
  };

  // Submit Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/delivery/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullName: profileFullName.trim(),
          phone: profilePhone.trim(),
          vehicleType: profileVehicleType,
          vehicleNumber: profileVehicleNumber.trim(),
          drivingLicense: profileDrivingLicense.trim(),
          nidNumber: profileNidNumber.trim(),
          emergencyContact: profileEmergencyContact.trim(),
          preferredZone: profilePreferredZone.trim(),
          division: profileDivision.trim(),
          district: profileDistrict.trim(),
          upazila: profileUpazila.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update delivery profile.');
      }

      setSuccessMsg('Delivery Profile updated successfully!');
      setIsEditProfileModalOpen(false);

      // Refresh state
      await Promise.all([
        fetchProfile(),
        fetchDashboard()
      ]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Master Initial Load
  useEffect(() => {
    setIsMounted(true);
    const token = getAuthToken();
    if (token) {
      Promise.all([
        fetchDashboard(),
        fetchOrders(),
        fetchEarnings(),
        fetchProfile()
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchDashboard, fetchOrders, fetchEarnings, fetchProfile]);

  // Toggle Availability Status (Online / Offline)
  const handleToggleOnline = async () => {
    setIsTogglingOnline(true);
    const targetState = !isOnline;
    try {
      const res = await fetch('/api/delivery/availability', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          isOnline: targetState,
          availabilityStatus: targetState ? 'ONLINE' : 'OFFLINE'
        })
      });
      if (res.ok) {
        setIsOnline(targetState);
        setSuccessMsg(targetState ? 'You are now ONLINE! Ready for delivery dispatches.' : 'You are now OFFLINE.');
        fetchDashboard();
      }
    } catch (_) {
      setErrorMsg('Failed to update online status.');
    } finally {
      setIsTogglingOnline(false);
    }
  };

  // Perform Status Transition on Active Task
  const handleTaskTransition = async (task: any, newStatus: string, payload: any = {}) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/delivery/orders/${task.id}/status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          newStatus,
          ...payload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status.');
      }

      setSuccessMsg(data.message || `Order updated to ${newStatus}`);
      setIsOtpModalOpen(false);
      setIsFailedModalOpen(false);
      setOtpInput('');
      setProofNotes('');

      // Refresh data
      await Promise.all([
        fetchDashboard(),
        fetchOrders(),
        fetchEarnings()
      ]);

      if (selectedTaskDetail && selectedTaskDetail.id === task.id) {
        setSelectedTaskDetail((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating order.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Withdrawal Request
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const amt = parseFloat(withdrawAmount);
    if (!amt || amt < 100) {
      setErrorMsg('Minimum payout amount is ৳100.');
      return;
    }

    setIsSubmittingWithdraw(true);

    try {
      const res = await fetch('/api/delivery/withdrawals', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: amt,
          paymentMethod: withdrawMethod,
          accountNumber: withdrawAccount.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payout request.');
      }

      setSuccessMsg(`Payout request for ৳${amt.toLocaleString()} submitted successfully!`);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawAccount('');

      fetchEarnings();
      fetchDashboard();
    } catch (err: any) {
      setErrorMsg(err.message || 'Payout request error.');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  if (!isMounted) return null;

  // Normalize and detect Rider Role from Zustand & LocalStorage
  let effectiveRole = (role || '').toString().toUpperCase().trim();
  if (typeof window !== 'undefined') {
    const storedRole = localStorage.getItem('zibonbaba_role');
    const storedUser = localStorage.getItem('zibonbaba_user');
    if (storedRole) {
      effectiveRole = storedRole.toUpperCase().trim();
    } else if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.role) effectiveRole = u.role.toUpperCase().trim();
      } catch (_) {}
    }
  }

  const isDeliveryRole =
    effectiveRole === 'DELIVERY_MAN' ||
    effectiveRole === 'DELIVERYMAN' ||
    effectiveRole === 'COURIER' ||
    effectiveRole === 'DELIVERY_MANAGER' ||
    effectiveRole === 'DELIVERYMANAGER' ||
    effectiveRole === 'SUPER_ADMIN' ||
    effectiveRole === 'SUPERADMIN' ||
    effectiveRole === 'ADMIN';

  // If user is not logged in OR is logged in as a non-delivery role (e.g. Customer)
  if (!isLoggedIn || !isDeliveryRole) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-white/10 rounded-3xl p-7 sm:p-9 max-w-md w-full text-center text-white shadow-2xl space-y-5">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-glow">
            <Bike className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl font-black mb-1.5 text-white">Delivery Partner Console</h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              {isLoggedIn
                ? `You are currently signed in as ${effectiveRole || 'Customer'}. Switch to your Delivery Partner account to access the courier dispatch console.`
                : 'Sign in to access your courier dispatch console, manage deliveries, and view earnings.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            {/* Primary: Sign In to Rider Console */}
            <Link
              href="/delivery/login"
              className="bg-primary hover:bg-primary-accent text-gray-950 font-black text-xs px-6 py-3.5 rounded-2xl block w-full text-center transition-all shadow-glow cursor-pointer"
            >
              Sign In as Delivery Partner
            </Link>

            {/* Join Fleet */}
            <Link
              href="/delivery/register"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs px-6 py-3 rounded-2xl block w-full text-center transition-all"
            >
              Join Delivery Fleet (Register)
            </Link>

            {/* Back to Marketplace */}
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-300 text-[11px] block text-center pt-1"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeTask = (customActiveTaskId && orders.find(o => o.id === customActiveTaskId))
    || dashboardData?.activeDelivery
    || orders.find(o => ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'ASSIGNED'].includes(o.status))
    || null;
  const stats = dashboardData?.stats || {
    todayDeliveries: 0,
    todayEarnings: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    availableBalance: 0,
    cashInHand: 0
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col pb-20 sm:pb-6">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-gray-900 text-lg shadow-glow">
            <Bike size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              Zibonbaba Express
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
                RIDER
              </span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium">Zone: {dashboardData?.profile?.preferredZone || 'Dhaka Central'}</p>
          </div>
        </div>

        {/* Online / Offline Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleOnline}
            disabled={isTogglingOnline}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black border transition-all cursor-pointer ${
              isOnline
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-glow'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>

          <Link
            href="/delivery/profile"
            className="text-gray-400 hover:text-primary p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            title="Full Profile Center & Settings"
          >
            <User size={16} />
          </Link>

          <button
            onClick={() => { logout(); router.push('/delivery/login'); }}
            className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4">
        {/* Notifications */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} /> <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400"><X size={14} /></button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} /> <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-rose-400"><X size={14} /></button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/80 border border-white/10 p-3 rounded-2xl text-center">
            <span className="text-[9px] font-bold text-gray-400 uppercase block">Today Done</span>
            <span className="text-lg font-black text-white">{stats.todayDeliveries} Drops</span>
          </div>

          <div className="bg-gray-900/80 border border-white/10 p-3 rounded-2xl text-center">
            <span className="text-[9px] font-bold text-emerald-400 uppercase block">Today Earned</span>
            <span className="text-lg font-black text-emerald-400">৳{stats.todayEarnings}</span>
          </div>

          <div className="bg-gray-900/80 border border-white/10 p-3 rounded-2xl text-center">
            <span className="text-[9px] font-bold text-amber-400 uppercase block">Cash in Hand</span>
            <span className="text-lg font-black text-amber-400">৳{stats.cashInHand}</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ACTIVE TASK (RIDER WORKFLOW) */}
        {/* ======================================================== */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeTask ? (
              <div className="bg-gray-900 border-2 border-primary/40 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary text-gray-950 uppercase shadow-glow">
                      Active Assignment
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-300">
                      #{activeTask.orderId.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-400">
                    +৳{activeTask.deliveryFee} Fee
                  </span>
                </div>

                {/* Progress Stepper */}
                <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-bold text-gray-400">
                  {[
                    { key: 'ASSIGNED', label: '1. Assigned' },
                    { key: 'ACCEPTED', label: '2. Accepted' },
                    { key: 'PICKED_UP', label: '3. Picked Up' },
                    { key: 'DELIVERED', label: '4. Delivered' }
                  ].map((step, idx) => {
                    const isCompleted = (
                      (step.key === 'ASSIGNED') ||
                      (step.key === 'ACCEPTED' && ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(activeTask.status)) ||
                      (step.key === 'PICKED_UP' && ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(activeTask.status)) ||
                      (step.key === 'DELIVERED' && activeTask.status === 'DELIVERED')
                    );
                    const isCurrent = activeTask.status === step.key || (step.key === 'PICKED_UP' && activeTask.status === 'IN_TRANSIT');

                    return (
                      <div key={idx} className="space-y-1">
                        <div className={`h-1.5 rounded-full transition-all ${
                          isCompleted ? 'bg-primary' : 'bg-white/10'
                        } ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-gray-900' : ''}`} />
                        <span className={isCompleted ? 'text-white' : 'text-gray-500'}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Customer & Location Details */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-black text-white">{activeTask.customerName}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-mono">
                        <Phone size={12} className="text-primary" /> {activeTask.customerPhone}
                      </p>
                    </div>

                    <a
                      href={`tel:${activeTask.customerPhone}`}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-glow"
                    >
                      <Phone size={14} /> Call Customer
                    </a>
                  </div>

                  {/* Delivery Address & Navigation */}
                  <div className="pt-3 border-t border-white/5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-200">{activeTask.address}</p>
                        <p className="text-[10px] text-gray-500">{activeTask.upazila ? `${activeTask.upazila}, ` : ''}{activeTask.district}</p>
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeTask.address + ', ' + activeTask.district + ', Bangladesh')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0"
                    >
                      <Navigation size={14} /> Maps
                    </a>
                  </div>

                  {/* Items & COD Collection Info */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Package Items</span>
                      <span className="text-gray-200 font-medium">{activeTask.itemsSummary}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-400 uppercase font-bold block">COD Amount to Collect</span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        ৳{activeTask.codAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="space-y-2 pt-1">
                  {activeTask.status === 'ASSIGNED' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleTaskTransition(activeTask, 'REJECTED')}
                        disabled={actionLoading}
                        className="bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 font-bold py-3.5 rounded-2xl text-xs transition-colors cursor-pointer"
                      >
                        Decline Task
                      </button>
                      <button
                        onClick={() => handleTaskTransition(activeTask, 'ACCEPTED')}
                        disabled={actionLoading}
                        className="bg-primary hover:bg-primary-accent text-gray-950 font-black py-3.5 rounded-2xl text-xs transition-all shadow-glow cursor-pointer"
                      >
                        Accept Assignment
                      </button>
                    </div>
                  )}

                  {activeTask.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleTaskTransition(activeTask, 'PICKED_UP')}
                      disabled={actionLoading}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-gray-950 font-black py-4 rounded-2xl text-sm transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Package size={18} /> Confirm Picked Up from Seller / Hub
                    </button>
                  )}

                  {activeTask.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleTaskTransition(activeTask, 'IN_TRANSIT')}
                      disabled={actionLoading}
                      className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Navigation size={18} /> Start Transit / On The Way to Customer
                    </button>
                  )}

                  {activeTask.status === 'IN_TRANSIT' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedTaskForAction(activeTask);
                          setIsOtpModalOpen(true);
                        }}
                        className="w-full bg-emerald-400 hover:bg-emerald-300 text-gray-950 font-black py-4 rounded-2xl text-sm transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 size={18} /> Enter Customer OTP & Complete Delivery
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTaskForAction(activeTask);
                          setIsFailedModalOpen(true);
                        }}
                        className="w-full bg-white/5 hover:bg-red-500/10 border border-white/5 text-gray-400 hover:text-red-400 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Report Delivery Issue / Unreachable Customer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* No Active Task */
              <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                  <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">No Active Delivery Task</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    {isOnline
                      ? 'You are online and active in the dispatch queue. You will receive an instant notification when a shipment is assigned.'
                      : 'You are currently offline. Switch your status to Online to start receiving shipment assignments.'}
                  </p>
                </div>

                {!isOnline && (
                  <button
                    onClick={handleToggleOnline}
                    className="bg-primary hover:bg-primary-accent text-gray-950 font-black text-xs px-6 py-3 rounded-2xl transition-all shadow-glow cursor-pointer inline-flex items-center gap-2"
                  >
                    <Power size={15} /> Go Online Now
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ASSIGNED DELIVERIES QUEUE */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter Sub-tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { key: 'ALL', label: 'All Tasks' },
                { key: 'NEW', label: 'New (Assigned)' },
                { key: 'ACCEPTED', label: 'Accepted' },
                { key: 'PICKUP', label: 'Picked Up' },
                { key: 'IN_TRANSIT', label: 'In Transit' },
                { key: 'DELIVERED', label: 'Delivered' },
                { key: 'FAILED', label: 'Issues / Failed' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setOrderFilterTab(tab.key)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer ${
                    orderFilterTab === tab.key
                      ? 'bg-primary text-gray-950 border-primary font-black shadow-glow'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-gray-900/90 border border-white/10 hover:border-primary/40 rounded-2xl p-4 sm:p-5 space-y-3.5 transition-all shadow-lg"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-white">
                          #{ord.orderId.slice(0, 8).toUpperCase()}
                        </span>
                        {ord.storeName && (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 font-medium flex items-center gap-1">
                            <Store size={10} className="text-primary" /> {ord.storeName}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-gray-100 mt-1">{ord.customerName}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <a
                          href={`tel:${ord.customerPhone}`}
                          className="flex items-center gap-1 text-primary hover:underline font-mono"
                        >
                          <Phone size={12} /> {ord.customerPhone}
                        </a>
                        {ord.altPhone && (
                          <a
                            href={`tel:${ord.altPhone}`}
                            className="flex items-center gap-1 text-gray-400 hover:underline font-mono"
                          >
                            Alt: {ord.altPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shrink-0 ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : ord.status === 'IN_TRANSIT'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : ord.status === 'PICKED_UP'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : ord.status === 'ACCEPTED'
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                        : ord.status === 'FAILED'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-primary/10 border-primary/30 text-primary'
                    }`}>
                      {ord.status}
                    </span>
                  </div>

                  {/* Delivery Location & Items Preview */}
                  <div className="text-xs text-gray-300 space-y-1.5 pt-2.5 border-t border-white/5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5 flex-1 min-w-0">
                        <MapPin size={14} className="text-rose-400 shrink-0 mt-0.5" />
                        <span className="truncate text-gray-300 text-xs">
                          {ord.address}{ord.district ? `, ${ord.district}` : ''}
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ord.address + ', ' + (ord.district || 'Dhaka') + ', Bangladesh')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-bold text-[11px] flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20"
                      >
                        <Navigation size={11} /> Maps
                      </a>
                    </div>

                    {ord.items && ord.items.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Package size={12} className="text-gray-500 shrink-0" />
                        <span className="truncate">
                          {ord.items.map((it: any) => `${it.quantity}x ${it.name}`).join(' • ')}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 font-mono text-xs">
                      <span className="text-gray-400">
                        COD to Collect: <b className="text-amber-400 font-bold">৳{ord.codAmount.toLocaleString()}</b>
                      </span>
                      <span className="text-gray-400">
                        Rider Fee: <b className="text-emerald-400 font-bold">+৳{ord.deliveryFee}</b>
                      </span>
                    </div>
                  </div>

                  {/* Direct Action Bar */}
                  <div className="pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTaskDetail(ord);
                        setIsTaskDetailModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={14} /> Full Details
                    </button>

                    <div className="flex items-center gap-2">
                      {ord.status === 'ASSIGNED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleTaskTransition(ord, 'REJECTED')}
                            disabled={actionLoading}
                            className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTaskTransition(ord, 'ACCEPTED')}
                            disabled={actionLoading}
                            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black transition-all shadow-glow cursor-pointer"
                          >
                            Accept Task
                          </button>
                        </>
                      )}

                      {ord.status === 'ACCEPTED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomActiveTaskId(ord.id);
                              setActiveTab('active');
                            }}
                            className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold"
                          >
                            Set Active
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTaskTransition(ord, 'PICKED_UP')}
                            disabled={actionLoading}
                            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-black transition-all shadow-glow flex items-center gap-1.5 cursor-pointer"
                          >
                            <Package size={14} /> Confirm Picked Up
                          </button>
                        </>
                      )}

                      {ord.status === 'PICKED_UP' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomActiveTaskId(ord.id);
                              setActiveTab('active');
                            }}
                            className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold"
                          >
                            Set Active
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTaskTransition(ord, 'IN_TRANSIT')}
                            disabled={actionLoading}
                            className="px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-black transition-all shadow-glow flex items-center gap-1.5 cursor-pointer"
                          >
                            <Navigation size={14} /> Start Transit
                          </button>
                        </>
                      )}

                      {ord.status === 'IN_TRANSIT' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTaskForAction(ord);
                              setIsFailedModalOpen(true);
                            }}
                            className="px-2.5 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold cursor-pointer"
                          >
                            Issue
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTaskForAction(ord);
                              setIsOtpModalOpen(true);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-gray-950 text-xs font-black transition-all shadow-glow flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 size={14} /> Deliver (OTP)
                          </button>
                        </>
                      )}

                      {ord.status === 'DELIVERED' && (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-black text-xs flex items-center gap-1">
                          <Check size={14} /> Completed
                        </span>
                      )}

                      {ord.status === 'FAILED' && (
                        <button
                          type="button"
                          onClick={() => handleTaskTransition(ord, 'IN_TRANSIT')}
                          disabled={actionLoading}
                          className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-gray-950 text-xs font-black transition-all cursor-pointer"
                        >
                          Retry Delivery
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-12 bg-gray-900/40 rounded-3xl border border-white/5 space-y-2">
                  <Package className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400 font-bold">No delivery tasks found in this filter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: EARNINGS & WALLET */}
        {/* ======================================================== */}
        {activeTab === 'earnings' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/60 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Wallet Balance</span>
                  <p className="text-3xl font-black text-amber-400 mt-1">৳{(earningsData?.earnings?.availableBalance || 0).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="bg-primary hover:bg-primary-accent text-gray-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-glow cursor-pointer"
                >
                  Withdraw Money
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">This Week</span>
                  <span className="font-bold text-white">৳{earningsData?.earnings?.thisWeek || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">This Month</span>
                  <span className="font-bold text-white">৳{earningsData?.earnings?.thisMonth || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">All Time</span>
                  <span className="font-black text-emerald-400">৳{earningsData?.earnings?.totalEarnings || 0}</span>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Earnings & Payout Ledger</h3>
              <div className="space-y-2">
                {earningsData?.transactions?.map((tx: any) => (
                  <div key={tx.id} className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{tx.description}</p>
                      <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-mono font-black ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                {(!earningsData?.transactions || earningsData.transactions.length === 0) && (
                  <p className="text-xs text-gray-500 text-center py-6">No wallet transactions recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: RIDER FLEET PROFILE CONSOLE */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* 1. Hero Identity & Status Card */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-950 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Rider Avatar with Tier Badge */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center font-black text-gray-950 text-2xl shadow-glow">
                      {(profileData?.user?.fullName || username || 'R').charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-950 flex items-center justify-center text-white" title="Verified Rider">
                      <Check size={11} className="stroke-[3]" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {profileData?.user?.fullName || username || 'Express Fleet Rider'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-black uppercase">
                        {profileData?.deliveryProfile?.status || 'APPROVED'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-0.5">
                      ID: <span className="font-mono text-gray-300 font-bold">DM-{profileData?.user?.phone || '88017777777'}</span> • <span className="text-primary font-semibold">Express Fleet Courier</span>
                    </p>

                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-primary" />
                      <span>{profileData?.deliveryProfile?.preferredZone || 'Dhaka Central (Gulshan - Banani)'}</span>
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/delivery/profile"
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-primary text-black text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-lg hover:bg-amber-400 cursor-pointer"
                  >
                    <User size={13} /> Full Profile Center →
                  </Link>

                  <button
                    type="button"
                    onClick={openEditProfileModal}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 size={13} className="text-primary" /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleOnline}
                    disabled={isTogglingOnline}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-glow cursor-pointer disabled:opacity-50 ${
                      isOnline
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400'
                    }`}
                  >
                    <Power size={13} className={isOnline ? 'text-emerald-400' : 'text-gray-400'} />
                    {isOnline ? 'Online (Duty)' : 'Go Online'}
                  </button>
                </div>
              </div>

              {/* 2. Key Performance Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10 font-mono text-xs">
                <div className="p-3 bg-white/5 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-sans uppercase font-bold block">Total Deliveries</span>
                  <span className="text-base font-black text-white mt-0.5 block">
                    {profileData?.deliveryProfile?.completedDeliveries ?? stats.completedDeliveries ?? 0}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-sans">98.5% Success</span>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-sans uppercase font-bold block">Rider Rating</span>
                  <div className="flex items-center gap-1 text-base font-black text-amber-400 mt-0.5">
                    <Star size={14} className="fill-amber-400" /> 4.9 <span className="text-[10px] text-gray-500 font-sans font-normal">/ 5.0</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-sans">Top Tier Rider</span>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl">
                  <span className="text-[10px] text-amber-400 font-sans uppercase font-bold block">Cash in Hand (COD)</span>
                  <span className="text-base font-black text-amber-400 mt-0.5 block">
                    ৳{(profileData?.deliveryProfile?.cashInHand ?? stats.cashInHand ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 font-sans">To Deposit</span>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl">
                  <span className="text-[10px] text-emerald-400 font-sans uppercase font-bold block">Wallet Balance</span>
                  <span className="text-base font-black text-emerald-400 mt-0.5 block">
                    ৳{(profileData?.user?.walletBalance ?? earningsData?.earnings?.availableBalance ?? stats.availableBalance ?? 0).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('earnings')}
                    className="text-[10px] text-primary hover:underline font-sans font-bold block"
                  >
                    Withdraw Funds →
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Personal & Contact Information */}
            <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <User size={14} className="text-primary" /> Personal & Contact Details
                </h4>
                <button
                  type="button"
                  onClick={openEditProfileModal}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Full Name</span>
                  <span className="font-bold text-white mt-0.5 block">
                    {profileData?.user?.fullName || username || 'Not Specified'}
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Primary Mobile Phone</span>
                  <span className="font-mono font-bold text-white mt-0.5 block">
                    {profileData?.user?.phone || 'Not Specified'}
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Registered Email</span>
                  <span className="font-mono text-gray-300 mt-0.5 block">
                    {profileData?.user?.email || 'courier@zibonbaba.com'}
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Emergency Contact</span>
                    <span className="font-mono font-bold text-gray-200 mt-0.5 block">
                      {profileData?.deliveryProfile?.emergencyContact || 'Not Set'}
                    </span>
                  </div>
                  {profileData?.deliveryProfile?.emergencyContact && (
                    <a
                      href={`tel:${profileData.deliveryProfile.emergencyContact}`}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Call Emergency Contact"
                    >
                      <Phone size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Vehicle & Equipment Details */}
            <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Bike size={14} className="text-primary" /> Vehicle & Equipment
                </h4>
                <button
                  type="button"
                  onClick={openEditProfileModal}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Vehicle Type</span>
                  <div className="flex items-center gap-1.5 font-bold text-white mt-0.5">
                    <Bike size={14} className="text-primary" />
                    <span>{profileData?.deliveryProfile?.vehicleType || 'MOTORCYCLE / BIKE'}</span>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Vehicle Plate Number</span>
                  <span className="font-mono font-bold text-amber-300 mt-0.5 block">
                    {profileData?.deliveryProfile?.vehicleNumber || 'DHAKA METRO-HA-12-3456'}
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Driving License No.</span>
                  <span className="font-mono text-gray-300 mt-0.5 block">
                    {profileData?.deliveryProfile?.drivingLicense || 'DL-8802938192'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-400">
                <ShieldCheck size={18} className="shrink-0" />
                <span>Rider safety kit active: Approved helmet and insulated temperature-control delivery bag verified.</span>
              </div>
            </div>

            {/* 5. Operating Territory & Dispatch Zones */}
            <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Compass size={14} className="text-primary" /> Operating Territory & Hub
                </h4>
                <button
                  type="button"
                  onClick={openEditProfileModal}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Division & District</span>
                  <span className="font-bold text-white mt-0.5 block">
                    {profileData?.deliveryProfile?.district || 'Dhaka'}, {profileData?.deliveryProfile?.division || 'Dhaka'}
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Upazila / Coverage Area</span>
                  <span className="font-bold text-white mt-0.5 block">
                    {profileData?.deliveryProfile?.upazila || 'Gulshan / Banani / Baridhara'}
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Assigned Dispatch Hub</span>
                  <span className="font-bold text-primary mt-0.5 block">
                    {dashboardData?.profile?.stationedHub
                      ? `${dashboardData.profile.stationedHub.name} (${dashboardData.profile.stationedHub.code})`
                      : 'Dhaka Central Hub (HUB-DHK-01)'}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Identity & Compliance */}
            <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                <FileText size={14} className="text-primary" /> Identity & Verification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">National ID (NID)</span>
                  <span className="font-mono font-bold text-gray-200 mt-0.5 block">
                    {profileData?.deliveryProfile?.nidNumber || '19942691234567890'}
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Background Check</span>
                    <span className="text-emerald-400 font-bold mt-0.5 block flex items-center gap-1">
                      <CheckCircle2 size={13} /> Verified by Operations Team
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">KYC Level 2</span>
                </div>
              </div>
            </div>

            {/* 7. Sign Out */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('zibonbaba_token');
                    localStorage.removeItem('zibonbaba_user');
                    localStorage.removeItem('zibonbaba_role');
                    window.location.href = '/delivery/login';
                  } else {
                    router.push('/delivery/login');
                  }
                }}
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <LogOut size={16} /> Sign Out from Rider Account
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around">
        {[
          { id: 'active', label: 'Active Task', icon: Navigation },
          { id: 'orders', label: 'Queue', icon: Package },
          { id: 'earnings', label: 'Earnings', icon: Wallet },
          { id: 'profile', label: 'Profile', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as DeliveryTab);
                setSuccessMsg('');
                setErrorMsg('');
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-primary font-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-primary' : ''} />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ======================================================== */}
      {/* MODAL 1: OTP VERIFICATION & COMPLETE DELIVERY */}
      {/* ======================================================== */}
      {isOtpModalOpen && selectedTaskForAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">Complete Delivery</h3>
              <button onClick={() => setIsOtpModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Ask customer <b className="text-white">{selectedTaskForAction.customerName}</b> for the 4-digit verification code sent to their phone.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Customer Delivery OTP *</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 4829"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {selectedTaskForAction.codAmount > 0 && (
                <label className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={codCollectedChecked}
                    onChange={(e) => setCodCollectedChecked(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                  />
                  <span>
                    Collected <b className="text-amber-400 font-mono">৳{selectedTaskForAction.codAmount.toLocaleString()}</b> COD Cash from customer
                  </span>
                </label>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Delivery Notes / Handover Details</label>
                <input
                  type="text"
                  placeholder="e.g. Handed over to recipient directly"
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold py-3 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleTaskTransition(selectedTaskForAction, 'DELIVERED', {
                  otp: otpInput.trim(),
                  proofNotes: proofNotes.trim(),
                  codCollected: codCollectedChecked
                })}
                disabled={actionLoading}
                className="flex-1 bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black py-3 rounded-xl shadow-glow cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Verifying OTP...' : 'Confirm Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: REPORT DELIVERY FAILED */}
      {/* ======================================================== */}
      {isFailedModalOpen && selectedTaskForAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-rose-400">Report Delivery Issue</h3>
              <button onClick={() => setIsFailedModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Reason for Failure *</label>
                <select
                  value={failedReasonInput}
                  onChange={(e) => setFailedReasonInput(e.target.value)}
                  className="w-full bg-gray-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                >
                  <option value="Customer unavailable / phone unreachable">Customer unavailable / phone unreachable</option>
                  <option value="Customer refused package / canceled order">Customer refused package / canceled order</option>
                  <option value="Incorrect address / location not found">Incorrect address / location not found</option>
                  <option value="Damaged package during transit">Damaged package during transit</option>
                  <option value="Customer requested delivery reschedule">Customer requested delivery reschedule</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFailedModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold py-3 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleTaskTransition(selectedTaskForAction, 'FAILED', {
                  failedReason: failedReasonInput
                })}
                disabled={actionLoading}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white text-xs font-black py-3 rounded-xl shadow-glow cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Submitting...' : 'Submit Issue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: WITHDRAWAL REQUEST */}
      {/* ======================================================== */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">Withdraw Delivery Earnings</h3>
              <button onClick={() => setIsWithdrawModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs flex justify-between">
              <span className="text-gray-300">Available Balance:</span>
              <span className="font-black text-amber-400">৳{(earningsData?.earnings?.availableBalance || 0).toLocaleString()}</span>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Amount (৳) *</label>
                <input
                  type="number"
                  min="100"
                  max={earningsData?.earnings?.availableBalance || 999999}
                  required
                  placeholder="Min ৳100"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Payout Method *</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full bg-gray-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                >
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="01XXXXXXXXX"
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold py-3 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="flex-1 bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black py-3 rounded-xl shadow-glow cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingWithdraw ? 'Submitting...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: TASK DETAILS & LIVE STATUS UPDATE MODAL */}
      {/* ======================================================== */}
      {isTaskDetailModalOpen && selectedTaskDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-white/15 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-white">
                    #{selectedTaskDetail.orderId.slice(0, 8).toUpperCase()}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                    selectedTaskDetail.status === 'DELIVERED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : selectedTaskDetail.status === 'IN_TRANSIT'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : selectedTaskDetail.status === 'PICKED_UP'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : selectedTaskDetail.status === 'ACCEPTED'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                      : selectedTaskDetail.status === 'FAILED'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-primary/10 border-primary/30 text-primary'
                  }`}>
                    {selectedTaskDetail.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Assigned on: {new Date(selectedTaskDetail.assignedAt).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsTaskDetailModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Recipient Details */}
            <div className="p-3.5 bg-white/5 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Delivery Recipient</span>
                  <h4 className="font-black text-white text-sm mt-0.5">{selectedTaskDetail.customerName}</h4>
                  <p className="text-gray-300 font-mono text-xs mt-0.5">{selectedTaskDetail.customerPhone}</p>
                  {selectedTaskDetail.altPhone && (
                    <p className="text-gray-400 font-mono text-[11px]">Alt: {selectedTaskDetail.altPhone}</p>
                  )}
                </div>

                <a
                  href={`tel:${selectedTaskDetail.customerPhone}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-black text-xs flex items-center gap-1.5 shadow-glow"
                >
                  <Phone size={13} /> Call Customer
                </a>
              </div>

              {/* Delivery Address */}
              <div className="pt-2 border-t border-white/5 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-200 font-medium leading-snug">{selectedTaskDetail.address}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {selectedTaskDetail.upazila ? `${selectedTaskDetail.upazila}, ` : ''}{selectedTaskDetail.district || 'Dhaka'}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedTaskDetail.address + ', ' + (selectedTaskDetail.district || 'Dhaka') + ', Bangladesh')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400 font-bold text-xs flex items-center gap-1 shrink-0"
                >
                  <Navigation size={12} /> Maps
                </a>
              </div>
            </div>

            {/* Merchant / Store Origin */}
            {selectedTaskDetail.storeName && (
              <div className="p-3 bg-white/5 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Store size={15} className="text-primary" />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Pickup Merchant</span>
                    <span className="font-bold text-gray-200">{selectedTaskDetail.storeName}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-[10px]">
                  Dispatch Hub
                </span>
              </div>
            )}

            {/* Package Items Breakdown */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                Package Contents ({selectedTaskDetail.items?.length || 0} items)
              </span>
              <div className="bg-gray-950/60 border border-white/5 rounded-2xl p-3 max-h-36 overflow-y-auto space-y-2 text-xs">
                {selectedTaskDetail.items?.map((it: any) => (
                  <div key={it.id} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                    <div>
                      <p className="font-bold text-gray-200">{it.name}</p>
                      <span className="font-mono text-[10px] text-gray-500">SKU: {it.sku}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-white">{it.quantity}x</span>
                      <span className="text-gray-400 text-[10px] block">৳{it.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {(!selectedTaskDetail.items || selectedTaskDetail.items.length === 0) && (
                  <p className="text-xs text-gray-500 text-center py-2">General Parcel Package</p>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-2xl text-xs font-mono">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Cash to Collect (COD)</span>
                <span className="text-base font-black text-amber-400">
                  ৳{selectedTaskDetail.codAmount.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Your Delivery Fee</span>
                <span className="text-base font-black text-emerald-400">
                  +৳{selectedTaskDetail.deliveryFee}
                </span>
              </div>
            </div>

            {/* Live Status Transition Action Buttons */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block text-center">
                Update Delivery Status
              </span>

              {selectedTaskDetail.status === 'ASSIGNED' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleTaskTransition(selectedTaskDetail, 'REJECTED');
                      setIsTaskDetailModalOpen(false);
                    }}
                    disabled={actionLoading}
                    className="py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Decline Task
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleTaskTransition(selectedTaskDetail, 'ACCEPTED');
                      setIsTaskDetailModalOpen(false);
                    }}
                    disabled={actionLoading}
                    className="py-3 rounded-xl bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black shadow-glow cursor-pointer"
                  >
                    Accept Assignment
                  </button>
                </div>
              )}

              {selectedTaskDetail.status === 'ACCEPTED' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleTaskTransition(selectedTaskDetail, 'PICKED_UP');
                      setIsTaskDetailModalOpen(false);
                    }}
                    disabled={actionLoading}
                    className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-black shadow-glow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Package size={15} /> Confirm Picked Up from Store / Hub
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomActiveTaskId(selectedTaskDetail.id);
                      setIsTaskDetailModalOpen(false);
                      setActiveTab('active');
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
                  >
                    Focus as Active Task in Dashboard
                  </button>
                </div>
              )}

              {selectedTaskDetail.status === 'PICKED_UP' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleTaskTransition(selectedTaskDetail, 'IN_TRANSIT');
                      setIsTaskDetailModalOpen(false);
                    }}
                    disabled={actionLoading}
                    className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-black shadow-glow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Navigation size={15} /> Start Transit / On The Way
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomActiveTaskId(selectedTaskDetail.id);
                      setIsTaskDetailModalOpen(false);
                      setActiveTab('active');
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
                  >
                    Focus as Active Task in Dashboard
                  </button>
                </div>
              )}

              {selectedTaskDetail.status === 'IN_TRANSIT' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTaskForAction(selectedTaskDetail);
                      setIsTaskDetailModalOpen(false);
                      setIsOtpModalOpen(true);
                    }}
                    className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-gray-950 text-xs font-black shadow-glow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={16} /> Enter Customer OTP & Complete Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTaskForAction(selectedTaskDetail);
                      setIsTaskDetailModalOpen(false);
                      setIsFailedModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold cursor-pointer"
                  >
                    Report Delivery Issue / Unreachable Customer
                  </button>
                </div>
              )}

              {selectedTaskDetail.status === 'DELIVERED' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-400 font-bold">
                  ✓ Order has been successfully delivered and fee ৳{selectedTaskDetail.deliveryFee} credited to your wallet.
                </div>
              )}

              {selectedTaskDetail.status === 'FAILED' && (
                <button
                  type="button"
                  onClick={() => {
                    handleTaskTransition(selectedTaskDetail, 'IN_TRANSIT');
                    setIsTaskDetailModalOpen(false);
                  }}
                  disabled={actionLoading}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-black shadow-glow cursor-pointer"
                >
                  Retry Delivery Attempt
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: EDIT RIDER FLEET PROFILE MODAL */}
      {/* ======================================================== */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Edit Courier Fleet Profile</h3>
                  <p className="text-[11px] text-gray-400">Update your identity, vehicle, license, and operating territory.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
              {/* Section 1: Personal Info */}
              <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <h4 className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <User size={13} /> 1. Personal & Contact Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(e.target.value)}
                      required
                      placeholder="e.g. Sabbir Ahmed"
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Primary Mobile Phone *</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      required
                      placeholder="e.g. 01777777777"
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Emergency Contact Number</label>
                  <input
                    type="tel"
                    value={profileEmergencyContact}
                    onChange={(e) => setProfileEmergencyContact(e.target.value)}
                    placeholder="e.g. 01888888888 (Parent / Spouse)"
                    className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono text-xs"
                  />
                </div>
              </div>

              {/* Section 2: Vehicle & Logistics Fleet */}
              <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <h4 className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Bike size={13} /> 2. Vehicle & Driving Credentials
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Vehicle Type *</label>
                    <select
                      value={profileVehicleType}
                      onChange={(e) => setProfileVehicleType(e.target.value)}
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-primary text-xs"
                    >
                      <option value="BIKE">Motorcycle / Bike</option>
                      <option value="BICYCLE">Bicycle</option>
                      <option value="SCOOTER">Electric Scooter</option>
                      <option value="VAN">Delivery Van / Pickup</option>
                      <option value="ON_FOOT">Walker / On Foot</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Vehicle Plate / Reg. No.</label>
                    <input
                      type="text"
                      value={profileVehicleNumber}
                      onChange={(e) => setProfileVehicleNumber(e.target.value)}
                      placeholder="e.g. DHAKA METRO-HA-12-3456"
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Driving License Number</label>
                  <input
                    type="text"
                    value={profileDrivingLicense}
                    onChange={(e) => setProfileDrivingLicense(e.target.value)}
                    placeholder="e.g. DL-8802938192"
                    className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono text-xs"
                  />
                </div>
              </div>

              {/* Section 3: Identity & Operating Zone */}
              <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <h4 className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={13} /> 3. Identity & Operating Territory
                </h4>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">National ID (NID) Number</label>
                  <input
                    type="text"
                    value={profileNidNumber}
                    onChange={(e) => setProfileNidNumber(e.target.value)}
                    placeholder="e.g. 19942691234567890"
                    className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Division</label>
                    <select
                      value={profileDivision}
                      onChange={(e) => setProfileDivision(e.target.value)}
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-primary text-xs"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chattogram">Chattogram</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Barishal">Barishal</option>
                      <option value="Rangpur">Rangpur</option>
                      <option value="Mymensingh">Mymensingh</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">District</label>
                    <input
                      type="text"
                      value={profileDistrict}
                      onChange={(e) => setProfileDistrict(e.target.value)}
                      placeholder="e.g. Dhaka"
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Upazila / Thana</label>
                    <input
                      type="text"
                      value={profileUpazila}
                      onChange={(e) => setProfileUpazila(e.target.value)}
                      placeholder="e.g. Gulshan / Banani"
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Preferred Dispatch Zone</label>
                    <input
                      type="text"
                      value={profilePreferredZone}
                      onChange={(e) => setProfilePreferredZone(e.target.value)}
                      placeholder="e.g. Dhaka Central (Zone A)"
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-accent text-gray-950 font-black shadow-glow transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
