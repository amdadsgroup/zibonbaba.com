'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, Package, ShoppingBag, DollarSign, AlertTriangle, RefreshCw, X, Lock, ShieldAlert, Shield, ShieldCheck,
  Trash2, Edit, Clock, Wallet, Bell, Sparkles, Check, LogOut, Plus, ExternalLink, ArrowRight, Store, Users,
  Upload, Image as ImageIcon, Link as LinkIcon, Camera, CheckCircle2, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

type SellerTab = 'analytics' | 'products' | 'orders' | 'wallet' | 'staff' | 'settings';

interface SellerProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId?: string;
  sku: string;
  stock: number;
  status: string;
  image?: string | null;
  images?: string[];
  createdAt: string;
}

interface SellerOrder {
  id: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  subTotal: number;
  total: number;
  platformFee: number;
  sellerPayout: number;
  status: string;
  source: string;
  items: {
    product: {
      id: string;
      name: string;
      price: number;
      sku: string;
    };
    quantity: number;
  }[];
}

interface StoreInfo {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  isApproved: boolean;
  commissionRate: number;
  createdAt?: string;
}

export default function SellerPortalPage() {
  const router = useRouter();
  const { isLoggedIn, role, logout } = useStore();
  const [activeTab, setActiveTab] = useState<SellerTab>('analytics');
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Isolated Seller States (Strictly scoped to authenticated store)
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [earnings, setEarnings] = useState(0);
  const [totalGrossSales, setTotalGrossSales] = useState(0);
  const [withdraws, setWithdraws] = useState<{ id: string; amount: number; status: string; date: string }[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [monthlyGMV, setMonthlyGMV] = useState<{ month: string; value: number }[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [staffList, setStaffList] = useState<{ id: string; name: string; role: string; status: string; permissions: string }[]>([]);

  // Add Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdSKU, setNewProdSKU] = useState('');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdCategory, setNewProdCategory] = useState('Electronics & Gadgets');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [prodImageUploadMode, setProdImageUploadMode] = useState<'upload' | 'url'>('upload');
  const [isUploadingProdImage, setIsUploadingProdImage] = useState(false);
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editProdImage, setEditProdImage] = useState('');
  const [editProdImages, setEditProdImages] = useState<string[]>([]);
  const [editProdImageUploadMode, setEditProdImageUploadMode] = useState<'upload' | 'url'>('upload');
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);

  // File input refs
  const addImageFileInputRef = useRef<HTMLInputElement | null>(null);
  const editImageFileInputRef = useRef<HTMLInputElement | null>(null);

  // Store Settings Form State
  const [storeNameInput, setStoreNameInput] = useState('');
  const [storeDescInput, setStoreDescInput] = useState('');

  // Staff Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Sales Staff');
  const [newStaffEmail, setNewStaffEmail] = useState('');

  const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
  };

  // 1. Fetch Store Profile
  const fetchStoreProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/store', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.store) {
        setStoreInfo(data.store);
        setStoreNameInput(data.store.name || '');
        setStoreDescInput(data.store.description || '');
      }
    } catch (_) {}
  }, []);

  // 2. Fetch Isolated Products
  const fetchSellerProducts = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/products', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.products)) {
        setSellerProducts(data.products);
      }
    } catch (_) {}
  }, []);

  // 3. Fetch Isolated Orders
  const fetchSellerOrders = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/orders', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.orders)) {
        setSellerOrders(data.orders);
      }
    } catch (_) {}
  }, []);

  // 4. Fetch Isolated Wallet & Withdrawals
  const fetchSellerWallet = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/wallet', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        if (data.earnings !== undefined) setEarnings(data.earnings);
        if (data.grossSales !== undefined) setTotalGrossSales(data.grossSales);
        if (Array.isArray(data.withdrawals)) setWithdraws(data.withdrawals);
      }
    } catch (_) {}
  }, []);

  // 5. Fetch Isolated Analytics
  const fetchSellerAnalytics = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/analytics', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data.monthlyGMV)) setMonthlyGMV(data.monthlyGMV);
        if (data.totalCustomers !== undefined) setTotalCustomers(data.totalCustomers);
      }
    } catch (_) {}
  }, []);

  // 6. Fetch Staff Members
  const fetchSellerStaff = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/staff', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.staff)) {
        setStaffList(data.staff.map((s: any) => ({
          id: s.id,
          name: s.user?.profile?.fullName || s.user?.email || 'Staff Member',
          role: s.jobTitle || 'Staff',
          status: s.isActive ? 'ACTIVE' : 'INACTIVE',
          permissions: typeof s.permissions === 'string' ? JSON.parse(s.permissions).join(', ') : 'Inventory, Products'
        })));
      }
    } catch (_) {}
  }, []);

  // Initial Load
  useEffect(() => {
    setIsMounted(true);
    const token = getAuthToken();
    if (token) {
      setLoading(true);
      Promise.all([
        fetchStoreProfile(),
        fetchSellerProducts(),
        fetchSellerOrders(),
        fetchSellerWallet(),
        fetchSellerAnalytics(),
        fetchSellerStaff()
      ]).finally(() => setLoading(false));
    }
  }, [fetchStoreProfile, fetchSellerProducts, fetchSellerOrders, fetchSellerWallet, fetchSellerAnalytics, fetchSellerStaff]);

  // Real-Time Cross-Portal Synchronization Listener
  useEffect(() => {
    const handleSync = () => {
      fetchSellerOrders();
      fetchSellerProducts();
      fetchSellerWallet();
      fetchSellerAnalytics();
    };

    window.addEventListener('zibonbaba:order-sync', handleSync);
    window.addEventListener('zibonbaba:product-sync', handleSync);
    window.addEventListener('zibonbaba:sync', handleSync);

    return () => {
      window.removeEventListener('zibonbaba:order-sync', handleSync);
      window.removeEventListener('zibonbaba:product-sync', handleSync);
      window.removeEventListener('zibonbaba:sync', handleSync);
    };
  }, [fetchSellerOrders, fetchSellerProducts, fetchSellerWallet, fetchSellerAnalytics]);

  if (!isMounted) return null;

  // Strict Role & Auth Guard
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />

        <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center text-white backdrop-blur-xl shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-5 border border-amber-500/20 shadow-glow">
            <Store className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-bold text-primary mb-3">
            <Sparkles size={13} /> Seller Center
          </div>
          <h1 className="text-2xl font-black mb-2 tracking-tight">Welcome to Seller Center</h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Manage your store inventory, track customer orders, view analytics, and request fast payouts in your merchant dashboard.
          </p>
          <div className="space-y-3">
            <Link
              href="/seller/login"
              className="bg-primary text-gray-950 font-black text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 w-full shadow-glow hover:bg-primary-accent transition-all duration-200"
            >
              <Lock className="w-4 h-4" />
              <span>Login to Seller Account</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
            <Link
              href="/seller/register"
              className="bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 w-full border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Create Seller Account</span>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
            </Link>
          </div>
          <div className="mt-6 pt-5 border-t border-white/10">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5">
              ← Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const normalizedRole = (role || '').trim().toLowerCase();
  const allowedRoles = ['vendor', 'staff', 'vendor_admin', 'vendor_staff', 'seller', 'superadmin', 'admin'];
  if (!allowedRoles.includes(normalizedRole)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center text-white backdrop-blur-xl shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-5 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black mb-2">Seller Access Required</h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            You are currently signed in with a Customer account. Please register your store or switch to your Seller account to access this portal.
          </p>
          <div className="space-y-3">
            <Link
              href="/seller/register"
              className="bg-primary text-gray-950 font-black text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 w-full shadow-glow hover:bg-primary-accent transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Register as Seller</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
            <Link
              href="/seller/login"
              className="bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 w-full border border-white/10 transition-all duration-200"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Login with Seller Account</span>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
            </Link>
            <button
              onClick={() => router.push('/')}
              className="text-xs text-slate-400 hover:text-white pt-2 block w-full text-center transition-colors"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Upload image helper function
  const uploadImageFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'products');
      formData.append('folder', 'seller-products');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        return data.url;
      }
      // Fallback to Base64 Data URL if storage bucket is not configured yet
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error('Image upload failed, generating preview URL:', err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle image file selection for Add Product
  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 5MB.');
      return;
    }

    setIsUploadingProdImage(true);
    setErrorMsg('');
    try {
      const imageUrl = await uploadImageFile(file);
      if (imageUrl) {
        setNewProdImage(imageUrl);
        setNewProdImages(prev => prev.includes(imageUrl) ? prev : [imageUrl, ...prev]);
      }
    } catch (err) {
      setErrorMsg('Failed to process image file.');
    } finally {
      setIsUploadingProdImage(false);
    }
  };

  // Handle image file selection for Edit Product
  const handleEditImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }

    setIsUploadingEditImage(true);
    try {
      const imageUrl = await uploadImageFile(file);
      if (imageUrl) {
        setEditProdImage(imageUrl);
        setEditProdImages(prev => prev.includes(imageUrl) ? prev : [imageUrl, ...prev]);
      }
    } catch (err) {
      alert('Failed to process image file.');
    } finally {
      setIsUploadingEditImage(false);
    }
  };

  // Handle Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim()) {
      setErrorMsg('Product name and price are required.');
      return;
    }
    const token = getAuthToken();
    if (!token) return;

    setIsSubmittingProd(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newProdName.trim(),
          price: parseFloat(newProdPrice),
          category: newProdCategory,
          sku: newProdSKU.trim() || undefined,
          stock: parseInt(newProdStock, 10) || 20,
          description: newProdDesc.trim() || undefined,
          image: newProdImage.trim() || undefined,
          images: newProdImages.length > 0 ? newProdImages : (newProdImage.trim() ? [newProdImage.trim()] : [])
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to add product.');
        return;
      }

      setNewProdName('');
      setNewProdPrice('');
      setNewProdSKU('');
      setNewProdDesc('');
      setNewProdImage('');
      setNewProdImages([]);
      if (addImageFileInputRef.current) addImageFileInputRef.current.value = '';
      setSuccessMsg('Product SKU with photo registered successfully in your store catalog!');
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchSellerProducts();
    } catch {
      setErrorMsg('Failed to connect to server. Please try again.');
    } finally {
      setIsSubmittingProd(false);
    }
  };

  // Handle Open Edit Product Modal
  const handleOpenEditProduct = (prod: SellerProduct) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(prod.price.toString());
    setEditStock(prod.stock.toString());
    setEditDesc(prod.description || '');
    setEditProdImage(prod.image || '');
    setEditProdImages(prod.images || (prod.image ? [prod.image] : []));
  };

  // Handle Save Edit Product
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/seller/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editName.trim(),
          price: parseFloat(editPrice),
          stock: parseInt(editStock, 10),
          description: editDesc.trim(),
          image: editProdImage.trim() || undefined,
          images: editProdImages.length > 0 ? editProdImages : (editProdImage.trim() ? [editProdImage.trim()] : [])
        })
      });
      if (res.ok) {
        setEditingProduct(null);
        setSuccessMsg('Product SKU updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3500);
        await fetchSellerProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update product.');
      }
    } catch (_) {
      alert('Network error while updating product.');
    }
  };

  // Handle Delete Product
  const handleDeleteProductItem = async (prodId: string) => {
    if (!confirm('Are you sure you want to delete this product listing?')) return;
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/seller/products/${prodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg('Product listing removed.');
        setTimeout(() => setSuccessMsg(''), 3500);
        await fetchSellerProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product.');
      }
    } catch (_) {
      alert('Network error while deleting product.');
    }
  };

  // Handle Order Status Change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch('/api/seller/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      if (res.ok) {
        setSuccessMsg(`Order ${orderId} updated to ${newStatus}`);
        setTimeout(() => setSuccessMsg(''), 3500);
        await fetchSellerOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order status.');
      }
    } catch (_) {}
  };

  // Handle Payout Withdrawal Request
  const handleRequestWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > earnings) {
      alert('Please enter a valid payout amount within your available balance.');
      return;
    }
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch('/api/seller/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, bankDetails: 'Primary Bank Account', payoutMethod: 'BANK_TRANSFER' })
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawAmount('');
        alert('Withdrawal payout request submitted for review!');
        await fetchSellerWallet();
      } else {
        alert(data.error || 'Failed to request payout.');
      }
    } catch (_) {
      alert('Network error during payout request.');
    }
  };

  // Handle Save Store Settings
  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch('/api/seller/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: storeNameInput.trim(), description: storeDescInput.trim() })
      });
      if (res.ok) {
        alert('Store profile updated successfully!');
        await fetchStoreProfile();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update store settings.');
      }
    } catch (_) {
      alert('Network error while saving settings.');
    }
  };

  // Handle Add Staff
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch('/api/seller/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: newStaffEmail.trim(),
          fullName: newStaffName.trim(),
          jobTitle: newStaffRole,
          permissions: ['view:products', 'view:orders', 'view:inventory']
        })
      });
      if (res.ok) {
        alert('Staff member invitation created.');
        setNewStaffName('');
        setNewStaffEmail('');
        await fetchSellerStaff();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add staff member.');
      }
    } catch (_) {}
  };

  const lowStockItems = sellerProducts.filter(p => p.stock <= 10);

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 flex flex-col md:flex-row antialiased overflow-x-hidden">
      {/* MOBILE SELLER HEADER (< md) */}
      <div className="md:hidden bg-gray-900 border-b border-white/10 p-4 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-black text-gray-950 text-base shadow-glow">
              Z
            </div>
            <div>
              <h2 className="font-black text-white text-sm tracking-tight leading-none">
                Zibon<span className="text-primary">baba</span> <span className="text-[10px] text-yellow-400 font-bold uppercase">Seller</span>
              </h2>
              <span className="text-[9px] text-slate-400 font-semibold truncate block max-w-[140px]">
                {storeInfo?.name || 'My Store'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-[10px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/5"
            >
              Marketplace
            </Link>
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/seller/login';
              }}
              className="text-[10px] font-bold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Tab Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'products', label: `Products (${sellerProducts.length})`, icon: Package },
            { id: 'orders', label: `Orders (${sellerOrders.length})`, icon: ShoppingBag },
            { id: 'wallet', label: 'Wallet', icon: Wallet },
            { id: 'staff', label: 'Staff', icon: Users },
            { id: 'settings', label: 'Settings', icon: Store }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SellerTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-gray-950 font-black shadow-glow'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DESKTOP SIDEBAR NAVIGATION (>= md) */}
      <aside className="hidden md:flex w-64 bg-gray-900 border-r border-white/10 p-5 flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-gray-950 text-xl shadow-glow">
              Z
            </div>
            <div>
              <h2 className="font-black text-white text-base tracking-tight leading-none">
                Zibon<span className="text-primary">baba</span>
              </h2>
              <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider block mt-1">
                Seller Center
              </span>
            </div>
          </div>

          {/* Store Info Mini Badge */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Active Store</span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${storeInfo?.isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {storeInfo?.isApproved ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>
            <p className="text-xs font-bold text-white mt-1 truncate">{storeInfo?.name || 'My Seller Store'}</p>
            {storeInfo?.id && (
              <Link
                href={`/store/${storeInfo.id}`}
                target="_blank"
                className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1 font-semibold"
              >
                View Public Store <ExternalLink size={10} />
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-bold">
            {[
              { id: 'analytics', label: 'Store Analytics', icon: TrendingUp },
              { id: 'products', label: `Products (${sellerProducts.length})`, icon: Package },
              { id: 'orders', label: `Orders (${sellerOrders.length})`, icon: ShoppingBag },
              { id: 'wallet', label: 'Wallet & Payouts', icon: Wallet },
              { id: 'staff', label: 'Staff Roles', icon: Users },
              { id: 'settings', label: 'Store Settings', icon: Store }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SellerTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-gray-950 font-black shadow-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-2 pt-6 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Marketplace
          </Link>
          <button
            onClick={async () => {
              await logout();
              window.location.href = '/seller/login';
            }}
            className="w-full flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer font-bold"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 min-w-0">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {activeTab === 'analytics' && 'Store Performance & Analytics'}
              {activeTab === 'products' && 'Product Inventory Management'}
              {activeTab === 'orders' && 'Order Processing Queue'}
              {activeTab === 'wallet' && 'Seller Escrow Wallet'}
              {activeTab === 'staff' && 'Store Staff & Roles'}
              {activeTab === 'settings' && 'Store Configuration'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Store ID: <span className="font-mono text-primary">{storeInfo?.id || 'Pending Store ID'}</span> | Commission: <span className="text-emerald-400 font-bold">{storeInfo?.commissionRate || 8.5}%</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchStoreProfile();
                fetchSellerProducts();
                fetchSellerOrders();
                fetchSellerWallet();
                fetchSellerAnalytics();
              }}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Sync Store Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Pending Verification Banner */}
        {storeInfo && !storeInfo.isApproved && (
          <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3 text-yellow-300 text-xs animate-fade-in">
            <Clock className="w-5 h-5 shrink-0 mt-0.5 text-yellow-400" />
            <div>
              <h4 className="font-bold text-sm text-yellow-400 mb-1">Store Application Under Review</h4>
              <p className="text-gray-300 leading-relaxed">
                Welcome to Zibonbaba! Your store application is currently in <span className="text-yellow-400 font-bold">Pending Admin Verification</span>. You can prepare your product catalog and store settings now. Your products will automatically publish live to millions of buyers once verified.
              </p>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
                <h4 className="text-2xl font-black text-white mt-1 text-emerald-400">৳{earnings.toLocaleString()}</h4>
                <span className="text-[9px] text-slate-500 mt-1 block">Settled net escrow</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Store Orders</span>
                <h4 className="text-2xl font-black text-white mt-1 text-blue-400">{sellerOrders.length}</h4>
                <span className="text-[9px] text-slate-500 mt-1 block">Lifecycle transactions</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog SKUs</span>
                <h4 className="text-2xl font-black text-white mt-1 text-primary">{sellerProducts.length}</h4>
                <span className="text-[9px] text-slate-500 mt-1 block">Registered items</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
                <h4 className="text-2xl font-black text-white mt-1 text-rose-400">{lowStockItems.length}</h4>
                <span className="text-[9px] text-slate-500 mt-1 block">Items under 10 stock</span>
              </div>
            </div>

            {/* Monthly Performance Chart */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3 mb-4">
                Monthly Store GMV Performance
              </h3>
              {monthlyGMV.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-44 text-slate-500 text-xs">
                  <TrendingUp className="w-8 h-8 text-slate-600 mb-2" />
                  <p>No historical sales recorded yet. New sales will appear here automatically.</p>
                </div>
              ) : (
                <div className="flex items-end gap-4 h-44 pt-4">
                  {(() => {
                    const maxVal = Math.max(...monthlyGMV.map(d => d.value), 1);
                    return monthlyGMV.map((d, i) => {
                      const pct = (d.value / maxVal) * 100;
                      return (
                        <div key={i} className="flex-grow flex flex-col items-center gap-2 group">
                          <span className="text-[9px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            ৳{d.value.toLocaleString()}
                          </span>
                          <div
                            className="w-full rounded-t-lg bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-all duration-300"
                            style={{ height: `${Math.max(pct, 4)}%` }}
                          />
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase">{d.month}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-bold">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-bold">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product List */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    Your Store Products ({sellerProducts.length})
                  </h3>
                  <button onClick={fetchSellerProducts} className="text-primary text-xs flex items-center gap-1 font-bold hover:underline">
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>

                {sellerProducts.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">No products registered in this store yet.</p>
                    <p className="text-[11px] text-slate-500">Fill in the form on the right to register your first product SKU.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold">
                          <th className="py-2.5 px-3">Photo</th>
                          <th className="py-2.5 px-3">SKU</th>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3">Price</th>
                          <th className="py-2.5 px-3 text-center">Stock</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                        {sellerProducts.map(p => (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                                    }}
                                  />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-primary">{p.sku}</td>
                            <td className="py-3 px-3 text-white font-bold max-w-[180px] truncate" title={p.name}>{p.name}</td>
                            <td className="py-3 px-3 font-bold">৳{p.price.toLocaleString()}</td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                p.stock > 10 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              }`}>
                                {p.stock} units
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1.5 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-lg text-slate-400 transition cursor-pointer"
                                  title="Edit Product & Photo"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProductItem(p.id)}
                                  className="p-1.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-slate-400 transition cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add Product Form */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3 flex items-center justify-between">
                  <span>Add New Product SKU</span>
                  <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                    <Camera className="w-3 h-3" /> With Photo
                  </span>
                </h3>
                <form onSubmit={handleAddProduct} className="space-y-3 text-xs font-bold">
                  {/* PRODUCT IMAGE UPLOAD SECTION */}
                  <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-300 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-primary" />
                        <span>Product Photo</span>
                      </label>
                      <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                        <button
                          type="button"
                          onClick={() => setProdImageUploadMode('upload')}
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                            prodImageUploadMode === 'upload' ? 'bg-primary text-gray-950 shadow-sm' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdImageUploadMode('url')}
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                            prodImageUploadMode === 'url' ? 'bg-primary text-gray-950 shadow-sm' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Image URL
                        </button>
                      </div>
                    </div>

                    {/* Image Preview or Dropzone */}
                    {newProdImage ? (
                      <div className="relative group rounded-xl overflow-hidden border border-emerald-500/30 bg-white/5 p-2 flex items-center gap-3">
                        <img
                          src={newProdImage}
                          alt="Uploaded Preview"
                          className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Photo Attached</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{newProdImage}</p>
                          <button
                            type="button"
                            onClick={() => {
                              if (addImageFileInputRef.current) addImageFileInputRef.current.value = '';
                              addImageFileInputRef.current?.click();
                            }}
                            className="text-[10px] text-primary hover:underline font-bold mt-1 inline-block cursor-pointer"
                          >
                            Replace photo
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewProdImage('');
                            setNewProdImages([]);
                            if (addImageFileInputRef.current) addImageFileInputRef.current.value = '';
                          }}
                          className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg transition-colors cursor-pointer"
                          title="Remove Photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {prodImageUploadMode === 'upload' ? (
                          <div
                            onClick={() => addImageFileInputRef.current?.click()}
                            className={`border-2 border-dashed border-white/15 hover:border-primary/50 hover:bg-white/5 rounded-xl p-4 text-center cursor-pointer transition-all ${
                              isUploadingProdImage ? 'opacity-50 pointer-events-none' : ''
                            }`}
                          >
                            <input
                              ref={addImageFileInputRef}
                              type="file"
                              accept="image/png, image/jpeg, image/webp, image/gif"
                              onChange={handleImageFileSelected}
                              className="hidden"
                            />
                            {isUploadingProdImage ? (
                              <div className="flex flex-col items-center gap-2 text-slate-400 py-1">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="text-[11px] font-bold">Uploading product image...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1.5 text-slate-400 py-1">
                                <Upload className="w-6 h-6 text-primary mb-0.5" />
                                <p className="text-[11px] font-bold text-white">Click or Drop Photo Here</p>
                                <span className="text-[9px] text-slate-500">Supports JPG, PNG, WEBP (Max 5MB)</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="relative">
                              <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                              <input
                                type="url"
                                placeholder="https://example.com/product-image.jpg"
                                value={newProdImage}
                                onChange={e => setNewProdImage(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white text-xs outline-none focus:border-primary"
                              />
                            </div>
                            <span className="text-[9px] text-slate-500 block">Paste any public web image URL or CDN link</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wireless Noise Canceling Headphones"
                      value={newProdName}
                      onChange={e => setNewProdName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">Price (৳) *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        placeholder="2500"
                        value={newProdPrice}
                        onChange={e => setNewProdPrice(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">SKU Code</label>
                      <input
                        type="text"
                        placeholder="AUTO-GEN"
                        value={newProdSKU}
                        onChange={e => setNewProdSKU(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">Category</label>
                      <select
                        value={newProdCategory}
                        onChange={e => setNewProdCategory(e.target.value)}
                        className="w-full bg-gray-900 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                      >
                        {['Electronics & Gadgets', 'Apparel & Fashion', 'Health & Beauty', 'Home & Kitchen', 'Groceries & Pantry', 'Books & Stationery', 'General Retail'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">Initial Stock</label>
                      <input
                        type="number"
                        value={newProdStock}
                        onChange={e => setNewProdStock(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={newProdDesc}
                      onChange={e => setNewProdDesc(e.target.value)}
                      placeholder="Product features, specifications, and warranty details..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingProd || isUploadingProdImage}
                    className="w-full bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black py-3 rounded-xl transition-all shadow-glow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmittingProd ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing SKU...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Publish Product to Store</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
                Store Order Dispatch Queue ({sellerOrders.length})
              </h3>
              <button onClick={fetchSellerOrders} className="text-primary text-xs flex items-center gap-1 font-bold hover:underline">
                <RefreshCw className="w-3 h-3" /> Sync Orders
              </button>
            </div>

            {sellerOrders.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No customer orders received for your store yet.</p>
                <p className="text-[11px] text-slate-500">Orders placed by customers for your products will appear here in real time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold">
                      <th className="py-2.5 px-3">Order Ref</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Subtotal</th>
                      <th className="py-2.5 px-3">Payout (Net)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Update Lifecycle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                    {sellerOrders.map(o => (
                      <tr key={o.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-primary">{o.id}</td>
                        <td className="py-3.5 px-3">
                          <p className="text-white font-bold flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-emerald-400" />
                            {o.customerName || 'Verified Buyer'}
                          </p>
                          <span className="text-[9px] text-emerald-400/80 font-mono">Customer Privacy Protected</span>
                        </td>
                        <td className="py-3.5 px-3 font-bold">৳{o.subTotal.toLocaleString()}</td>
                        <td className="py-3.5 px-3 font-bold text-emerald-400">৳{o.sellerPayout.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                            o.status === 'DELIVERED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            o.status === 'CANCELLED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                            'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className="bg-gray-900 border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg outline-none cursor-pointer"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="DISPATCHED">DISPATCHED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* WALLET TAB */}
        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">
                  Settled Escrow Balance
                </span>
                <h3 className="text-3xl font-black text-white">৳{earnings.toLocaleString()} BDT</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Gross Sales: ৳{totalGrossSales.toLocaleString()} | Platform Commission: {storeInfo?.commissionRate || 8.5}%. Withdrawals are transferred directly to your bank account after verification.
                </p>
              </div>

              <form onSubmit={handleRequestWithdraw} className="flex gap-2 max-w-sm pt-2">
                <input
                  type="number"
                  required
                  placeholder="Withdraw amount (৳)..."
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary w-full"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-accent text-gray-950 font-black text-xs px-5 rounded-xl transition-all shadow-glow cursor-pointer whitespace-nowrap"
                >
                  Request Payout
                </button>
              </form>
            </div>

            {/* Withdrawal logs */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl space-y-3.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">
                Payout Requests History
              </h4>
              {withdraws.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No withdrawal requests recorded yet.</p>
              ) : (
                <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1">
                  {withdraws.map(w => (
                    <div key={w.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono text-[9px] text-primary block">{w.id}</span>
                        <span className="text-white font-bold mt-0.5 block">৳{w.amount.toLocaleString()}</span>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                        w.status === 'COMPLETED' || w.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      }`}>
                        {w.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3">
                Active Store Staff Members ({staffList.length})
              </h3>
              {staffList.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No staff members invited yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {staffList.map(stf => (
                    <div key={stf.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-black text-white">{stf.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Role: {stf.role} | Permissions: {stf.permissions}</p>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                        {stf.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3">
                Invite Staff Member
              </h3>
              <form onSubmit={handleAddStaff} className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Staff Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Staff Email Address</label>
                  <input
                    type="email"
                    required
                    value={newStaffEmail}
                    onChange={e => setNewStaffEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Designation</label>
                  <select
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value)}
                    className="w-full bg-gray-900 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  >
                    <option value="Store Manager">Store Manager</option>
                    <option value="Inventory Staff">Inventory Staff</option>
                    <option value="Sales Staff">Sales Staff</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black py-3 rounded-xl transition-all shadow-glow cursor-pointer"
                >
                  Generate Invitation
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl max-w-xl space-y-4 animate-fade-in">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3">
              Store Profile & Identity
            </h3>
            <form onSubmit={handleSaveStoreSettings} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={storeNameInput}
                  onChange={e => setStoreNameInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Store Description</label>
                <textarea
                  rows={3}
                  value={storeDescInput}
                  onChange={e => setStoreDescInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black py-3 rounded-xl transition-all shadow-glow cursor-pointer"
              >
                Save Store Settings
              </button>
            </form>
          </div>
        )}

        {/* EDIT PRODUCT MODAL */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full relative space-y-4">
              <button
                onClick={() => setEditingProduct(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Edit SKU: {editingProduct.sku}
              </h3>
              <form onSubmit={handleSaveEditProduct} className="space-y-3 text-xs font-bold">
                {/* EDIT PRODUCT IMAGE UPLOAD SECTION */}
                <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-300 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      <span>Product Photo</span>
                    </label>
                    <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditProdImageUploadMode('upload')}
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                          editProdImageUploadMode === 'upload' ? 'bg-primary text-gray-950 shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditProdImageUploadMode('url')}
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                          editProdImageUploadMode === 'url' ? 'bg-primary text-gray-950 shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {editProdImage ? (
                    <div className="relative group rounded-xl overflow-hidden border border-emerald-500/30 bg-white/5 p-2 flex items-center gap-3">
                      <img
                        src={editProdImage}
                        alt="Product Photo"
                        className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Photo Linked</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{editProdImage}</p>
                        <button
                          type="button"
                          onClick={() => {
                            if (editImageFileInputRef.current) editImageFileInputRef.current.value = '';
                            editImageFileInputRef.current?.click();
                          }}
                          className="text-[10px] text-primary hover:underline font-bold mt-1 inline-block cursor-pointer"
                        >
                          Change photo
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditProdImage('');
                          setEditProdImages([]);
                          if (editImageFileInputRef.current) editImageFileInputRef.current.value = '';
                        }}
                        className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg transition-colors cursor-pointer"
                        title="Remove Photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      {editProdImageUploadMode === 'upload' ? (
                        <div
                          onClick={() => editImageFileInputRef.current?.click()}
                          className={`border-2 border-dashed border-white/15 hover:border-primary/50 hover:bg-white/5 rounded-xl p-3 text-center cursor-pointer transition-all ${
                            isUploadingEditImage ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          <input
                            ref={editImageFileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/webp, image/gif"
                            onChange={handleEditImageFileSelected}
                            className="hidden"
                          />
                          {isUploadingEditImage ? (
                            <div className="flex flex-col items-center gap-1.5 text-slate-400 py-1">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              <span className="text-[10px] font-bold">Uploading new image...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-400 py-1">
                              <Upload className="w-5 h-5 text-primary mb-0.5" />
                              <p className="text-[10px] font-bold text-white">Click or Drop New Photo</p>
                              <span className="text-[8px] text-slate-500">Supports JPG, PNG, WEBP</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="relative">
                            <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                            <input
                              type="url"
                              placeholder="https://example.com/product-image.jpg"
                              value={editProdImage}
                              onChange={e => setEditProdImage(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-white text-xs outline-none focus:border-primary"
                            />
                          </div>
                          <span className="text-[8px] text-slate-500 block">Enter web image URL</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Price (৳)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={editPrice}
                      onChange={e => setEditPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Stock Units</label>
                    <input
                      type="number"
                      required
                      value={editStock}
                      onChange={e => setEditStock(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none resize-none"
                  />
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 bg-white/5 text-slate-300 font-bold py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingEditImage}
                    className="flex-1 bg-primary hover:bg-primary-accent text-gray-950 font-black py-2.5 rounded-xl transition-all shadow-glow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingEditImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
