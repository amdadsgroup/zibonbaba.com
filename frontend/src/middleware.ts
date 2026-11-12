import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract user role and token from cookies
  const token = request.cookies.get('zibonbaba_token')?.value || null;
  let role = request.cookies.get('zibonbaba_role')?.value || null;

  if (!role) {
    const userCookie = request.cookies.get('zibonbaba_user')?.value;
    if (userCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userCookie));
        role = parsed.role || null;
      } catch (_) {}
    }
  }

  const normalizedRole = role ? role.trim().toUpperCase() : null;
  const isAdminRole = normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN';
  const isSellerRole = normalizedRole === 'VENDOR_ADMIN' || normalizedRole === 'VENDOR_STAFF' || normalizedRole === 'SELLER' || normalizedRole === 'VENDOR';
  const isResellerRole = normalizedRole === 'RESELLER';
  const isDeliveryRole = normalizedRole === 'DELIVERY_MAN' || normalizedRole === 'DELIVERYMAN' || normalizedRole === 'COURIER' || normalizedRole === 'DELIVERY_MANAGER';

  // 1. ADMIN PORTAL ROUTE PROTECTION
  if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
    // Allow access to the private admin login page
    if (pathname === '/admin/login') {
      // If already logged in as admin, send directly to admin dashboard
      if (token && isAdminRole) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Require token and admin role for all other admin routes
    if (!token || !isAdminRole) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. SELLER PORTAL ROUTE PROTECTION
  if (pathname.startsWith('/seller')) {
    const publicSellerPaths = ['/seller/login', '/seller/register', '/seller/forgot-password'];
    const isPublicSellerPath = publicSellerPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));

    if (isPublicSellerPath) {
      if (token && isSellerRole) {
        return NextResponse.redirect(new URL('/seller', request.url));
      }
      return NextResponse.next();
    }

    // Require token and seller role for seller dashboard / subpages
    if (!token || (!isSellerRole && !isAdminRole)) {
      return NextResponse.redirect(new URL('/seller/login', request.url));
    }
  }

  // 3. RESELLER PORTAL ROUTE PROTECTION
  if (pathname.startsWith('/reseller')) {
    const publicResellerPaths = ['/reseller/login', '/reseller/register', '/reseller/forgot-password'];
    const isPublicResellerPath = publicResellerPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));

    if (isPublicResellerPath) {
      if (token && isResellerRole) {
        return NextResponse.redirect(new URL('/reseller', request.url));
      }
      return NextResponse.next();
    }

    // Require token and reseller role
    if (!token || (!isResellerRole && !isAdminRole)) {
      return NextResponse.redirect(new URL('/reseller/login', request.url));
    }
  }

  // 4. DELIVERY MAN PORTAL ROUTE PROTECTION
  if (pathname.startsWith('/delivery')) {
    const publicDeliveryPaths = ['/delivery/login', '/delivery/register', '/delivery/forgot-password'];
    const isPublicDeliveryPath = publicDeliveryPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));

    if (isPublicDeliveryPath) {
      if (token && isDeliveryRole) {
        return NextResponse.redirect(new URL('/delivery', request.url));
      }
      return NextResponse.next();
    }

    // Require token and delivery role
    if (!token || (!isDeliveryRole && !isAdminRole)) {
      return NextResponse.redirect(new URL('/delivery/login', request.url));
    }
  }

  // 5. CUSTOMER AUTH ROUTES (allow public access without redirect loops)
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/customer/login' ||
    pathname === '/customer/register'
  ) {
    return NextResponse.next();
  }

  // 5. CUSTOMER ACCOUNT AREA PROTECTION
  if (pathname.startsWith('/account')) {
    if (!token) {
      return NextResponse.redirect(new URL('/customer/login', request.url));
    }
  }

  // 6. STAFF PORTAL ROUTE PROTECTION
  if (pathname.startsWith('/staff')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
