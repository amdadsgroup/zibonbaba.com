export type AdminModule =
  | 'dashboard'
  | 'vendors'
  | 'stores'
  | 'customers'
  | 'products'
  | 'product-approval'
  | 'categories'
  | 'brands'
  | 'orders'
  | 'reviews'
  | 'payments'
  | 'commissions'
  | 'refunds'
  | 'campaigns'
  | 'coupons'
  | 'flash-sales'
  | 'banners'
  | 'notifications'
  | 'reports'
  | 'admin-users'
  | 'roles'
  | 'audit'
  | 'security'
  | 'settings'
  | 'future';

export type DateRange = 'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'custom';

export interface KPIStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  newCustomers: number;
  totalVendors: number;
  pendingVendors: number;
  totalProducts: number;
  pendingProducts: number;
  platformCommission: number;
  commissionGrowth: number;
}

export interface VendorItem {
  id: string;
  name: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  productsCount: number;
  ordersCount: number;
  revenue: number;
  rating: number;
  commissionRate: number;
  status: 'APPROVED' | 'PENDING' | 'UNDER_REVIEW' | 'REJECTED' | 'SUSPENDED';
  isApproved: boolean;
  createdAt: string;
  documents?: {
    tradeLicense?: string;
    nidCard?: string;
    taxCertificate?: string;
  };
  address?: string;
}

export interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED';
  walletBalance: number;
  loyaltyPoints: number;
  joinedDate: string;
  address?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  vendorName: string;
  storeId?: string;
  categoryName: string;
  price: number;
  stock: number;
  salesCount: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED' | 'OUT_OF_STOCK';
  image: string;
  description?: string;
  createdAt: string;
  rejectionReason?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parentName?: string | null;
  image?: string;
  productCount: number;
  commissionRate?: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  subcategories?: CategoryItem[];
}

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  categoryName?: string;
  productCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  websiteUrl?: string;
}

export interface OrderItem {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  storeName: string;
  itemsCount: number;
  total: number;
  subTotal: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  trackingNumber?: string;
  riderName?: string;
  createdAt: string;
  itemsList?: Array<{
    name: string;
    quantity: number;
    price: number;
    sku: string;
  }>;
}

export interface CommissionItem {
  id: string;
  entityType: 'GLOBAL' | 'CATEGORY' | 'VENDOR';
  entityName: string;
  rate: number;
  effectiveDate: string;
  grossVolume: number;
  platformEarnings: number;
  vendorEarnings: number;
}

export interface PaymentItem {
  id: string;
  transactionId: string;
  orderId: string;
  customerName: string;
  vendorName: string;
  amount: number;
  method: 'COD' | 'SSLCOMMERZ' | 'BKASH' | 'CARD' | 'MFS';
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  date: string;
}

export interface ReviewItem {
  id: string;
  customerName: string;
  productName: string;
  vendorName: string;
  rating: number;
  comment: string;
  status: 'APPROVED' | 'PENDING' | 'HIDDEN';
  date: string;
  response?: string;
}

export interface CampaignItem {
  id: string;
  title: string;
  type: 'CAMPAIGN' | 'FLASH_SALE' | 'SEASONAL';
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  startDate: string;
  endDate: string;
  targetCategory?: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DRAFT';
}

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DISABLED';
}

export interface BannerItem {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage: string;
  ctaText: string;
  targetUrl: string;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'ACTIVE' | 'DISABLED';
  lastLogin?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  details?: string;
}

export interface SecuritySessionItem {
  id: string;
  userEmail: string;
  role: string;
  ipAddress: string;
  device: string;
  loginTime: string;
  location: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

