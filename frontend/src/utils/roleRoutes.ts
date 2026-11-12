/**
 * Role Route Resolver & Dashboard Isolation Utility
 * Maps all 14 Zibonbaba system roles to their exact dedicated dashboard routes.
 */

export function getDashboardForRole(role?: string | null): string {
  if (!role) return '/login';
  
  const normalized = role.trim().toUpperCase();

  switch (normalized) {
    case 'SUPER_ADMIN':
      return '/superadmin';
    case 'ADMIN':
    case 'MARKETING':
      return '/admin';
    case 'MANAGER':
      return '/staff/manager';
    case 'ACCOUNTANT':
      return '/staff/accountant';
    case 'CUSTOMER_SUPPORT':
    case 'SUPPORT':
      return '/staff/support';
    case 'WAREHOUSE_MANAGER':
    case 'INVENTORY_MANAGER':
      return '/staff/warehouse';
    case 'DELIVERY_MANAGER':
      return '/staff/delivery';
    case 'VENDOR_ADMIN':
    case 'SELLER':
    case 'VENDOR':
      return '/seller';
    case 'VENDOR_STAFF':
      return '/seller/staff';
    case 'RESELLER':
      return '/reseller';
    case 'DELIVERY_MAN':
    case 'COURIER':
      return '/delivery';
    case 'CUSTOMER':
      return '/';
    default:
      return '/';
  }
}

/**
 * Returns true if the user is a non-customer staff/admin/vendor/courier/reseller
 * who should be restricted from viewing the customer shopping interface.
 */
export function isNonCustomerRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.trim().toUpperCase();
  return normalized !== 'CUSTOMER';
}

/**
 * Returns true if the given pathname is part of the customer shopping interface.
 */
export function isCustomerInterfaceRoute(pathname: string): boolean {
  if (!pathname) return false;
  
  // Exact homepage or customer storefront paths
  if (pathname === '/') return true;

  const customerPrefixes = [
    '/cart',
    '/checkout',
    '/product',
    '/wishlist',
    '/category',
    '/search',
    '/tracking'
  ];

  return customerPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Returns true if the given pathname belongs to an Admin, Seller, Superadmin, Staff, ERP, Delivery, or Reseller portal.
 */
export function isDashboardRoute(pathname: string): boolean {
  if (!pathname) return false;
  const dashboardPrefixes = [
    '/admin',
    '/superadmin',
    '/seller',
    '/staff',
    '/erp',
    '/delivery',
    '/reseller'
  ];
  return dashboardPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Determines whether the public website heading / header part (Navbar, MobileHeader, Footer)
 * should be hidden for admin/seller accounts or dashboard routes.
 */
export function shouldHideStorefrontHeader(pathname: string, role?: string | null, isLoggedIn?: boolean): boolean {
  if (isDashboardRoute(pathname)) return true;
  if (isLoggedIn && isNonCustomerRole(role)) return true;
  return false;
}

