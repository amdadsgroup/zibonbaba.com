import { headers, cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { ADMIN_ROLES, SELLER_ROLES, RESELLER_ROLES, DELIVERY_ROLES, AccountStatus } from '@/lib/constants/roles';

const JWT_SECRET = process.env.JWT_SECRET || 'zibonbaba_super_secure_jwt_session_secret_token_123';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  status?: string;
  fullName?: string;
}

export interface SellerContext {
  user: AuthUser;
  store: {
    id: string;
    name: string;
    isApproved: boolean;
    commissionRate: number;
    ownerId: string;
  } | null;
  isPending: boolean;
}

/**
 * Extracts, verifies, and validates the JWT token from incoming Request headers or cookies.
 * Also verifies account active status.
 */
export async function getAuthUser(req?: Request): Promise<AuthUser | null> {
  let token: string | null = null;

  if (req) {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/zibonbaba_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get('zibonbaba_token')?.value;
      if (cookieToken) token = cookieToken;
    } catch (_) {}
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.id && decoded.email) {
      // Check database to ensure user is not suspended or deleted
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, status: true }
      });

      if (!dbUser) return null;

      const userStatus = dbUser.status ? dbUser.status.toUpperCase() : 'ACTIVE';
      if (userStatus === AccountStatus.SUSPENDED || userStatus === AccountStatus.BLOCKED || userStatus === AccountStatus.DEACTIVATED) {
        return null; // Invalidate session for suspended or blocked users
      }

      return {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role.toUpperCase(),
        status: userStatus
      };
    }
  } catch (err) {
    return null;
  }

  return null;
}

export const ALL_ADMIN_ROLES = ADMIN_ROLES;

/**
 * Ensures the authenticated user has one of the allowed administrative roles.
 */
export async function requireAdminRole(
  req?: Request,
  allowedRoles: string[] = ADMIN_ROLES
): Promise<{ user: AuthUser | null; error: string | null; status: number }> {
  const user = await getAuthUser(req);

  if (!user) {
    return { user: null, error: 'Authentication required. Please log in to the admin portal.', status: 401 };
  }

  const normalizedRole = user.role.toUpperCase();
  const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

  if (!normalizedAllowed.includes(normalizedRole)) {
    return {
      user,
      error: `Access Denied. Role '${user.role}' is not authorized for administrative access.`,
      status: 403
    };
  }

  return { user, error: null, status: 200 };
}

/**
 * Ensures the authenticated user is a Seller (VENDOR_ADMIN or VENDOR_STAFF)
 * and retrieves their associated store context.
 */
export async function requireSeller(
  req?: Request
): Promise<{ context: SellerContext | null; error: string | null; status: number }> {
  const user = await getAuthUser(req);

  if (!user) {
    return { context: null, error: 'Authentication required. Please log in to the seller portal.', status: 401 };
  }

  const normalizedRole = user.role.toUpperCase();
  const sellerRoles = ['VENDOR_ADMIN', 'SELLER', 'VENDOR_STAFF', 'SUPER_ADMIN', 'ADMIN'];

  if (!sellerRoles.includes(normalizedRole)) {
    return {
      context: null,
      error: 'Access Denied. A seller account is required to access this resource.',
      status: 403
    };
  }

  // Find user's own store strictly by ownerId
  let store = await prisma.store.findFirst({
    where: { ownerId: user.id }
  });

  // If user is seller staff, find the store they belong to
  if (!store && normalizedRole === 'VENDOR_STAFF') {
    const staffMembership = await prisma.staffMember.findFirst({
      where: { userId: user.id, isActive: true },
      include: { seller: { include: { stores: true } } }
    });
    if (staffMembership?.seller?.stores?.[0]) {
      store = staffMembership.seller.stores[0];
    }
  }

  const isPending = store ? !store.isApproved : true;

  return {
    context: {
      user,
      store: store ? {
        id: store.id,
        name: store.name,
        isApproved: store.isApproved,
        commissionRate: store.commissionRate,
        ownerId: store.ownerId
      } : null,
      isPending
    },
    error: null,
    status: 200
  };
}

export interface ResellerContext {
  user: AuthUser;
  profile: any | null;
}

export interface DeliveryContext {
  user: AuthUser;
  profile: any | null;
}

/**
 * Ensures the authenticated user is a Reseller (or Admin).
 */
export async function requireReseller(
  req?: Request
): Promise<{ context: ResellerContext | null; error: string | null; status: number }> {
  const user = await getAuthUser(req);

  if (!user) {
    return { context: null, error: 'Authentication required. Please log in to the reseller portal.', status: 401 };
  }

  const normalizedRole = user.role.toUpperCase();
  const resellerRoles = ['RESELLER', 'SUPER_ADMIN', 'ADMIN'];

  if (!resellerRoles.includes(normalizedRole)) {
    return {
      context: null,
      error: 'Access Denied. A reseller account is required to access this resource.',
      status: 403
    };
  }

  let profile = await prisma.resellerProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile && normalizedRole === 'RESELLER') {
    profile = await prisma.resellerProfile.create({
      data: {
        userId: user.id,
        status: 'ACTIVE'
      }
    });
  }

  return {
    context: {
      user,
      profile
    },
    error: null,
    status: 200
  };
}

/**
 * Ensures the authenticated user is a Delivery Man / Courier (or Delivery Manager / Admin).
 */
export async function requireDeliveryMan(
  req?: Request
): Promise<{ context: DeliveryContext | null; error: string | null; status: number }> {
  const user = await getAuthUser(req);

  if (!user) {
    return { context: null, error: 'Authentication required. Please log in to the delivery partner portal.', status: 401 };
  }

  const normalizedRole = user.role.toUpperCase();
  const deliveryRoles = ['DELIVERY_MAN', 'COURIER', 'DELIVERY_MANAGER', 'SUPER_ADMIN', 'ADMIN'];

  if (!deliveryRoles.includes(normalizedRole)) {
    return {
      context: null,
      error: 'Access Denied. A delivery partner account is required to access this resource.',
      status: 403
    };
  }

  let profile = await prisma.deliveryProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile && (normalizedRole === 'DELIVERY_MAN' || normalizedRole === 'COURIER')) {
    profile = await prisma.deliveryProfile.create({
      data: {
        userId: user.id,
        status: 'APPROVED',
        availabilityStatus: 'OFFLINE'
      }
    });
  }

  return {
    context: {
      user,
      profile
    },
    error: null,
    status: 200
  };
}

/**
 * Ensures the authenticated user is logged in (Customer, Seller, Reseller, Delivery, or Admin).
 */
export async function requireCustomer(
  req?: Request
): Promise<{ user: AuthUser | null; error: string | null; status: number }> {
  const user = await getAuthUser(req);

  if (!user) {
    return { user: null, error: 'Authentication required. Please log in.', status: 401 };
  }

  return { user, error: null, status: 200 };
}

/**
 * Creates an immutable audit log entry in the database.
 */
export async function logAdminAction(
  userId: string | null,
  action: string,
  ipAddress: string | null = null
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress
      }
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
}


