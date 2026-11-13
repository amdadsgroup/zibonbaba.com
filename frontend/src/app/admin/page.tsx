'use strict';
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { isNonCustomerRole } from '@/utils/roleRoutes';

import AdminLayout from '@/components/admin/admin-layout';
import {
  AdminModule,
  DateRange,
  KPIStats,
  VendorItem,
  CustomerItem,
  ProductItem,
  CategoryItem,
  BrandItem,
  OrderItem,
  CommissionItem,
  PaymentItem,
  ReviewItem,
  CampaignItem,
  CouponItem,
  BannerItem,
  AdminUserItem,
  AuditLogItem,
  SecuritySessionItem
} from '@/components/admin/types';

// Admin Modules
import DashboardModule from '@/components/admin/modules/dashboard-module';
import VendorModule from '@/components/admin/modules/vendor-module';
import CustomerModule from '@/components/admin/modules/customer-module';
import ProductModule from '@/components/admin/modules/product-module';
import ProductApprovalModule from '@/components/admin/modules/product-approval-module';
import CategoryModule from '@/components/admin/modules/category-module';
import BrandModule from '@/components/admin/modules/brand-module';
import OrderModule from '@/components/admin/modules/order-module';
import CommissionModule from '@/components/admin/modules/commission-module';
import PaymentModule from '@/components/admin/modules/payment-module';
import ReviewModule from '@/components/admin/modules/review-module';
import MarketingModule from '@/components/admin/modules/marketing-module';
import { AdminUsersModule } from '@/components/admin/modules/admin-users-module';
import { RBACModule } from '@/components/admin/modules/rbac-module';
import { ReportsModule } from '@/components/admin/modules/reports-module';
import { AuditModule } from '@/components/admin/modules/audit-module';
import { SecurityModule } from '@/components/admin/modules/security-module';
import { NotificationModule } from '@/components/admin/modules/notification-module';
import { SettingsModule } from '@/components/admin/modules/settings-module';
import { FuturePreviewModule } from '@/components/admin/modules/future-preview-module';

import { Loader2 } from 'lucide-react';

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get('tab') as AdminModule) || 'dashboard';

  const { token, isLoggedIn, role, username, logout } = useStore();

  const [activeModule, setActiveModule] = useState<AdminModule>(tabParam);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string }>({
    name: username || 'Administrator',
    email: 'admin@zibonbaba.com',
    role: role || 'SUPER_ADMIN'
  });

  // Enterprise State Entities
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [sessions, setSessions] = useState<SecuritySessionItem[]>([]);

  // Synced URL handler
  const handleSelectModule = useCallback((mod: AdminModule) => {
    setActiveModule(mod);
    router.replace(`/admin?tab=${mod}`, { scroll: false });
  }, [router]);

  // Keep state synced if URL changes
  useEffect(() => {
    if (tabParam && tabParam !== activeModule) {
      setActiveModule(tabParam);
    }
  }, [tabParam, activeModule]);

  // 1. Authentication Verification
  useEffect(() => {
    let localRole = role;
    let localToken = token;
    let localName = username;
    let localEmail = 'admin@zibonbaba.com';

    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('zibonbaba_token');
      const storedUser = localStorage.getItem('zibonbaba_user');
      if (storedToken) localToken = storedToken;
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          localRole = parsed.role || localRole;
          localName = parsed.profile?.fullName || parsed.username || localName;
          localEmail = parsed.email || localEmail;
        } catch (_) {}
      }
    }

    if (!localToken || !isNonCustomerRole(localRole)) {
      router.push('/admin/login');
      return;
    }

    setAdminUser({
      name: localName || 'Admin',
      email: localEmail,
      role: localRole || 'SUPER_ADMIN'
    });
    setAuthChecked(true);
  }, [isLoggedIn, role, token, username, router]);

  // 2. Fetch Backend Data
  const fetchData = useCallback(async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;

    const headers = { Authorization: `Bearer ${activeToken}` };

    try {
      setLoading(true);

      // Parallel Fetch
      const [
        sellersRes,
        usersRes,
        productsRes,
        ordersRes,
        categoriesRes,
        couponsRes,
        logsRes
      ] = await Promise.allSettled([
        fetch('/api/admin/sellers', { headers }).then(r => r.ok ? r.json() : null),
        fetch('/api/admin/users', { headers }).then(r => r.ok ? r.json() : null),
        fetch('/api/admin/products', { headers }).then(r => r.ok ? r.json() : null),
        fetch('/api/admin/orders', { headers }).then(r => r.ok ? r.json() : null),
        fetch('/api/categories').then(r => r.ok ? r.json() : null),
        fetch('/api/admin/coupons', { headers }).then(r => r.ok ? r.json() : null),
        fetch('/api/admin/audit-logs', { headers }).then(r => r.ok ? r.json() : null)
      ]);

      // Normalize Sellers / Vendors
      if (sellersRes.status === 'fulfilled' && sellersRes.value?.sellers) {
        const mappedVendors: VendorItem[] = sellersRes.value.sellers.map((s: any) => ({
          id: s.id,
          name: s.owner?.profile?.fullName || s.name,
          storeName: s.name,
          ownerName: s.owner?.profile?.fullName || 'Proprietor',
          email: s.owner?.email || 'vendor@store.com',
          phone: s.owner?.phone || s.phone || 'N/A',
          productsCount: s._count?.products || 0,
          ordersCount: s._count?.orders || 0,
          revenue: s.orders?.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0) || 0,
          rating: s.rating || 4.9,
          commissionRate: parseFloat(s.commissionRate || '8.5'),
          status: s.isApproved ? 'APPROVED' : 'PENDING',
          isApproved: !!s.isApproved,
          createdAt: s.createdAt || new Date().toISOString()
        }));
        setVendors(mappedVendors);
      }

      // Normalize Users (Customers & Staff)
      if (usersRes.status === 'fulfilled' && usersRes.value?.users) {
        const allUsers = usersRes.value.users;
        const custs: CustomerItem[] = allUsers
          .filter((u: any) => u.role === 'CUSTOMER')
          .map((u: any) => ({
            id: u.id,
            name: u.profile?.fullName || u.email?.split('@')[0] || 'Customer',
            email: u.email,
            phone: u.phone || 'N/A',
            ordersCount: u._count?.orders || 0,
            totalSpent: u.orders?.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0) || 0,
            status: u.status || 'ACTIVE',
            walletBalance: u.walletBalance || 0,
            loyaltyPoints: u.loyaltyPoints || 0,
            joinedDate: u.createdAt || new Date().toISOString()
          }));
        setCustomers(custs);

        const staff: AdminUserItem[] = allUsers
          .filter((u: any) => isNonCustomerRole(u.role))
          .map((u: any) => ({
            id: u.id,
            name: u.profile?.fullName || u.email?.split('@')[0] || 'Administrator',
            email: u.email,
            phone: u.phone || 'N/A',
            role: u.role,
            status: u.status || 'ACTIVE',
            createdAt: u.createdAt || new Date().toISOString()
          }));
        setAdminUsers(staff);
      }

      // Normalize Products
      if (productsRes.status === 'fulfilled' && productsRes.value?.products) {
        const mappedProducts: ProductItem[] = productsRes.value.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku || `ZB-${p.id.slice(0, 6).toUpperCase()}`,
          vendorName: p.store?.name || 'Zibonbaba Direct',
          storeId: p.storeId,
          categoryName: p.category?.name || 'General',
          price: p.price,
          stock: p.stock || 0,
          salesCount: p.salesCount || 0,
          status: p.status || (p.isApproved ? 'PUBLISHED' : 'PENDING_APPROVAL'),
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
          createdAt: p.createdAt || new Date().toISOString(),
          rejectionReason: p.rejectionReason
        }));
        setProducts(mappedProducts);
      }

      // Normalize Orders
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders) {
        const mappedOrders: OrderItem[] = ordersRes.value.orders.map((o: any) => ({
          id: o.id,
          customerName: o.customer?.profile?.fullName || o.customer?.email || 'Valued Customer',
          customerEmail: o.customer?.email || 'customer@zibonbaba.com',
          customerPhone: o.customer?.phone || '+880 1700-000000',
          shippingAddress: o.shippingAddress || 'Dhaka Metro, Bangladesh',
          storeName: o.store?.name || 'Multi-Vendor Dispatch',
          itemsCount: o.items?.length || 1,
          total: o.total || 0,
          subTotal: o.subTotal || o.total || 0,
          shippingFee: o.shippingFee || 100,
          paymentMethod: o.paymentMethod || 'COD',
          paymentStatus: o.paymentStatus || 'PENDING',
          status: o.status || 'CONFIRMED',
          createdAt: o.createdAt || new Date().toISOString()
        }));
        setOrders(mappedOrders);
      }

      // Normalize Categories
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.categories) {
        setCategories(categoriesRes.value.categories);
      }

      // Normalize Coupons
      if (couponsRes.status === 'fulfilled' && couponsRes.value?.coupons) {
        setCoupons(couponsRes.value.coupons);
      }

      // Normalize Audit Logs
      if (logsRes.status === 'fulfilled' && logsRes.value?.logs) {
        setAuditLogs(logsRes.value.logs);
      }

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authChecked) {
      fetchData();
    }
  }, [authChecked, fetchData]);

  // Real-time synchronization
  useEffect(() => {
    const handleSync = () => {
      fetchData();
    };

    window.addEventListener('zibonbaba:order-sync', handleSync);
    window.addEventListener('zibonbaba:product-sync', handleSync);
    window.addEventListener('zibonbaba:sync', handleSync);

    return () => {
      window.removeEventListener('zibonbaba:order-sync', handleSync);
      window.removeEventListener('zibonbaba:product-sync', handleSync);
      window.removeEventListener('zibonbaba:sync', handleSync);
    };
  }, [fetchData]);

  // Derived KPI Stats
  const kpiStats: KPIStats = {
    totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    revenueGrowth: 18.4,
    totalOrders: orders.length,
    ordersGrowth: 12.1,
    totalCustomers: customers.length,
    newCustomers: Math.round(customers.length * 0.25),
    totalVendors: vendors.length,
    pendingVendors: vendors.filter(v => v.status === 'PENDING').length,
    totalProducts: products.length,
    pendingProducts: products.filter(p => p.status === 'PENDING_APPROVAL').length,
    platformCommission: Math.round(orders.reduce((sum, o) => sum + (o.total || 0), 0) * 0.085),
    commissionGrowth: 21.0
  };

  // --- ACTION HANDLERS ---
  const handleApproveVendor = async (vendorId: string) => {
    const activeToken = token || localStorage.getItem('zibonbaba_token');
    try {
      const res = await fetch(`/api/admin/sellers/${vendorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({ isApproved: true })
      });
      if (res.ok) {
        setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: 'APPROVED', isApproved: true } : v));
      }
    } catch (err) {
      console.error('Failed to approve vendor:', err);
    }
  };

  const handleRejectVendor = async (vendorId: string, reason: string) => {
    const activeToken = token || localStorage.getItem('zibonbaba_token');
    try {
      const res = await fetch(`/api/admin/sellers/${vendorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({ isApproved: false, rejectionReason: reason })
      });
      if (res.ok) {
        setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: 'REJECTED', isApproved: false } : v));
      }
    } catch (err) {
      console.error('Failed to reject vendor:', err);
    }
  };

  const handleUpdateProductStatus = async (productId: string, status: string, rejectionReason?: string) => {
    const activeToken = token || localStorage.getItem('zibonbaba_token');
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({ id: productId, status, rejectionReason })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: status as any, rejectionReason } : p));
      }
    } catch (err) {
      console.error('Failed to update product status:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const activeToken = token || localStorage.getItem('zibonbaba_token');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({ id: orderId, status })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleAddCategory = async (cat: Partial<CategoryItem>) => {
    const activeToken = token || localStorage.getItem('zibonbaba_token');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify(cat)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.category) {
          setCategories(prev => [...prev, data.category]);
        }
      }
    } catch (err) {
      console.error('Failed to add category:', err);
    }
  };

  const handleAddAdminUser = async (user: Partial<AdminUserItem>) => {
    const activeToken = token || localStorage.getItem('zibonbaba_token');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify(user)
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add admin user:', err);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFC107]" />
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Verifying Administrative Security Clearance...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      activeModule={activeModule}
      onSelectModule={handleSelectModule}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      adminUser={adminUser}
      onLogout={() => {
        logout();
        router.push('/admin/login');
      }}
      pendingApprovalsCount={kpiStats.pendingVendors + kpiStats.pendingProducts}
      pendingOrdersCount={orders.filter(o => o.status === 'PENDING').length}
    >
      {/* Dynamic Module Rendering */}
      {activeModule === 'dashboard' && (
        <DashboardModule
          stats={kpiStats}
          isLoading={loading}
          recentOrders={orders}
          topVendors={vendors}
          onNavigate={(target: any) => handleSelectModule(target as AdminModule)}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}

      {(activeModule === 'vendors' || activeModule === 'stores') && (
        <VendorModule
          vendors={vendors}
          isLoading={loading}
          onApproveVendor={handleApproveVendor}
          onRejectVendor={handleRejectVendor}
          onSuspendVendor={async (id, reason) => handleRejectVendor(id, reason)}
          onRefresh={fetchData}
        />
      )}

      {activeModule === 'customers' && (
        <CustomerModule
          customers={customers}
          isLoading={loading}
          onToggleCustomerStatus={async (id, currentStatus) => {}}
          onResetPassword={async (id, email) => {}}
          onRefresh={fetchData}
        />
      )}

      {activeModule === 'products' && (
        <ProductModule
          products={products}
          categories={categories.map(c => c.name)}
          isLoading={loading}
          onUpdateProduct={async (id, data) => handleUpdateProductStatus(id, data.status || 'PUBLISHED')}
          onCreateProduct={async (data) => {}}
          onDeleteProduct={async (id) => {}}
          onRefresh={fetchData}
        />
      )}

      {activeModule === 'product-approval' && (
        <ProductApprovalModule
          pendingProducts={products.filter(p => p.status === 'PENDING_APPROVAL')}
          isLoading={loading}
          onApprove={async (id: string) => handleUpdateProductStatus(id, 'PUBLISHED')}
          onReject={async (id: string, reason: string) => handleUpdateProductStatus(id, 'REJECTED', reason)}
          onRefresh={fetchData}
        />
      )}

      {activeModule === 'categories' && (
        <CategoryModule
          categories={categories}
          isLoading={loading}
          onCreateCategory={handleAddCategory}
          onDeleteCategory={async (id) => {}}
          onRefresh={fetchData}
        />
      )}

      {activeModule === 'brands' && (
        <BrandModule
          brands={brands}
          categories={categories.map(c => c.name)}
          isLoading={loading}
          onRefresh={fetchData}
        />
      )}

      {(activeModule === 'orders' || activeModule === 'refunds') && (
        <OrderModule
          orders={orders}
          isLoading={loading}
          onUpdateStatus={handleUpdateOrderStatus}
          onRefresh={fetchData}
        />
      )}

      {activeModule === 'commissions' && (
        <CommissionModule
          categories={categories}
          vendors={vendors}
          isLoading={loading}
          onRefresh={fetchData}
        />
      )}

      {activeModule === 'payments' && (
        <PaymentModule
          payments={payments}
          isLoading={loading}
          onRefresh={fetchData}
        />
      )}

      {activeModule === 'reviews' && (
        <ReviewModule
          reviews={reviews}
          isLoading={loading}
          onRefresh={fetchData}
        />
      )}

      {(activeModule === 'campaigns' || activeModule === 'coupons' || activeModule === 'flash-sales' || activeModule === 'banners') && (
        <MarketingModule
          categories={categories.map(c => c.name)}
        />
      )}

      {activeModule === 'admin-users' && (
        <AdminUsersModule
          adminUsers={adminUsers}
          onAddUser={handleAddAdminUser}
        />
      )}

      {activeModule === 'roles' && (
        <RBACModule />
      )}

      {activeModule === 'reports' && (
        <ReportsModule
          orders={orders}
          vendors={vendors}
          customers={customers}
          products={products}
        />
      )}

      {activeModule === 'audit' && (
        <AuditModule
          logs={auditLogs}
        />
      )}

      {activeModule === 'security' && (
        <SecurityModule
          sessions={sessions}
        />
      )}

      {activeModule === 'notifications' && (
        <NotificationModule />
      )}

      {activeModule === 'settings' && (
        <SettingsModule />
      )}

      {activeModule === 'future' && (
        <FuturePreviewModule />
      )}
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFC107]" />
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
