'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bike, User, MapPin, Phone, Mail, ShieldCheck, AlertCircle, CheckCircle2,
  Calendar, Clock, DollarSign, Wallet, ArrowLeft, Camera, Edit3, Save, X,
  Check, Lock, Bell, ChevronRight, Award, Star, ExternalLink, RefreshCw,
  LogOut, ShieldAlert, FileText, Compass, Truck, KeyRound, AlertTriangle,
  History, Eye, Sparkles
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const BANGLADESH_DIVISIONS = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'
];

const VEHICLE_TYPES = [
  { id: 'MOTORCYCLE', label: 'Motorcycle' },
  { id: 'BIKE', label: 'Bicycle / Cycle' },
  { id: 'SCOOTER', label: 'Electric Scooter' },
  { id: 'VAN', label: 'Delivery Van' },
  { id: 'CAR', label: 'Car / Microbus' },
  { id: 'RICKSHAW', label: 'Cargo Rickshaw' },
  { id: 'ON_FOOT', label: 'On Foot / Walker' },
  { id: 'OTHER', label: 'Other Vehicle' }
];

export default function DeliveryProfilePage() {
  const router = useRouter();
  const { isLoggedIn, role, username, logout } = useStore();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Active editing section: null | 'personal' | 'address' | 'vehicle'
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Success and Error feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editable Form States: Personal Information
  const [formFullName, setFormFullName] = useState('');
  const [formDateOfBirth, setFormDateOfBirth] = useState('');
  const [formGender, setFormGender] = useState('MALE');
  const [formEmergencyContact, setFormEmergencyContact] = useState('');

  // Editable Form States: Address Information
  const [formDivision, setFormDivision] = useState('Dhaka');
  const [formDistrict, setFormDistrict] = useState('Dhaka');
  const [formUpazila, setFormUpazila] = useState('');
  const [formUnionWard, setFormUnionWard] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formFullAddress, setFormFullAddress] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');

  // Editable Form States: Vehicle Information
  const [formVehicleType, setFormVehicleType] = useState('MOTORCYCLE');
  const [formVehicleModel, setFormVehicleModel] = useState('');
  const [formVehicleNumber, setFormVehicleNumber] = useState('');
  const [formVehicleColor, setFormVehicleColor] = useState('');
  const [formVehicleOwnership, setFormVehicleOwnership] = useState('OWNED');
  const [formDrivingLicense, setFormDrivingLicense] = useState('');
  const [formLicenseStatus, setFormLicenseStatus] = useState('ACTIVE');

  // Photo Upload State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contact Change (Phone/Email with OTP) Modal
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalType, setContactModalType] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [newContactValue, setNewContactValue] = useState('');
  const [contactOtpInput, setContactOtpInput] = useState('');
  const [contactStep, setContactStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactFeedback, setContactFeedback] = useState('');

  // Availability Toggling State
  const [isTogglingAvail, setIsTogglingAvail] = useState(false);

  // Delivery History Modal / Expanded view
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('ALL');

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

  // Fetch complete profile from backend
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery/profile', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileData(data);
        populateForms(data);
      } else {
        setErrorMsg(data.error || 'Failed to load delivery profile.');
      }
    } catch (err: any) {
      setErrorMsg('Network error fetching profile details.');
    } finally {
      setLoading(false);
    }
  }, []);

  const populateForms = (data: any) => {
    const u = data.user || {};
    const dp = data.deliveryProfile || {};

    setFormFullName(u.fullName || '');
    setFormDateOfBirth(u.dateOfBirth || '');
    setFormGender(u.gender || 'MALE');
    setFormEmergencyContact(dp.emergencyContact || '');

    setFormDivision(dp.division || 'Dhaka');
    setFormDistrict(dp.district || 'Dhaka');
    setFormUpazila(dp.upazila || '');
    setFormUnionWard(dp.unionWard || '');
    setFormArea(dp.area || '');
    setFormFullAddress(dp.fullAddress || '');
    setFormPostalCode(dp.postalCode || '');

    setFormVehicleType(dp.vehicleType || 'MOTORCYCLE');
    setFormVehicleModel(dp.vehicleModel || '');
    setFormVehicleNumber(dp.vehicleNumber || '');
    setFormVehicleColor(dp.vehicleColor || '');
    setFormVehicleOwnership(dp.vehicleOwnership || 'OWNED');
    setFormDrivingLicense(dp.drivingLicense || '');
    setFormLicenseStatus(dp.licenseStatus || 'ACTIVE');
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Real-time synchronization listener
  useEffect(() => {
    const handleSync = () => {
      fetchProfile();
    };

    window.addEventListener('zibonbaba:delivery-sync', handleSync);
    window.addEventListener('zibonbaba:sync', handleSync);

    return () => {
      window.removeEventListener('zibonbaba:delivery-sync', handleSync);
      window.removeEventListener('zibonbaba:sync', handleSync);
    };
  }, [fetchProfile]);

  // Handle Availability Toggle (Available ↔ Offline)
  const handleToggleAvailability = async () => {
    if (!profileData) return;
    const currentOnline = profileData.deliveryProfile?.isOnline ?? false;
    const targetOnline = !currentOnline;

    setIsTogglingAvail(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/delivery/availability', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isOnline: targetOnline })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update availability.');
      }

      setProfileData((prev: any) => ({
        ...prev,
        deliveryProfile: {
          ...prev.deliveryProfile,
          isOnline: data.isOnline,
          availabilityStatus: data.availabilityStatus
        }
      }));
      setSuccessMsg(`Status switched to ${data.isOnline ? 'Available (Online)' : 'Offline'}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating availability.');
    } finally {
      setIsTogglingAvail(false);
    }
  };

  // Section Save: Personal Information
  const handleSavePersonal = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/delivery/profile/personal', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullName: formFullName.trim(),
          dateOfBirth: formDateOfBirth || null,
          gender: formGender,
          emergencyContact: formEmergencyContact.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save personal info.');

      setSuccessMsg('Personal information updated successfully.');
      setEditingSection(null);
      await fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update personal information.');
    } finally {
      setSaving(false);
    }
  };

  // Section Save: Address Information
  const handleSaveAddress = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/delivery/profile/address', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          division: formDivision,
          district: formDistrict,
          upazila: formUpazila.trim(),
          unionWard: formUnionWard.trim(),
          area: formArea.trim(),
          fullAddress: formFullAddress.trim(),
          postalCode: formPostalCode.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save address.');

      setSuccessMsg('Address information updated successfully.');
      setEditingSection(null);
      await fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update address.');
    } finally {
      setSaving(false);
    }
  };

  // Section Save: Vehicle Information
  const handleSaveVehicle = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/delivery/profile/vehicle', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          vehicleType: formVehicleType,
          vehicleModel: formVehicleModel.trim(),
          vehicleNumber: formVehicleNumber.trim(),
          vehicleColor: formVehicleColor.trim(),
          vehicleOwnership: formVehicleOwnership,
          drivingLicense: formDrivingLicense.trim(),
          licenseStatus: formLicenseStatus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save vehicle details.');

      setSuccessMsg('Vehicle details updated successfully.');
      setEditingSection(null);
      await fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update vehicle.');
    } finally {
      setSaving(false);
    }
  };

  // Photo Select & Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedPhotoFile) return;
    setIsUploadingPhoto(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('photo', selectedPhotoFile);

      const token = getAuthToken();
      const res = await fetch('/api/delivery/profile/photo', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo.');

      setSuccessMsg('Profile photo updated successfully.');
      setIsPhotoModalOpen(false);
      setSelectedPhotoFile(null);
      setPhotoPreview(null);
      await fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Photo upload failure.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;
    setIsUploadingPhoto(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/delivery/profile/photo', {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove photo.');

      setSuccessMsg('Profile photo removed.');
      setIsPhotoModalOpen(false);
      setSelectedPhotoFile(null);
      setPhotoPreview(null);
      await fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Photo removal failed.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Contact Change (Phone/Email) with OTP
  const openContactModal = (type: 'PHONE' | 'EMAIL') => {
    setContactModalType(type);
    setNewContactValue('');
    setContactOtpInput('');
    setContactStep('REQUEST');
    setContactFeedback('');
    setIsContactModalOpen(true);
  };

  const handleRequestContactOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactFeedback('');

    try {
      const res = await fetch('/api/delivery/verify/contact-change', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'request',
          type: contactModalType,
          newValue: newContactValue.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code.');

      setContactStep('VERIFY');
      setContactFeedback(data.message || 'Verification code sent.');
      if (data.sandboxOtp) {
        setContactOtpInput(data.sandboxOtp);
      }
    } catch (err: any) {
      setContactFeedback(err.message || 'Failed to request OTP.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleVerifyContactOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactFeedback('');

    try {
      const res = await fetch('/api/delivery/verify/contact-change', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'verify',
          type: contactModalType,
          otp: contactOtpInput.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP.');

      setSuccessMsg(data.message || 'Contact information updated successfully.');
      setIsContactModalOpen(false);
      await fetchProfile();
    } catch (err: any) {
      setContactFeedback(err.message || 'Invalid code.');
    } finally {
      setContactLoading(false);
    }
  };

  // Fetch Delivery History
  const fetchDeliveryHistory = async (statusFilter = 'ALL') => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/delivery/deliveries?status=${statusFilter}&limit=30`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setHistoryList(data.deliveries || []);
      }
    } catch (_) {} finally {
      setHistoryLoading(false);
    }
  };

  const openHistoryModal = () => {
    setIsHistoryModalOpen(true);
    fetchDeliveryHistory(historyFilter);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-400">Loading Delivery Partner Profile...</p>
      </div>
    );
  }

  const u = profileData?.user || {};
  const dp = profileData?.deliveryProfile || {};
  const ver = profileData?.verification || {};
  const perf = profileData?.performance || {};

  const isSuspended = u.accountStatus === 'SUSPENDED' || u.accountStatus === 'BLOCKED';
  const isOnline = dp.isOnline ?? false;
  const workStatus = dp.availabilityStatus || (isOnline ? 'ONLINE' : 'OFFLINE');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white pb-24 selection:bg-primary selection:text-black">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/delivery"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Return to Delivery Dashboard"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Delivery Profile <span className="text-primary font-mono text-xs">● Master Hub</span>
              </h1>
              <p className="text-[11px] text-gray-400">Single Source of Truth for Logistics Personnel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProfile}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Refresh Profile State"
            >
              <RefreshCw size={16} />
            </button>
            <Link
              href="/delivery/settings/notifications"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Notification Preferences"
            >
              <Bell size={16} />
            </Link>
            <Link
              href="/delivery/settings/security"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Security & Password Settings"
            >
              <Lock size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Banner Feedback Messages */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Suspended Account Alert */}
        {isSuspended && (
          <div className="p-5 rounded-3xl bg-red-950/40 border border-red-500/30 text-red-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <ShieldAlert size={20} />
              <span>Account Suspended by Operations</span>
            </div>
            <p className="text-xs text-red-300">
              Reason: <b>{u.suspendedReason || 'Administrative review in progress.'}</b>
            </p>
            <p className="text-[11px] text-red-400/80">
              You are currently restricted from accepting active deliveries. Please contact operations support to resolve.
            </p>
          </div>
        )}

        {/* ================================================================ */}
        {/* 1. MASTER PROFILE HEADER CARD */}
        {/* ================================================================ */}
        <section className="bg-gray-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar with Upload Action */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-primary/30 to-amber-500/20 border-2 border-primary/40 p-1 flex items-center justify-center overflow-hidden shadow-xl">
                {u.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.avatar}
                    alt={u.fullName || 'Rider Avatar'}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 rounded-2xl flex items-center justify-center font-black text-3xl text-primary font-mono">
                    {(u.fullName || 'Rider')[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-primary text-black hover:bg-amber-400 shadow-lg transition-transform active:scale-95 cursor-pointer font-bold"
                title="Change Profile Photo"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Profile Core Details */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 font-mono">
                  Delivery Man
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-white/10 text-gray-300 font-mono">
                  ID: {profileData?.deliveryManId || 'DM-000124'}
                </span>
                {ver.status === 'VERIFIED' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Verified Partner
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Clock size={11} /> KYC: {ver.status}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {u.fullName || 'Delivery Partner'}
              </h2>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-gray-300 font-medium">
                <span className="flex items-center gap-1 font-mono">
                  <Phone size={13} className="text-primary" /> {u.phone || 'N/A'}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Mail size={13} className="text-primary" /> {u.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-gray-400" /> Joined: {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Availability Control Button */}
            <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={isTogglingAvail || isSuspended}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                } ${isSuspended ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                <span>{isTogglingAvail ? 'Updating...' : isOnline ? '● Available (Online)' : '○ Offline'}</span>
              </button>

              <span className="text-[10px] text-gray-500 font-medium">
                Work Status: <b className="text-gray-300">{workStatus}</b>
              </span>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* 2. COMPACT WALLET & EARNINGS SNAPSHOT */}
        {/* ================================================================ */}
        <section className="bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Wallet size={16} /> Delivery Partner Wallet
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                  ৳{(u.walletBalance || 0).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 font-medium">Available for Withdrawal</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center sm:text-left py-2 border-y md:border-y-0 md:border-l border-white/10 md:pl-6">
              <div>
                <span className="text-[10px] text-gray-400 uppercase block font-bold">Today</span>
                <span className="font-mono font-bold text-amber-300 text-sm">৳{perf.todayEarnings || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase block font-bold">This Month</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">৳{perf.thisMonthEarnings || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase block font-bold">Cash in Hand (COD)</span>
                <span className="font-mono font-bold text-white text-sm">৳{perf.cashInHand || 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/delivery"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-amber-400 transition-colors text-center"
              >
                Withdraw Funds
              </Link>
              <button
                type="button"
                onClick={openHistoryModal}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <History size={14} /> History
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* 3. PERFORMANCE & DISPATCH METRICS */}
        {/* ================================================================ */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Deliveries</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">{perf.totalDeliveries || 0}</span>
              <span className="text-[10px] text-emerald-400 font-bold">{perf.completionRate || 100}% Done</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Completed Successfully</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-mono">{perf.completedDeliveries || 0}</span>
              <span className="text-[10px] text-gray-400 font-medium">Orders</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Avg Delivery Time</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-300 font-mono">{perf.averageDeliveryTime || 32}</span>
              <span className="text-[10px] text-gray-400 font-medium">Mins</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Customer Rating</span>
            <div className="flex items-center gap-1.5 text-amber-400">
              <Star size={18} fill="#F59E0B" />
              <span className="text-2xl font-black text-white font-mono">{perf.customerRating || 4.9}</span>
              <span className="text-[10px] text-gray-400 font-medium">/ 5.0</span>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* 4. SECTIONED PROFILE CARDS */}
        {/* ================================================================ */}

        {/* --- SECTION A: PERSONAL INFORMATION --- */}
        <section className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <User size={18} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Personal Information</h3>
            </div>
            {editingSection === 'personal' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePersonal}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Save size={13} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingSection('personal')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 size={13} /> Edit
              </button>
            )}
          </div>

          {editingSection === 'personal' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formDateOfBirth}
                  onChange={(e) => setFormDateOfBirth(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Gender</label>
                <select
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value)}
                  className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  placeholder="+8801700000000"
                  value={formEmergencyContact}
                  onChange={(e) => setFormEmergencyContact(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Full Name</span>
                <span className="font-bold text-white mt-1 block">{u.fullName || 'Not Set'}</span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Mobile Phone</span>
                  <span className="font-mono font-bold text-white mt-1 block">{u.phone || 'N/A'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => openContactModal('PHONE')}
                  className="text-[10px] text-primary hover:underline font-bold"
                >
                  Change
                </button>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="overflow-hidden pr-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Email Address</span>
                  <span className="font-mono text-gray-200 mt-1 block truncate">{u.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => openContactModal('EMAIL')}
                  className="text-[10px] text-primary hover:underline font-bold shrink-0"
                >
                  Change
                </button>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Emergency Contact</span>
                <span className="font-mono text-gray-200 mt-1 block">{dp.emergencyContact || 'Not Set'}</span>
              </div>
            </div>
          )}
        </section>

        {/* --- SECTION B: ADDRESS INFORMATION --- */}
        <section className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Base & Address Information</h3>
            </div>
            {editingSection === 'address' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Save size={13} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingSection('address')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 size={13} /> Edit
              </button>
            )}
          </div>

          {editingSection === 'address' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Division</label>
                <select
                  value={formDivision}
                  onChange={(e) => setFormDivision(e.target.value)}
                  className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  {BANGLADESH_DIVISIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">District</label>
                <input
                  type="text"
                  value={formDistrict}
                  onChange={(e) => setFormDistrict(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Upazila / Thana</label>
                <input
                  type="text"
                  placeholder="e.g. Gulshan"
                  value={formUpazila}
                  onChange={(e) => setFormUpazila(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Union / Ward</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 18"
                  value={formUnionWard}
                  onChange={(e) => setFormUnionWard(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Area / Neighborhood</label>
                <input
                  type="text"
                  placeholder="e.g. Banani Block D"
                  value={formArea}
                  onChange={(e) => setFormArea(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Postal Code</label>
                <input
                  type="text"
                  placeholder="e.g. 1213"
                  value={formPostalCode}
                  onChange={(e) => setFormPostalCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Full Road / Holding Address</label>
                <input
                  type="text"
                  placeholder="House 24, Road 11, Banani, Dhaka"
                  value={formFullAddress}
                  onChange={(e) => setFormFullAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Division & District</span>
                <span className="font-bold text-white mt-1 block">
                  {dp.district || 'Dhaka'}, {dp.division || 'Dhaka'}
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Upazila & Area</span>
                <span className="font-bold text-white mt-1 block">
                  {dp.upazila || 'Central'}, {dp.area || 'Metro Area'}
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Postal Code</span>
                <span className="font-mono text-gray-300 mt-1 block">{dp.postalCode || '1200'}</span>
              </div>

              <div className="sm:col-span-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Full Physical Address</span>
                <span className="text-gray-200 mt-1 block">{dp.fullAddress || 'Dhaka Central Hub Base, Bangladesh'}</span>
              </div>
            </div>
          )}
        </section>

        {/* --- SECTION C: VEHICLE INFORMATION --- */}
        <section className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bike size={18} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Vehicle & Equipment Specifications</h3>
            </div>
            {editingSection === 'vehicle' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveVehicle}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Save size={13} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingSection('vehicle')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 size={13} /> Edit
              </button>
            )}
          </div>

          {editingSection === 'vehicle' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Vehicle Type</label>
                <select
                  value={formVehicleType}
                  onChange={(e) => setFormVehicleType(e.target.value)}
                  className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  {VEHICLE_TYPES.map(vt => (
                    <option key={vt.id} value={vt.id}>{vt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Vehicle Model / Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Yamaha FZ-S v3"
                  value={formVehicleModel}
                  onChange={(e) => setFormVehicleModel(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Registration Plate Number</label>
                <input
                  type="text"
                  placeholder="DHAKA METRO-HA-12-3456"
                  value={formVehicleNumber}
                  onChange={(e) => setFormVehicleNumber(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Vehicle Color</label>
                <input
                  type="text"
                  placeholder="e.g. Matte Black"
                  value={formVehicleColor}
                  onChange={(e) => setFormVehicleColor(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Vehicle Ownership</label>
                <select
                  value={formVehicleOwnership}
                  onChange={(e) => setFormVehicleOwnership(e.target.value)}
                  className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="OWNED">Self Owned</option>
                  <option value="RENTED">Rented / Leased</option>
                  <option value="COMPANY">Company Provided</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Driving License Number</label>
                <input
                  type="text"
                  placeholder="DL-8802938192"
                  value={formDrivingLicense}
                  onChange={(e) => setFormDrivingLicense(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Type & Model</span>
                <span className="font-bold text-white mt-1 block">
                  {dp.vehicleType || 'MOTORCYCLE'} {dp.vehicleModel ? `• ${dp.vehicleModel}` : ''}
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Plate Number</span>
                <span className="font-mono font-bold text-amber-300 mt-1 block">
                  {dp.vehicleNumber || 'DHAKA METRO-HA-12-3456'}
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Driving License</span>
                <span className="font-mono text-gray-300 mt-1 block">
                  {dp.drivingLicense || 'DL-8802938192'} ({dp.licenseStatus || 'ACTIVE'})
                </span>
              </div>
            </div>
          )}
        </section>

        {/* --- SECTION D: DELIVERY & DISPATCH INFORMATION (ADMIN CONTROLLED) --- */}
        <section className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Delivery & Dispatch Territory</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Admin Controlled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Delivery Man ID</span>
              <span className="font-mono font-bold text-white mt-1 block">
                {profileData?.deliveryManId || 'DM-000124'}
              </span>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Stationed Hub / Branch</span>
              <span className="font-bold text-primary mt-1 block">
                {dp.stationedHub ? `${dp.stationedHub.name} (${dp.stationedHub.code})` : 'Dhaka Central Hub'}
              </span>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Assigned Service Zone</span>
              <span className="font-bold text-white mt-1 block">
                {dp.preferredZone || 'Dhaka Central Metro'}
              </span>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Delivery Speed Tier</span>
              <span className="font-bold text-amber-400 mt-1 block">
                {dp.deliveryType || 'EXPRESS'} Speed
              </span>
            </div>
          </div>
        </section>

        {/* --- SECTION E: VERIFICATION & COMPLIANCE --- */}
        <section className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Identity & Verification Status</h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              ver.status === 'VERIFIED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {ver.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">National ID (NID)</span>
              <span className="font-mono font-bold text-white mt-1 block">
                {dp.nidNumber || '19942691234567890'}
              </span>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Verification Date</span>
              <span className="text-gray-300 mt-1 block">
                {ver.verifiedAt ? new Date(ver.verifiedAt).toLocaleDateString() : 'Verified by Operations'}
              </span>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Compliance Remarks</span>
              <span className="text-emerald-400 font-semibold mt-1 block flex items-center gap-1">
                <CheckCircle2 size={12} /> {ver.remarks || 'Background check passed. Driver kit issued.'}
              </span>
            </div>
          </div>
        </section>

        {/* --- SECTION F: SECURITY & SETTINGS QUICK ACTIONS --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/delivery/settings/notifications"
            className="p-5 rounded-3xl bg-gray-900/80 hover:bg-gray-800/80 border border-white/10 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Bell size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Notification Preferences</h4>
                <p className="text-xs text-gray-400">Configure delivery alerts, SMS, and in-app triggers</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/delivery/settings/security"
            className="p-5 rounded-3xl bg-gray-900/80 hover:bg-gray-800/80 border border-white/10 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Security & Active Sessions</h4>
                <p className="text-xs text-gray-400">Change password, view login sessions & devices</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
          </Link>
        </section>

        {/* Sign Out Button */}
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
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <LogOut size={16} /> Sign Out from Delivery Account
          </button>
        </div>
      </main>

      {/* ================================================================ */}
      {/* MODAL 1: PHOTO UPLOAD MODAL */}
      {/* ================================================================ */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">Update Profile Photo</h3>
              <button
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  setPhotoPreview(null);
                  setSelectedPhotoFile(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-3xl bg-gray-800 border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : u.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatar} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={36} className="text-gray-500" />
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Choose Image File (JPEG / PNG / WebP, max 5MB)
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleUploadPhoto}
                disabled={!selectedPhotoFile || isUploadingPhoto}
                className="flex-1 py-3 rounded-xl bg-primary text-black font-bold text-xs hover:bg-amber-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isUploadingPhoto ? 'Uploading...' : 'Save New Photo'}
              </button>
              {u.avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isUploadingPhoto}
                  className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-colors cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 2: PHONE / EMAIL CHANGE VERIFICATION WITH OTP */}
      {/* ================================================================ */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">
                Change {contactModalType === 'PHONE' ? 'Mobile Phone' : 'Email Address'}
              </h3>
              <button onClick={() => setIsContactModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {contactFeedback && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                {contactFeedback}
              </div>
            )}

            {contactStep === 'REQUEST' ? (
              <form onSubmit={handleRequestContactOtp} className="space-y-4">
                <p className="text-xs text-gray-300">
                  To protect your delivery partner account, changing your verified {contactModalType.toLowerCase()} requires a 6-digit OTP verification code.
                </p>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    New {contactModalType === 'PHONE' ? 'Phone Number' : 'Email Address'} *
                  </label>
                  <input
                    type={contactModalType === 'PHONE' ? 'tel' : 'email'}
                    required
                    placeholder={contactModalType === 'PHONE' ? '01712345678' : 'courier@zibonbaba.com'}
                    value={newContactValue}
                    onChange={(e) => setNewContactValue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={contactLoading || !newContactValue.trim()}
                    className="flex-1 py-3 rounded-xl bg-primary text-black font-bold text-xs hover:bg-amber-400 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {contactLoading ? 'Sending Code...' : 'Send Verification OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="px-4 py-3 rounded-xl bg-white/5 text-gray-300 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyContactOtp} className="space-y-4">
                <p className="text-xs text-gray-300">
                  Enter the 6-digit verification code sent to <b className="text-white">{newContactValue}</b>.
                </p>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Verification Code (OTP) *</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={contactOtpInput}
                    onChange={(e) => setContactOtpInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={contactLoading || contactOtpInput.trim().length < 6}
                    className="flex-1 py-3 rounded-xl bg-primary text-black font-bold text-xs hover:bg-amber-400 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {contactLoading ? 'Verifying...' : 'Verify & Update'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactStep('REQUEST')}
                    className="px-4 py-3 rounded-xl bg-white/5 text-gray-300 font-bold text-xs cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 3: DELIVERY HISTORY MODAL */}
      {/* ================================================================ */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">Delivery Order History</h3>
                <p className="text-xs text-gray-400">All authorized parcels and deliveries completed by you</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-2 border-b border-white/5 flex gap-2 overflow-x-auto">
              {['ALL', 'DELIVERED', 'FAILED', 'RETURNED'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setHistoryFilter(tab);
                    fetchDeliveryHistory(tab);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    historyFilter === tab ? 'bg-primary text-black' : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {historyLoading ? (
                <div className="py-12 text-center text-xs text-gray-400">Loading delivery records...</div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">No delivery records matching filter.</div>
              ) : (
                historyList.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-primary">{item.orderDisplayId}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : item.status === 'FAILED'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-300">
                      Customer: <b>{item.customerName}</b> ({item.district})
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5 font-mono">
                      <span>Delivery Fee: ৳{item.deliveryFee}</span>
                      <span>COD: ৳{item.codAmount}</span>
                      <span>{new Date(item.assignedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
