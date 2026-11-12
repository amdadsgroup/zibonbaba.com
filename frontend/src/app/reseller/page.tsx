'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp, ShoppingBag, Package, Users, DollarSign, Wallet, ArrowUpRight,
  Plus, Search, Filter, RefreshCw, X, Check, CheckCircle2, Clock, Lock,
  ShieldAlert, LogOut, ArrowRight, ExternalLink, Edit, Trash2, CreditCard,
  Building2, MapPin, Phone, Mail, Eye, Sparkles, ChevronRight, BarChart3,
  Sliders, ArrowDownRight, Layers, HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { useStore } from '@/store/useStore';

type ResellerTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'wallet' | 'withdrawals' | 'analytics' | 'profile';

export default function ResellerPortalPage() {
  const router = useRouter();
  const { isLoggedIn, role, username, logout } = useStore();

  const [activeTab, setActiveTab] = useState<ResellerTab>('dashboard');
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [walletData, setWalletData] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  // Filter & Search States
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('All');
  const [catalogOnly, setCatalogOnly] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [customerSearch, setCustomerSearch] = useState('');
  const [analyticsRange, setAnalyticsRange] = useState('30D');

  // Modals & Forms
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedProductForPricing, setSelectedProductForPricing] = useState<any | null>(null);
  const [customPriceInput, setCustomPriceInput] = useState('');

  // Order Creation Form State
  const [orderCustName, setOrderCustName] = useState('');
  const [orderCustPhone, setOrderCustPhone] = useState('');
  const [orderCustAltPhone, setOrderCustAltPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderDistrict, setOrderDistrict] = useState('Dhaka');
  const [orderUpazila, setOrderUpazila] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSellingPrice, setOrderSellingPrice] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bKash');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Feedback Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  // 1. Fetch Dashboard Aggregates
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/reseller/dashboard', { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data);
        if (data.profile) setProfileData(data.profile);
      }
    } catch (_) {}
  }, []);

  // 2. Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (productSearch) params.append('query', productSearch);
      if (productCategory && productCategory !== 'All') params.append('category', productCategory);
      if (catalogOnly) params.append('onlyInCatalog', 'true');

      const res = await fetch(`/api/reseller/products?${params.toString()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (_) {}
  }, [productSearch, productCategory, catalogOnly]);

  // 3. Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (orderStatusFilter && orderStatusFilter !== 'ALL') params.append('status', orderStatusFilter);

      const res = await fetch(`/api/reseller/orders?${params.toString()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (_) {}
  }, [orderStatusFilter]);

  // 4. Fetch Customers
  const fetchCustomers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (customerSearch) params.append('query', customerSearch);

      const res = await fetch(`/api/reseller/customers?${params.toString()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.customers || []);
      }
    } catch (_) {}
  }, [customerSearch]);

  // 5. Fetch Wallet & Ledger
  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/reseller/wallet', { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setWalletData(data);
      }
    } catch (_) {}
  }, []);

  // 6. Fetch Withdrawals
  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await fetch('/api/reseller/withdrawals', { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setWithdrawals(data.withdrawals || []);
      }
    } catch (_) {}
  }, []);

  // 7. Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`/api/reseller/analytics?range=${analyticsRange}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setAnalyticsData(data);
      }
    } catch (_) {}
  }, [analyticsRange]);

  // Master Initial Load
  useEffect(() => {
    setIsMounted(true);
    const token = getAuthToken();
    if (token) {
      Promise.all([
        fetchDashboard(),
        fetchProducts(),
        fetchOrders(),
        fetchCustomers(),
        fetchWallet(),
        fetchWithdrawals(),
        fetchAnalytics()
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchDashboard, fetchProducts, fetchOrders, fetchCustomers, fetchWallet, fetchWithdrawals, fetchAnalytics]);

  // Real-Time Cross-Portal Synchronization Listener
  useEffect(() => {
    const handleSync = () => {
      fetchDashboard();
      fetchOrders();
      fetchProducts();
      fetchWallet();
      fetchAnalytics();
    };

    window.addEventListener('zibonbaba:order-sync', handleSync);
    window.addEventListener('zibonbaba:product-sync', handleSync);
    window.addEventListener('zibonbaba:sync', handleSync);

    return () => {
      window.removeEventListener('zibonbaba:order-sync', handleSync);
      window.removeEventListener('zibonbaba:product-sync', handleSync);
      window.removeEventListener('zibonbaba:sync', handleSync);
    };
  }, [fetchDashboard, fetchOrders, fetchProducts, fetchWallet, fetchAnalytics]);

  // Handle Tab changes
  const handleTabChange = (tab: ResellerTab) => {
    setActiveTab(tab);
    setSuccessMsg('');
    setErrorMsg('');
    if (tab === 'products') fetchProducts();
    if (tab === 'orders') fetchOrders();
    if (tab === 'customers') fetchCustomers();
    if (tab === 'wallet') fetchWallet();
    if (tab === 'withdrawals') fetchWithdrawals();
    if (tab === 'analytics') fetchAnalytics();
  };

  // Open Add/Edit Pricing Modal for a product
  const handleOpenPricingModal = (prod: any) => {
    setSelectedProductForPricing(prod);
    setCustomPriceInput(prod.resellerPrice?.toString() || Math.round(prod.basePrice * 1.1).toString());
    setIsPricingModalOpen(true);
  };

  // Save product pricing to catalog
  const handleSaveProductPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForPricing || !customPriceInput) return;

    try {
      const res = await fetch('/api/reseller/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId: selectedProductForPricing.id,
          resellerPrice: parseFloat(customPriceInput)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Updated price for ${selectedProductForPricing.name}`);
        setIsPricingModalOpen(false);
        fetchProducts();
        fetchDashboard();
      } else {
        setErrorMsg(data.error || 'Failed to update price');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating product');
    }
  };

  // Remove product from catalog
  const handleRemoveFromCatalog = async (productId: string) => {
    try {
      const res = await fetch('/api/reseller/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, action: 'remove' })
      });
      if (res.ok) {
        fetchProducts();
        fetchDashboard();
      }
    } catch (_) {}
  };

  // Quick Open Order Modal with preselected product
  const handleQuickCreateOrder = (prod?: any) => {
    if (prod) {
      setSelectedProductId(prod.id);
      setSelectedVariantId(prod.variants?.[0]?.id || '');
      setOrderSellingPrice(prod.resellerPrice?.toString() || Math.round(prod.basePrice * 1.1).toString());
    } else if (products.length > 0) {
      const first = products[0];
      setSelectedProductId(first.id);
      setSelectedVariantId(first.variants?.[0]?.id || '');
      setOrderSellingPrice(first.resellerPrice?.toString() || Math.round(first.basePrice * 1.1).toString());
    }
    setIsCreateOrderOpen(true);
  };

  // Submit Order Creation
  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedProductId || !orderCustName || !orderCustPhone || !orderAddress) {
      setErrorMsg('Please fill all required customer and address fields.');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const res = await fetch('/api/reseller/orders', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          customerName: orderCustName.trim(),
          customerPhone: orderCustPhone.trim(),
          altPhone: orderCustAltPhone.trim() || undefined,
          address: orderAddress.trim(),
          district: orderDistrict.trim(),
          upazila: orderUpazila.trim() || undefined,
          notes: orderNotes.trim() || undefined,
          items: [
            {
              productId: selectedProductId,
              variantId: selectedVariantId || undefined,
              quantity: orderQuantity,
              customSellingPrice: orderSellingPrice
            }
          ]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place customer order.');
      }

      setSuccessMsg(`Order placed successfully! Expected profit: ৳${data.profit.toLocaleString()}`);
      setIsCreateOrderOpen(false);
      // Reset form
      setOrderCustName('');
      setOrderCustPhone('');
      setOrderCustAltPhone('');
      setOrderAddress('');
      setOrderUpazila('');
      setOrderNotes('');
      setOrderQuantity(1);

      fetchOrders();
      fetchDashboard();
      fetchCustomers();
      fetchWallet();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Submit Withdrawal Request
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const amt = parseFloat(withdrawAmount);
    if (!amt || amt < 100) {
      setErrorMsg('Minimum withdrawal amount is ৳100.');
      return;
    }

    setIsSubmittingWithdraw(true);

    try {
      const res = await fetch('/api/reseller/withdrawals', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: amt,
          paymentMethod: withdrawMethod,
          accountNumber: withdrawAccount.trim(),
          notes: withdrawNotes.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit withdrawal request.');
      }

      setSuccessMsg(`Withdrawal request of ৳${amt.toLocaleString()} submitted successfully!`);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawAccount('');
      setWithdrawNotes('');

      fetchWallet();
      fetchWithdrawals();
      fetchDashboard();
    } catch (err: any) {
      setErrorMsg(err.message || 'Withdrawal submission error.');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center text-white shadow-2xl">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2">Reseller Login Required</h1>
          <p className="text-xs text-gray-400 mb-6">Please log in to your Reseller Partner account.</p>
          <Link href="/reseller/login" className="bg-primary text-gray-950 font-black text-xs px-6 py-3 rounded-2xl block w-full text-center hover:bg-primary-accent transition-all shadow-glow">
            Sign In to Reseller Portal
          </Link>
        </div>
      </div>
    );
  }

  const normalizedRole = (role || '').toUpperCase();
  if (normalizedRole !== 'RESELLER' && normalizedRole !== 'SUPER_ADMIN' && normalizedRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center text-white shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2">Access Restricted</h1>
          <p className="text-xs text-gray-400 mb-6">A verified Reseller Partner account is required to view this portal.</p>
          <Link href="/reseller/register" className="bg-primary text-gray-950 font-black text-xs px-6 py-3 rounded-2xl block w-full text-center mb-3">
            Register as Reseller
          </Link>
          <button onClick={() => router.push('/')} className="bg-white/5 border border-white/10 text-gray-300 font-black text-xs px-6 py-3 rounded-2xl block w-full hover:bg-white/10">
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalSales: 0,
    totalOrders: 0,
    totalProfit: 0,
    availableBalance: 0,
    pendingProfit: 0,
    pendingPayout: 0,
    counts: { pending: 0, inTransit: 0, delivered: 0, cancelled: 0, returned: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top Bar Navigation */}
      <header className="border-b border-white/10 bg-gray-900/70 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reseller" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-gray-900 text-lg shadow-glow">
              Z
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base tracking-tight text-white block">
                Zibon<span className="text-primary">baba</span>
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block -mt-1">
                Reseller Network
              </span>
            </div>
          </Link>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
            PRO HUB
          </span>
        </div>

        {/* Global Quick Action & Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuickCreateOrder()}
            className="bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-glow flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} /> <span className="hidden sm:inline">Create Customer Order</span>
          </button>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <button
            onClick={() => { logout(); router.push('/reseller/login'); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/5 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={14} /> <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main App Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-3 space-y-1 backdrop-blur-md sticky top-20">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'products', label: 'Product Catalog', icon: Package },
              { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
              { id: 'customers', label: 'My Customers', icon: Users },
              { id: 'wallet', label: 'Wallet & Ledger', icon: Wallet },
              { id: 'withdrawals', label: 'Withdrawals', icon: CreditCard },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'profile', label: 'Business Profile', icon: Building2 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as ResellerTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary text-gray-950 shadow-glow font-black'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'orders' && stats.counts.pending > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${isActive ? 'bg-gray-900 text-primary' : 'bg-primary text-gray-950'}`}>
                      {stats.counts.pending}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Notifications Banner */}
          {successMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} /> <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>⚠️</span> <span>{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Header greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-gray-900 to-gray-900/60 border border-white/10 p-6 rounded-3xl">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Welcome, {profileData?.businessName || username || 'Reseller Partner'} 🚀
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage marketplace catalogs, place customer orders, and track your profit settlements.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard size={14} /> Request Payout
                  </button>
                  <button
                    onClick={() => handleQuickCreateOrder()}
                    className="bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-glow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} /> New Order
                  </button>
                </div>
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-900/80 border border-white/10 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales</span>
                    <DollarSign size={16} className="text-primary" />
                  </div>
                  <p className="text-2xl font-black text-white">৳{(stats.totalSales || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{stats.totalOrders || 0} Total Orders</p>
                </div>

                <div className="bg-gray-900/80 border border-white/10 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Net Profit</span>
                    <TrendingUp size={16} className="text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-emerald-400">৳{(stats.totalProfit || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 mt-1">৳{(stats.pendingProfit || 0).toLocaleString()} Pending</p>
                </div>

                <div className="bg-gray-900/80 border border-white/10 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Available Wallet</span>
                    <Wallet size={16} className="text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-amber-400">৳{(stats.availableBalance || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 mt-1">Ready for withdrawal</p>
                </div>

                <div className="bg-gray-900/80 border border-white/10 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
                    <CheckCircle2 size={16} className="text-blue-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{stats.counts.delivered || 0}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{stats.counts.inTransit || 0} In Transit / {stats.counts.pending || 0} Pending</p>
                </div>
              </div>

              {/* Monthly Performance Chart */}
              <div className="bg-gray-900/80 border border-white/10 p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">Monthly Sales & Profit Growth</h3>
                    <p className="text-[11px] text-gray-400">Six-month performance revenue breakdown</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Sales (৳)
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Profit (৳)
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  {dashboardData?.monthlyTrends && dashboardData.monthlyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData.monthlyTrends}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFC107" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FFC107" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34D399" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#34D399" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                        <YAxis stroke="#9CA3AF" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} />
                        <Area type="monotone" dataKey="sales" stroke="#FFC107" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Sales (৳)" />
                        <Area type="monotone" dataKey="profit" stroke="#34D399" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit (৳)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                      No sales history recorded yet. Place customer orders to view trends!
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Orders & Top Selling Products */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-gray-900/80 border border-white/10 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white">Recent Customer Orders</h3>
                    <button onClick={() => handleTabChange('orders')} className="text-xs text-primary font-bold hover:underline">
                      View All Orders →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-400 font-bold">
                          <th className="pb-3">Order ID</th>
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Selling Price</th>
                          <th className="pb-3">Your Profit</th>
                          <th className="pb-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300">
                        {dashboardData?.recentOrders?.map((ord: any) => (
                          <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 font-mono font-bold text-white">#{ord.id.slice(0, 8).toUpperCase()}</td>
                            <td className="py-3">
                              <p className="font-bold text-white">{ord.customerName}</p>
                              <p className="text-[10px] text-gray-500">{ord.customerPhone}</p>
                            </td>
                            <td className="py-3 font-bold text-white">৳{ord.sellingAmount.toLocaleString()}</td>
                            <td className="py-3 font-bold text-emerald-400">+৳{ord.profit.toLocaleString()}</td>
                            <td className="py-3 text-right">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : ord.status === 'IN_TRANSIT'
                                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                  : ord.status === 'CANCELLED'
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!dashboardData?.recentOrders || dashboardData.recentOrders.length === 0) && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-gray-500 text-xs">
                              No customer orders placed yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-gray-900/80 border border-white/10 p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-black text-white">Top Performing SKUs</h3>
                  <div className="space-y-3">
                    {dashboardData?.topProducts?.map((tp: any) => (
                      <div key={tp.id} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={tp.image} alt={tp.name} className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{tp.name}</h4>
                            <p className="text-[10px] text-gray-400 font-mono">{tp.salesCount} Units Sold</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-400 shrink-0">+৳{Math.round(tp.profit).toLocaleString()}</span>
                      </div>
                    ))}
                    {(!dashboardData?.topProducts || dashboardData.topProducts.length === 0) && (
                      <p className="text-xs text-gray-500 text-center py-6">No product sales yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PRODUCT CATALOG & RESELLER PRICING */}
          {/* ======================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Filter Controls */}
              <div className="bg-gray-900/80 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 h-10 w-full sm:max-w-md focus-within:border-primary">
                  <Search size={16} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search marketplace catalog..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="bg-transparent text-xs w-full outline-none text-white font-medium"
                  />
                  {productSearch && (
                    <button onClick={() => setProductSearch('')} className="text-gray-500 hover:text-white">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCatalogOnly(!catalogOnly)}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                      catalogOnly
                        ? 'bg-primary text-gray-950 border-primary font-black'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    My Reseller Catalog Only
                  </button>

                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="bg-gray-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Electronics & Gadgets">Electronics</option>
                    <option value="Fashion & Apparel">Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                  </select>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <div key={prod.id} className="bg-gray-900/80 border border-white/10 rounded-3xl p-4 flex flex-col justify-between hover:border-white/20 transition-all group">
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-800">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute top-2.5 left-2.5 bg-gray-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/10">
                          {prod.category}
                        </span>
                        {prod.inCatalog && (
                          <span className="absolute top-2.5 right-2.5 bg-emerald-500/90 text-gray-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-glow">
                            In My Catalog
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-white group-hover:text-primary transition-colors line-clamp-1">{prod.name}</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Vendor: {prod.storeName}</p>
                      </div>

                      {/* Pricing Specs */}
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">Base Cost</span>
                          <span className="text-xs font-bold text-gray-300">৳{prod.basePrice.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">Selling Price</span>
                          <span className="text-xs font-black text-white">৳{prod.resellerPrice.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-emerald-400 font-bold uppercase block">Profit / Unit</span>
                          <span className="text-xs font-black text-emerald-400">+৳{prod.profit.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 mt-2 border-t border-white/5">
                      <button
                        onClick={() => handleOpenPricingModal(prod)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-bold py-2 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit size={13} /> {prod.inCatalog ? 'Edit Markup' : 'Set Price'}
                      </button>

                      <button
                        onClick={() => handleQuickCreateOrder(prod)}
                        className="flex-1 bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black py-2 rounded-xl transition-all shadow-glow flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag size={13} /> Place Order
                      </button>

                      {prod.inCatalog && (
                        <button
                          onClick={() => handleRemoveFromCatalog(prod.id)}
                          className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl border border-white/5 transition-colors cursor-pointer"
                          title="Remove from Catalog"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-16 bg-gray-900/40 rounded-3xl border border-white/5 space-y-2">
                  <Package className="w-10 h-10 text-gray-600 mx-auto" />
                  <p className="text-sm font-bold text-gray-400">No products found matching criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CUSTOMER ORDERS */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {['ALL', 'PENDING', 'PROCESSING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-primary text-gray-950 border-primary font-black'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleQuickCreateOrder()}
                  className="bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-glow flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={15} /> Create Customer Order
                </button>
              </div>

              {/* Orders Table */}
              <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-bold">
                      <th className="pb-3 px-3">Order ID & Date</th>
                      <th className="pb-3 px-3">Customer Details</th>
                      <th className="pb-3 px-3">Products</th>
                      <th className="pb-3 px-3">Wholesale Base</th>
                      <th className="pb-3 px-3">Selling Total</th>
                      <th className="pb-3 px-3">Your Profit</th>
                      <th className="pb-3 px-3">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-3 font-mono font-bold text-white">
                          #{ord.id.slice(0, 8).toUpperCase()}
                          <span className="block text-[10px] text-gray-500 font-normal mt-0.5">{new Date(ord.date).toLocaleDateString()}</span>
                        </td>
                        <td className="py-4 px-3">
                          <p className="font-bold text-white">{ord.customerName}</p>
                          <p className="text-[10px] text-gray-400">{ord.customerPhone}</p>
                          <p className="text-[10px] text-gray-500 truncate max-w-[160px]">{ord.shippingAddress}</p>
                        </td>
                        <td className="py-4 px-3">
                          {ord.items.map((it: any, i: number) => (
                            <p key={i} className="text-gray-300 text-[11px]">
                              {it.quantity}x {it.name}
                            </p>
                          ))}
                        </td>
                        <td className="py-4 px-3 font-mono font-bold text-gray-400">
                          ৳{ord.baseAmount.toLocaleString()}
                        </td>
                        <td className="py-4 px-3 font-mono font-bold text-white">
                          ৳{ord.sellingAmount.toLocaleString()}
                        </td>
                        <td className="py-4 px-3 font-mono font-bold text-emerald-400">
                          +৳{ord.profit.toLocaleString()}
                        </td>
                        <td className="py-4 px-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : ord.status === 'IN_TRANSIT'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              : ord.status === 'CANCELLED'
                              ? 'bg-red-500/10 border-red-500/20 text-red-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {ord.status}
                          </span>
                          {ord.delivery && (
                            <span className="block text-[9px] text-gray-400 mt-1">
                              Rider: {ord.delivery.deliveryManName}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500 text-xs">
                          No orders found matching the selected status.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: CUSTOMER DIRECTORY */}
          {/* ======================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="bg-gray-900/80 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 h-10 w-full max-w-md focus-within:border-primary">
                  <Search size={16} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search customers by name, phone, or address..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="bg-transparent text-xs w-full outline-none text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((c) => (
                  <div key={c.id} className="bg-gray-900/80 border border-white/10 rounded-3xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white">{c.name}</h4>
                          <p className="text-[10px] text-gray-400 font-mono">{c.phone}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        {c.totalOrders} Orders
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-400 space-y-1 pt-2 border-t border-white/5">
                      <p className="truncate"><span className="text-gray-500">Address:</span> {c.address}</p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Total Spent:</span>
                        <span className="font-bold text-white">৳{(c.totalSales || 0).toLocaleString()}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Total Profit Earned:</span>
                        <span className="font-bold text-emerald-400">+৳{(c.totalProfit || 0).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                ))}
                {customers.length === 0 && (
                  <div className="col-span-3 text-center py-16 text-gray-500 text-xs">
                    No customers found. Customers are automatically saved when you place orders!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: WALLET & LEDGER */}
          {/* ======================================================== */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {/* Balances Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/80 border border-white/10 p-6 rounded-3xl space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Balance</span>
                  <p className="text-3xl font-black text-amber-400">৳{(walletData?.wallet?.availableBalance || 0).toLocaleString()}</p>
                  <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="w-full mt-3 bg-primary hover:bg-primary-accent text-gray-950 font-black text-xs py-2.5 rounded-xl transition-all shadow-glow cursor-pointer"
                  >
                    Request Payout Withdrawal
                  </button>
                </div>

                <div className="bg-gray-900/80 border border-white/10 p-6 rounded-3xl space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Profit Settlement</span>
                  <p className="text-3xl font-black text-gray-300">৳{(walletData?.wallet?.pendingBalance || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500">Credited automatically upon delivery completion</p>
                </div>

                <div className="bg-gray-900/80 border border-white/10 p-6 rounded-3xl space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Lifetime Earnings</span>
                  <p className="text-3xl font-black text-emerald-400">৳{(walletData?.wallet?.totalEarnings || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500">৳{(walletData?.wallet?.totalWithdrawn || 0).toLocaleString()} Total Withdrawn</p>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-black text-white">Immutable Wallet Ledger</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-400 font-bold">
                        <th className="pb-3 px-3">Date</th>
                        <th className="pb-3 px-3">Type</th>
                        <th className="pb-3 px-3">Description</th>
                        <th className="pb-3 px-3">Amount</th>
                        <th className="pb-3 px-3 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      {walletData?.transactions?.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-3 font-mono text-gray-400">{new Date(tx.date).toLocaleDateString()}</td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                              tx.type === 'CREDIT'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-white font-medium">{tx.description}</td>
                          <td className={`py-3.5 px-3 font-mono font-bold ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-gray-300">
                            ৳{tx.balance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {(!walletData?.transactions || walletData.transactions.length === 0) && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500 text-xs">
                            No ledger transactions recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: WITHDRAWALS */}
          {/* ======================================================== */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">Payout Withdrawal Requests</h3>
                  <p className="text-xs text-gray-400">Withdraw your profit balance to mobile money or bank</p>
                </div>
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-glow flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} /> Request New Payout
                </button>
              </div>

              <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-bold">
                      <th className="pb-3 px-3">Request ID</th>
                      <th className="pb-3 px-3">Date</th>
                      <th className="pb-3 px-3">Amount</th>
                      <th className="pb-3 px-3">Payment Method</th>
                      <th className="pb-3 px-3">Account</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Admin Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-white">#{w.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-3.5 px-3 text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-3 font-mono font-black text-amber-400">৳{w.amount.toLocaleString()}</td>
                        <td className="py-3.5 px-3 font-bold text-white">{w.paymentMethod}</td>
                        <td className="py-3.5 px-3 font-mono text-gray-300">{w.accountNumber}</td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                            w.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : w.status === 'REJECTED'
                              ? 'bg-red-500/10 border-red-500/20 text-red-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-gray-400">
                          {w.transactionRef || w.adminNote || 'Processing'}
                        </td>
                      </tr>
                    ))}
                    {withdrawals.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-gray-500 text-xs">
                          No withdrawal requests submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: ANALYTICS */}
          {/* ======================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">Reseller Business Analytics</h3>
                  <p className="text-xs text-gray-400">Comprehensive sales breakdown and performance metrics</p>
                </div>
                <div className="flex items-center gap-2">
                  {['7D', '30D', 'THIS_MONTH', 'ALL'].map(r => (
                    <button
                      key={r}
                      onClick={() => setAnalyticsRange(r)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        analyticsRange === r
                          ? 'bg-primary text-gray-950 border-primary font-black'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {r === 'THIS_MONTH' ? 'This Month' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-900/80 border border-white/10 p-5 rounded-2xl">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Total GMV Sales</span>
                  <p className="text-2xl font-black text-white mt-1">৳{(analyticsData?.summary?.totalSales || 0).toLocaleString()}</p>
                </div>

                <div className="bg-gray-900/80 border border-white/10 p-5 rounded-2xl">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Reseller Profit</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">৳{(analyticsData?.summary?.totalProfit || 0).toLocaleString()}</p>
                </div>

                <div className="bg-gray-900/80 border border-white/10 p-5 rounded-2xl">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Avg Order Value</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">৳{(analyticsData?.summary?.averageOrderValue || 0).toLocaleString()}</p>
                </div>

                <div className="bg-gray-900/80 border border-white/10 p-5 rounded-2xl">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Profit Margin</span>
                  <p className="text-2xl font-black text-primary mt-1">{analyticsData?.summary?.profitMarginPercent || 0}%</p>
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="bg-gray-900/80 border border-white/10 p-6 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Revenue & Profit Timeline</h4>
                <div className="h-64 w-full">
                  {analyticsData?.timeline && analyticsData.timeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.timeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                        <YAxis stroke="#9CA3AF" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} />
                        <Bar dataKey="sales" fill="#FFC107" name="Sales (৳)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" fill="#34D399" name="Profit (৳)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                      No data recorded for this time period.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 8: PROFILE & BUSINESS SETTINGS */}
          {/* ======================================================== */}
          {activeTab === 'profile' && (
            <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-black text-white">Reseller Business Settings</h3>
                <p className="text-xs text-gray-400">Manage your business profile and default payout accounts</p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setSuccessMsg('');
                setErrorMsg('');
                try {
                  const res = await fetch('/api/reseller/profile', {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(profileData)
                  });
                  if (res.ok) {
                    setSuccessMsg('Profile updated successfully!');
                    fetchDashboard();
                  } else {
                    setErrorMsg('Failed to update profile.');
                  }
                } catch (err: any) {
                  setErrorMsg(err.message || 'Error updating profile.');
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={profileData?.businessName || ''}
                      onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={profileData?.paymentNumber || ''}
                      onChange={(e) => setProfileData({ ...profileData, paymentNumber: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Default Payout Method</label>
                    <select
                      value={profileData?.paymentMethod || 'bKash'}
                      onChange={(e) => setProfileData({ ...profileData, paymentMethod: e.target.value })}
                      className="w-full bg-gray-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Payout Account / Phone Number</label>
                    <input
                      type="text"
                      value={profileData?.paymentNumber || ''}
                      onChange={(e) => setProfileData({ ...profileData, paymentNumber: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Business Address</label>
                    <input
                      type="text"
                      value={profileData?.address || ''}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-glow cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE CUSTOMER ORDER */}
      {/* ======================================================== */}
      {isCreateOrderOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-black text-white">Place Order for Customer</h3>
                <p className="text-xs text-gray-400">Order will be fulfilled by merchant and delivered to your buyer</p>
              </div>
              <button onClick={() => setIsCreateOrderOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setSelectedProductId(pid);
                    const found = products.find(p => p.id === pid);
                    if (found) {
                      setOrderSellingPrice(found.resellerPrice?.toString() || Math.round(found.basePrice * 1.1).toString());
                    }
                  }}
                  required
                  className="w-full bg-gray-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">-- Choose from Marketplace --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Base Cost: ৳{p.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Selling Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Your Selling Price / Unit (৳) *</label>
                  <input
                    type="number"
                    value={orderSellingPrice}
                    onChange={(e) => setOrderSellingPrice(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-bold text-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Profit preview card */}
              {selectedProductId && orderSellingPrice && (
                (() => {
                  const sel = products.find(p => p.id === selectedProductId);
                  const base = (sel?.basePrice || 0) * orderQuantity;
                  const totalSell = (parseFloat(orderSellingPrice) || 0) * orderQuantity;
                  const estProfit = Math.max(0, totalSell - base - Math.round(base * 0.02));
                  return (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-medium">Estimated Reseller Profit:</span>
                      <span className="font-black text-emerald-400 text-sm">+৳{estProfit.toLocaleString()}</span>
                    </div>
                  );
                })()
              )}

              {/* Customer Details */}
              <div className="pt-3 border-t border-white/5 space-y-3">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">Recipient Customer Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Farhana Yasmin"
                      value={orderCustName}
                      onChange={(e) => setOrderCustName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">Customer Mobile *</label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={orderCustPhone}
                      onChange={(e) => setOrderCustPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] text-gray-300 mb-1">Full Shipping Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="House, Road, Area, Landmark"
                      value={orderAddress}
                      onChange={(e) => setOrderAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">District</label>
                    <input
                      type="text"
                      placeholder="e.g. Dhaka"
                      value={orderDistrict}
                      onChange={(e) => setOrderDistrict(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">Upazila / Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Uttara"
                      value={orderUpazila}
                      onChange={(e) => setOrderUpazila(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOrderOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold py-3 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="flex-1 bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black py-3 rounded-xl shadow-glow cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingOrder ? 'Placing Order...' : 'Confirm & Dispatch Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: WITHDRAWAL REQUEST */}
      {/* ======================================================== */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">Request Payout Withdrawal</h3>
              <button onClick={() => setIsWithdrawModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs flex justify-between">
              <span className="text-gray-300">Available Wallet Balance:</span>
              <span className="font-black text-amber-400">৳{(walletData?.wallet?.availableBalance || 0).toLocaleString()}</span>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Withdrawal Amount (৳) *</label>
                <input
                  type="number"
                  min="100"
                  max={walletData?.wallet?.availableBalance || 999999}
                  required
                  placeholder="Min ৳100"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Payout Gateway *</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full bg-gray-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                >
                  <option value="bKash">bKash (Personal/Merchant)</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Account Number / Bank Details *</label>
                <input
                  type="text"
                  required
                  placeholder="01XXXXXXXXX or Bank AC details"
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
                  {isSubmittingWithdraw ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: RESELLER PRODUCT PRICING */}
      {/* ======================================================== */}
      {isPricingModalOpen && selectedProductForPricing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">Set Reseller Markup</h3>
              <button onClick={() => setIsPricingModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
              <img src={selectedProductForPricing.image} alt={selectedProductForPricing.name} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h4 className="text-xs font-black text-white">{selectedProductForPricing.name}</h4>
                <p className="text-[10px] text-gray-400">Base Wholesale Cost: <span className="font-bold text-white">৳{selectedProductForPricing.basePrice}</span></p>
              </div>
            </div>

            <form onSubmit={handleSaveProductPricing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Your Reseller Selling Price (৳) *</label>
                <input
                  type="number"
                  min={selectedProductForPricing.basePrice}
                  required
                  value={customPriceInput}
                  onChange={(e) => setCustomPriceInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm font-black text-primary focus:outline-none"
                />
              </div>

              {customPriceInput && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between text-xs">
                  <span className="text-gray-300">Your Calculated Profit:</span>
                  <span className="font-black text-emerald-400">
                    +৳{Math.max(0, parseFloat(customPriceInput) - selectedProductForPricing.basePrice).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPricingModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold py-3 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black py-3 rounded-xl shadow-glow cursor-pointer"
                >
                  Save to My Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
