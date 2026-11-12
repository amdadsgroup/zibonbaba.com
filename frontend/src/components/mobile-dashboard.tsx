'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useStore, Order } from '@/store/useStore';
import {
  Package,
  Heart,
  User,
  ShoppingBag,
  Settings,
  Bell,
  ChevronRight,
  MapPin,
  CreditCard,
  CheckCircle,
  Truck,
  Download,
  ShieldCheck,
  Sparkles,
  Check,
  Star,
  RefreshCw,
  HelpCircle,
  BellRing
} from 'lucide-react';
import Link from 'next/link';

export default function MobileDashboard() {
  const { 
    isLoggedIn,
    token,
    orders, 
    wishlist, 
    products, 
    toggleWishlist, 
    addToCart, 
    username, 
    role, 
    setRole, 
    mobileTab,
    logout 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'profile' | 'wallet' | 'reviews' | 'refunds' | 'support' | 'notifications'>('overview');

  useEffect(() => {
    if (mobileTab === 'orders') {
      setActiveTab('orders');
    } else if (mobileTab === 'account') {
      setActiveTab('overview');
    }
  }, [mobileTab]);
  
  // Profile settings
  const API_BASE = '/api';
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddressType, setNewAddressType] = useState('Home');
  const [newAddressContent, setNewAddressContent] = useState('');
  
  // Wallet
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [addFundsAmount, setAddFundsAmount] = useState('100');
  const [walletSuccess, setWalletSuccess] = useState('');

  const getHeaders = useCallback(() => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    return {
      'Content-Type': 'application/json',
      'Authorization': activeToken ? `Bearer ${activeToken}` : ''
    };
  }, [token]);

  const loadData = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const profRes = await fetch(`${API_BASE}/me/profile`, { headers: getHeaders() });
      if (profRes.ok) {
        const data = await profRes.json();
        setProfileName(data.user?.profile?.fullName || data.user?.email || '');
        setProfileEmail(data.user?.email || '');
        setProfilePhone(data.user?.phone || '');
      }

      const addrRes = await fetch(`${API_BASE}/me/addresses`, { headers: getHeaders() });
      if (addrRes.ok) {
        const data = await addrRes.json();
        setAddresses(data.addresses || []);
      }

      const wallRes = await fetch(`${API_BASE}/me/wallet`, { headers: getHeaders() });
      if (wallRes.ok) {
        const data = await wallRes.json();
        setWalletBalance(data.walletBalance || 0.00);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [isLoggedIn, getHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // PWA Installability Check
  const [pwaInstallable, setPwaInstallable] = useState(false);

  useEffect(() => {
    // Check if install prompt is already captured
    if (typeof window !== 'undefined' && window.deferredPrompt) {
      setPwaInstallable(true);
    }

    const handleInstallable = () => setPwaInstallable(true);
    const handleInstalled = () => setPwaInstallable(false);

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstallApp = () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;
    promptEvent.prompt();
    promptEvent.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        setPwaInstallable(false);
      }
      window.deferredPrompt = null;
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/me/profile`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          fullName: profileName,
          phone: profilePhone
        })
      });
      if (res.ok) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
        useStore.setState({ username: profileName });
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile.');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressContent) return;
    try {
      const res = await fetch(`${API_BASE}/me/addresses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          label: newAddressType,
          fullName: profileName || username,
          phone: profilePhone || '+880',
          addressLine1: newAddressContent,
          city: 'Dhaka',
          country: 'Bangladesh'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(prev => [...prev, data.address]);
        setNewAddressContent('');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save address.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/me/addresses/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setAddresses(prev => prev.filter(a => a.id !== id));
      } else {
        alert('Failed to delete address.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(addFundsAmount);
    if (isNaN(amount) || amount <= 0) return;
    try {
      const res = await fetch(`${API_BASE}/me/wallet/add`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance);
        setWalletSuccess(`Successfully loaded ৳${amount.toFixed(2)} to Zibonbaba Wallet!`);
        setTimeout(() => setWalletSuccess(''), 3000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to add funds.');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading funds.');
    }
  };

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    PROCESSING: 'bg-blue-100 text-blue-700 border-blue-300',
    DISPATCHED: 'bg-orange-100 text-orange-700 border-orange-300',
    SHIPPED: 'bg-purple-100 text-purple-700 border-purple-300',
    DELIVERED: 'bg-green-100 text-green-700 border-green-300',
    CANCELLED: 'bg-red-100 text-red-700 border-red-300',
  };

  if (!isLoggedIn) {
    return (
      <div className="flex-1 bg-neutral-dark text-white pb-24 overflow-y-auto px-6 py-12 flex flex-col items-center justify-center min-h-[70vh] text-center md:hidden">
        <div className="p-5 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <User className="w-14 h-14 text-primary" />
        </div>
        <h2 className="text-xl font-black mb-2 text-primary">Access Dashboard</h2>
        <p className="text-[10px] text-neutral-light/75 max-w-xs mb-8 leading-relaxed">
          You are currently in guest mode. Please sign in or register to view orders, check your wallet, manage addresses, and update your profile details.
        </p>
        <div className="flex flex-col w-full max-w-[240px] gap-2.5">
          <Link
            href="/customer/login"
            className="w-full bg-primary hover:bg-primary-dark text-neutral-dark font-black text-xs py-3 rounded-lg shadow-sm text-center transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/customer/register"
            className="w-full border border-neutral-light/30 hover:bg-white/10 text-white font-bold text-xs py-3 rounded-lg text-center transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-light pb-24 overflow-y-auto px-4 py-4 animate-slide-up md:hidden">
      {/* Profile Overview Card */}
      <div className="bg-white p-4 rounded-lg border border-neutral-light shadow-sm flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-black text-neutral-dark text-lg border border-primary uppercase">
            {(profileName || username || 'U').charAt(0)}
          </div>
          <div>
            <h2 className="text-xs font-black text-neutral-dark leading-tight">{profileName || username || 'My Account'}</h2>
            <p className="text-[9px] text-neutral-muted mt-0.5 leading-none">Customer Account Tier: VIP Member</p>
          </div>
        </div>
        
        {/* Wallet Badge */}
        <div 
          onClick={() => setActiveTab('wallet')}
          className="text-right cursor-pointer bg-neutral-light hover:bg-neutral-muted/10 px-2.5 py-1.5 rounded-md border border-neutral-light flex flex-col items-end active:scale-95"
        >
          <span className="text-[8px] text-neutral-muted font-bold">Wallet Cash</span>
          <span className="text-xs font-black text-success">৳{walletBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Tab Navigation row */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {([
          { id: 'overview', label: 'Overview', icon: Package },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'wishlist', label: 'Wishlist', icon: Heart },
          { id: 'profile', label: 'Profile', icon: Settings },
          { id: 'wallet', label: 'Wallet', icon: CreditCard },
          { id: 'reviews', label: 'Reviews', icon: Star },
          { id: 'refunds', label: 'Refunds', icon: RefreshCw },
          { id: 'support', label: 'Support', icon: HelpCircle },
          { id: 'notifications', label: 'Alerts', icon: BellRing }
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1 text-[10px] font-black py-2 px-3.5 rounded-full border whitespace-nowrap active:scale-95 transition-all ${
              activeTab === id
                ? 'bg-neutral-dark border-neutral-dark text-white'
                : 'bg-white border-neutral-light text-neutral-body'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {id === 'wishlist' && wishlist.length > 0 && (
              <span className="bg-primary text-neutral-dark text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ml-0.5">
                {wishlist.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---- TAB CONTENT: OVERVIEW ---- */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-neutral-light shadow-sm">
              <span className="text-[8px] text-neutral-muted font-black uppercase">Orders Placed</span>
              <h3 className="text-lg font-black text-neutral-dark mt-1">{orders.length}</h3>
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-neutral-light shadow-sm">
              <span className="text-[8px] text-neutral-muted font-black uppercase">Total Spent</span>
              <h3 className="text-lg font-black text-success mt-1">৳{totalSpent.toFixed(2)}</h3>
            </div>
          </div>

          {/* Active order node tracker */}
          {orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-neutral-light shadow-sm space-y-4">
              <h3 className="text-[9px] font-black text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-1.5">
                Active Order Tracking Node
              </h3>
              {(() => {
                const activeOrder = orders.find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
                if (!activeOrder) return null;
                const steps = ['PENDING', 'PROCESSING', 'DISPATCHED', 'SHIPPED', 'DELIVERED'];
                const curIndex = steps.indexOf(activeOrder.status);
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] font-semibold text-neutral-muted">
                      <span>Order Ref: <span className="font-mono font-bold text-neutral-dark">{activeOrder.id}</span></span>
                      <span>Status: <span className="font-bold text-primary-dark">{activeOrder.status}</span></span>
                    </div>
                    {/* Simplified progress bar */}
                    <div className="w-full bg-neutral-light h-2 rounded-full overflow-hidden relative">
                      <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${(curIndex / 4) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-extrabold text-neutral-muted">
                      <span>Placed</span>
                      <span>Processed</span>
                      <span>Dispatched</span>
                      <span>Shipped</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PWA Install Promo */}
          {pwaInstallable && (
            <div className="bg-gradient-to-r from-neutral-dark to-neutral-dark/90 text-white p-4 rounded-lg border border-primary/20 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black">Get Zibonbaba App</h4>
                <p className="text-[9px] text-neutral-muted mt-0.5 leading-snug">Install now for the best native mobile experience & offline speed.</p>
              </div>
              <button
                onClick={handleInstallApp}
                className="bg-primary text-neutral-dark font-black text-[10px] px-3.5 py-1.5 rounded-md flex items-center gap-1 active:scale-95 shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Install
              </button>
            </div>
          )}


          {/* Quick links list */}
          <div className="bg-white rounded-lg border border-neutral-light shadow-sm divide-y divide-neutral-light">
            <button onClick={() => setActiveTab('orders')} className="w-full flex items-center justify-between p-3.5 text-left text-[10px] font-bold text-neutral-dark">
              <span>View Full Order History</span>
              <ChevronRight className="w-4 h-4 text-neutral-muted" />
            </button>
            <button onClick={() => setActiveTab('wishlist')} className="w-full flex items-center justify-between p-3.5 text-left text-[10px] font-bold text-neutral-dark">
              <span>My Wishlist ({wishlist.length})</span>
              <ChevronRight className="w-4 h-4 text-neutral-muted" />
            </button>
            <button onClick={() => setActiveTab('profile')} className="w-full flex items-center justify-between p-3.5 text-left text-[10px] font-bold text-neutral-dark">
              <span>Delivery Addresses & Settings</span>
              <ChevronRight className="w-4 h-4 text-neutral-muted" />
            </button>
          </div>
        </div>
      )}

      {/* ---- TAB CONTENT: ORDERS ---- */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-neutral-dark uppercase mb-3">Order History ({orders.length})</h3>
          {orders.length === 0 ? (
            <p className="text-center text-[10px] text-neutral-muted py-10 bg-white rounded border">No orders placed</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white p-3.5 rounded-lg border border-neutral-light shadow-sm space-y-2.5">
                <div className="flex justify-between border-b border-neutral-light pb-1.5">
                  <div>
                    <span className="font-mono text-[10px] font-black text-neutral-dark">{order.id}</span>
                    <span className="text-[8px] text-neutral-muted block font-semibold mt-0.5">{order.date} · {order.source}</span>
                  </div>
                  <span className={`px-2 py-0.5 border rounded-full text-[8.5px] font-black ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[9px] font-semibold text-neutral-body">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span className="font-bold">৳{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-neutral-light pt-2 text-[10px] font-black text-neutral-dark">
                  <span>Grand Total</span>
                  <span>৳{order.total.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---- TAB CONTENT: WISHLIST ---- */}
      {activeTab === 'wishlist' && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-neutral-dark uppercase mb-3">Starred Wishlist ({wishlistProducts.length})</h3>
          {wishlistProducts.length === 0 ? (
            <p className="text-center text-[10px] text-neutral-muted py-10 bg-white rounded border">No wishlist items</p>
          ) : (
            wishlistProducts.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-lg border border-neutral-light shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-neutral-light overflow-hidden shrink-0">
                  <img src={p.image} alt={p.name} className="object-cover w-full h-full" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-[10px] font-bold text-neutral-dark line-clamp-1 leading-tight">{p.name}</h4>
                  <span className="text-xs font-black text-primary-dark mt-1 block">৳{p.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                    className="bg-primary text-neutral-dark text-[9px] font-bold py-1.5 px-3 rounded active:scale-95"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="p-1.5 border border-error/20 text-error hover:bg-error/5 rounded active:scale-90"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---- TAB CONTENT: PROFILE ---- */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-neutral-light shadow-sm space-y-3">
            <h3 className="text-[10px] font-black text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-1.5">
              Edit Details
            </h3>
            {profileSaved && (
              <div className="bg-success/15 border border-success text-success text-[9px] p-2 rounded font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Details saved!
              </div>
            )}
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-[8px] font-black text-neutral-muted uppercase mb-1">Full Name</label>
                <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-[10px] text-neutral-dark outline-none focus:border-primary font-bold" />
              </div>
              <div>
                <label className="block text-[8px] font-black text-neutral-muted uppercase mb-1">Email Address</label>
                <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-[10px] text-neutral-dark outline-none focus:border-primary font-bold" />
              </div>
              <div>
                <label className="block text-[8px] font-black text-neutral-muted uppercase mb-1">Mobile Phone</label>
                <input type="tel" value={profilePhone} onChange={e => setProfilePhone(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-[10px] text-neutral-dark outline-none focus:border-primary font-bold" />
              </div>
              <button type="submit" className="w-full bg-neutral-dark hover:bg-neutral-dark/95 text-white text-[10px] font-black py-2 rounded-md active:scale-95 transition-transform">
                Save Changes
              </button>
            </form>
          </div>

          {/* Address Coordinate Manager */}
          <div className="bg-white p-4 rounded-lg border border-neutral-light shadow-sm space-y-3.5">
            <h3 className="text-[10px] font-black text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-1.5 flex items-center gap-1">
              <MapPin className="w-4.5 h-4.5 text-primary-accent" />
              Address Manager
            </h3>
            <div className="space-y-2">
              {addresses.map(a => (
                <div key={a.id} className="p-3 bg-neutral-light/50 border border-neutral-light rounded-md text-[9px] font-semibold text-neutral-body flex justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-neutral-dark uppercase block mb-1">{a.label || 'Address'}</span>
                    <span>{a.addressLine1}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(a.id)}
                    className="text-error font-extrabold text-[8px] hover:underline shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            {/* Add new address */}
            <form onSubmit={handleAddAddress} className="border-t border-neutral-light pt-3.5 space-y-2">
              <div className="flex gap-2">
                <select
                  value={newAddressType}
                  onChange={e => setNewAddressType(e.target.value)}
                  className="bg-neutral-light border border-neutral-light rounded p-1.5 text-[9px] text-neutral-dark font-bold"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  required
                  placeholder="New address coordinates..."
                  value={newAddressContent}
                  onChange={e => setNewAddressContent(e.target.value)}
                  className="flex-grow bg-neutral-light border border-neutral-light rounded p-1.5 text-[9px] text-neutral-dark outline-none focus:border-primary font-semibold"
                />
              </div>
              <button type="submit" className="w-full border border-neutral-dark hover:bg-neutral-light text-neutral-dark text-[9px] font-black py-2 rounded-md active:scale-95">
                Add Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---- TAB CONTENT: WALLET ---- */}
      {activeTab === 'wallet' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary to-primary-accent text-neutral-dark p-5 rounded-lg border border-primary-dark/20 shadow-sm text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-neutral-dark" />
            <span className="text-[9px] font-black uppercase text-neutral-dark/80">Available Wallet Funds</span>
            <h2 className="text-3xl font-black mt-1">৳{walletBalance.toFixed(2)}</h2>
            <span className="text-[8px] bg-neutral-dark text-white rounded-full px-2 py-0.5 inline-block mt-3.5 font-bold">
              ✓ Protected by Zibonbaba Secure Gateway
            </span>
          </div>

          {/* Add Funds Simulator */}
          <div className="bg-white p-4 rounded-lg border border-neutral-light shadow-sm space-y-3">
            <h3 className="text-[10px] font-black text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-1.5">
              Add Funds Simulator
            </h3>
            {walletSuccess && (
              <div className="bg-success/15 border border-success text-success text-[9px] p-2 rounded font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> {walletSuccess}
              </div>
            )}
            <form onSubmit={handleAddFunds} className="space-y-3">
              <div>
                <label className="block text-[8px] font-black text-neutral-muted uppercase mb-1">Enter Amount (৳)</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="1000"
                  value={addFundsAmount}
                  onChange={e => setAddFundsAmount(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-[10px] text-neutral-dark outline-none focus:border-primary font-black"
                />
              </div>
              <button type="submit" className="w-full bg-neutral-dark hover:bg-neutral-dark/95 text-white text-[10px] font-black py-2 rounded-md active:scale-95 transition-transform">
                Simulate Gateway Recharge
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---- TAB CONTENT: REVIEWS ---- */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-neutral-dark uppercase mb-3">My Reviews</h3>
          <p className="text-center text-[10px] text-neutral-muted py-10 bg-white rounded border border-neutral-light shadow-sm">No reviews submitted yet.</p>
        </div>
      )}

      {/* ---- TAB CONTENT: REFUNDS ---- */}
      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-neutral-dark uppercase mb-3">Refund Requests</h3>
          <p className="text-center text-[10px] text-neutral-muted py-10 bg-white rounded border border-neutral-light shadow-sm">No active refund requests.</p>
        </div>
      )}

      {/* ---- TAB CONTENT: SUPPORT ---- */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-neutral-dark uppercase mb-3">Support Tickets</h3>
          <button className="w-full bg-primary hover:bg-primary-dark text-neutral-dark text-[10px] font-black py-3 rounded-md active:scale-95 transition-transform mb-3 shadow-sm">
            Open New Ticket
          </button>
          <p className="text-center text-[10px] text-neutral-muted py-10 bg-white rounded border border-neutral-light shadow-sm">No support tickets found.</p>
        </div>
      )}

      {/* ---- TAB CONTENT: NOTIFICATIONS ---- */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-neutral-dark uppercase mb-3">Notifications Log</h3>
          <div className="space-y-2">
            <div className="bg-white p-3 rounded-lg border border-neutral-light shadow-sm">
              <span className="text-[8px] text-neutral-muted font-bold block mb-1">System, Account Creation</span>
              <h4 className="text-[10px] font-black text-neutral-dark">Welcome to Zibonbaba!</h4>
              <p className="text-[9px] text-neutral-body mt-0.5 leading-snug">Explore the best deals in the marketplace.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
