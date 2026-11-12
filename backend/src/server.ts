import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { WebSocketServer, WebSocket } from 'ws';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'zibonbaba_super_secure_jwt_session_secret_token_123';

app.use(cors());
app.use(express.json());

// Extend Express Request Type for Authenticated Users
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    storeId?: string;
  };
}

// -----------------------------------------------------------------------------
// MIDDLEWARES & UTILITIES
// -----------------------------------------------------------------------------

// Simple Rate Limiting Middleware
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 120; // Allow 120 requests per minute

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const limitInfo = ipRequestCounts.get(ip);

  if (!limitInfo || now > limitInfo.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return next();
  }

  limitInfo.count += 1;
  if (limitInfo.count > MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  next();
};
app.use(rateLimiter);

// JWT Verification Middleware
const verifyJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc: any, c) => {
      const parts = c.trim().split('=');
      const key = parts[0];
      const val = parts.slice(1).join('=');
      acc[key] = val;
      return acc;
    }, {});
    token = cookies.zibonbaba_token || null;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Missing bearer token or session cookie.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if session still exists in SQLite (Session table)
    const sessionExists = await prisma.session.findUnique({
      where: { token }
    });

    if (!sessionExists) {
      return res.status(403).json({ error: 'Session invalidated. Please log in again.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token session.' });
  }
};

// RBAC Role Verification Middleware
const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(403).json({ error: 'Permission denied. Insufficient credentials.' });
    }
    const role = req.user.role;
    if (role === 'SUPER_ADMIN' || allowedRoles.includes(role)) {
      return next();
    }
    return res.status(403).json({ error: 'Permission denied. Insufficient credentials.' });
  };
};

// Alias: authenticate = verifyJWT (used by account management routes)
const authenticate = verifyJWT;


// Helper: Log Security Audit Logs
async function createAuditLog(userId: string | null, action: string, req: Request) {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    await prisma.auditLog.create({
      data: { userId, action, ipAddress }
    });
  } catch (err) {
    console.error('Audit logger failure:', err);
  }
}

// Public Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// User Registration
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, fullName, phone, address, role } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password and Full Name are required.' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const selectedRole = role || 'CUSTOMER';

    const refCode2 = email.split('@')[0].toUpperCase() + Math.floor(Math.random() * 9000 + 1000);
    const newUser = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        passwordHash,
        role: selectedRole,
        status: 'ACTIVE',
        referralCode: refCode2,
        profile: {
          create: { fullName }
        }
      },
      include: { profile: true }
    });

    await createAuditLog(newUser.id, `USER_REGISTER: Role=${selectedRole}`, req);

    res.status(201).json({
      message: 'Account registered successfully.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        fullName: (newUser as any).profile?.fullName
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User Login with Lockout Protection
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password inputs are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true, stores: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication credentials.' });
    }

    // Check Lockout
    if (user.lockoutUntil && new Date() < user.lockoutUntil) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / (60 * 1000));
      return res.status(403).json({
        error: `Account is temporarily locked due to repeated login failures. Try again in ${minutesLeft} minutes.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Increment failed attempts
      const newAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newAttempts >= 5;
      const lockoutTime = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: shouldLock ? 0 : newAttempts, // reset count if locking, or increment
          lockoutUntil: lockoutTime
        }
      });

      await createAuditLog(user.id, `LOGIN_FAILED: Attempt ${newAttempts}`, req);

      if (shouldLock) {
        return res.status(403).json({
          error: 'Account locked for 15 minutes due to 5 consecutive login failures.'
        });
      }
      return res.status(401).json({ error: 'Invalid authentication credentials.' });
    }

    // Reset Lockout details on Success
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockoutUntil: null }
    });

    // Retrieve store associated if vendor
    const storeId = user.stores.length > 0 ? user.stores[0].id : undefined;

    const payload = { id: user.id, email: user.email, role: user.role, storeId };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    // Store Session
    const sessionExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: sessionExpiry,
        ipAddress: (req.ip || req.socket.remoteAddress || '').toString(),
        userAgent: req.headers['user-agent']
      }
    });

    await createAuditLog(user.id, 'LOGIN_SUCCESS', req);

    res.setHeader('Set-Cookie', `zibonbaba_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7200`);
    res.status(200).json({
      accessToken: token,
      refreshToken: 'refresh-token-' + user.id,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName,
        storeId
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
app.post('/api/auth/logout', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      await prisma.session.deleteMany({ where: { token } });
    } catch (_) {}
  }

  if (req.user) {
    await createAuditLog(req.user.id, 'LOGOUT', req);
  }

  res.setHeader('Set-Cookie', 'zibonbaba_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
  res.status(200).json({ message: 'Session terminated successfully.' });
});

// Change Password
app.post('/api/auth/change-password', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old password and new password are required.' });
  }

  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !(await bcrypt.compare(oldPassword, user.passwordHash))) {
      return res.status(400).json({ error: 'Incorrect old password.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    await createAuditLog(userId, 'PASSWORD_CHANGE', req);
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Password Recovery — token-based flow handled below
// (stubs removed; real routes at /api/auth/forgot-password and /api/auth/reset-password)
// Social Logins Mock Stubs
app.post('/api/auth/google', async (req, res) => {
  res.status(200).json({ accessToken: 'google-stub-token', user: { role: 'CUSTOMER', email: 'google-user@domain.com' } });
});
app.post('/api/auth/facebook', async (req, res) => {
  res.status(200).json({ accessToken: 'fb-stub-token', user: { role: 'CUSTOMER', email: 'fb-user@domain.com' } });
});
app.post('/api/auth/apple', async (req, res) => {
  res.status(200).json({ accessToken: 'apple-stub-token', user: { role: 'CUSTOMER', email: 'apple-user@domain.com' } });
});

// OTP Stubs
app.post('/api/auth/send-otp', async (req, res) => {
  res.status(200).json({ message: 'OTP verification code sent to mobile/email.' });
});
app.post('/api/auth/verify-otp', async (req, res) => {
  res.status(200).json({ success: true, message: 'OTP verified successfully.' });
});

// Get Current Profile Details
app.get('/api/auth/profile', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { profile: true }
    });
    res.status(200).json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
app.put('/api/auth/profile', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { fullName, phone, dateOfBirth, gender, bio } = req.body;
  try {
    if (phone) await prisma.user.update({ where: { id: req.user!.id }, data: { phone } });
    const updated = await prisma.profile.upsert({
      where: { userId: req.user!.id },
      update: { fullName, dateOfBirth, gender, bio },
      create: { userId: req.user!.id, fullName: fullName || '' }
    });
    res.status(200).json({ profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Unified Homepage Content API (Desktop, Mobile, Tablet, PWA consistency)
const getProductImage = (cat: string, name: string) => {
  const n = (name || '').toLowerCase();
  const c = (cat || '').toLowerCase();

  if (c.includes('electronic') || c.includes('tech')) {
    if (n.includes('earbud') || n.includes('headphone') || n.includes('headset')) return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80';
    if (n.includes('watch')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
    if (n.includes('keyboard')) return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80';
    if (n.includes('speaker')) return 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80';
    if (n.includes('mouse')) return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80';
    if (n.includes('webcam')) return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('beauty') || c.includes('health') || c.includes('skincare')) {
    if (n.includes('cream') || n.includes('moisturizer')) return 'https://images.unsplash.com/photo-1608248597263-00079e96047a?w=600&auto=format&fit=crop&q=80';
    if (n.includes('lipstick') || n.includes('makeup')) return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('kitchen') || c.includes('home')) {
    if (n.includes('kettle') || n.includes('coffee')) return 'https://images.unsplash.com/photo-1517668808822-9e428824603b?w=600&auto=format&fit=crop&q=80';
    if (n.includes('pan') || n.includes('cooker')) return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('apparel') || c.includes('fashion') || c.includes('clothing')) {
    if (n.includes('shirt') || n.includes('polo') || n.includes('t-shirt')) return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80';
    if (n.includes('denim') || n.includes('pants') || n.includes('jacket')) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('grocery') || c.includes('organic') || c.includes('food')) {
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('book') || c.includes('library')) {
    return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('toy') || c.includes('game')) {
    return 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('sport') || c.includes('outdoor') || c.includes('fit')) {
    return 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('auto') || c.includes('gear') || c.includes('car')) {
    return 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('jewel') || c.includes('gem') || c.includes('luxury')) {
    return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80';
  }

  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
};

app.get('/api/homepage', async (req: Request, res: Response) => {
  try {
    const banners = [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=60',
        title: 'Grand Eid Mega Sale',
        desc: 'Get up to 60% off on all clothing items',
        linkText: 'Shop Apparel',
        cat: 'Apparel'
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60',
        title: 'Top Running Gear',
        desc: 'Extra 10% off with coupon code SAVE10',
        linkText: 'Explore Now',
        cat: 'Apparel'
      },
      {
        id: 3,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
        title: 'Hi-Fi Sound System',
        desc: 'Exclusive warranty from TechHub verified sellers',
        linkText: 'Audio Catalog',
        cat: 'Electronics'
      }
    ];

    const categories = await prisma.category.findMany({});
    const products = await prisma.product.findMany({
      include: {
        category: true,
        store: true,
        variants: {
          include: {
            inventory: true
          }
        }
      }
    });

    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.basePrice,
      category: p.category.name,
      rating: 4.8,
      image: getProductImage(p.category.name, p.name),
      sku: p.variants[0]?.sku || 'SKU-UNKNOWN',
      stock: p.variants[0]?.inventory[0]?.quantity || 0,
      vendor: p.store.name,
      description: p.description || ''
    }));

    res.json({
      banners,
      categories: ['All', ...categories.map(c => c.name)],
      products: formattedProducts,
      flashSales: formattedProducts.slice(0, 3)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch Products list with advanced filters
app.get('/api/products', async (req: Request, res: Response) => {
  const { query, category, minPrice, maxPrice } = req.query;

  try {
    const minVal = minPrice ? parseFloat(minPrice as string) : 0;
    const maxVal = maxPrice ? parseFloat(maxPrice as string) : 999999;

    let whereClause: any = {
      basePrice: { gte: minVal, lte: maxVal }
    };

    if (category && category !== 'All') {
      whereClause.category = {
        name: category as string
      };
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query as string } },
        { description: { contains: query as string } }
      ];
    }

    const dbProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        store: true,
        category: true,
        variants: {
          include: {
            inventory: true
          }
        }
      }
    });

    // Map DB structure to frontend format
    const formattedProducts = dbProducts.map((p) => {
      // Calculate total stock across warehouses & branches
      const totalStock = p.variants.reduce((total, v) => {
        return total + v.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      }, 0);

      const mainVariant = p.variants[0];
      const sku = mainVariant ? mainVariant.sku : 'SKU-NONE';

      return {
        id: p.id,
        name: p.name,
        price: p.basePrice,
        category: p.category.name,
        rating: 4.5 + Math.random() * 0.5,
        image: getProductImage(p.category.name, p.name),
        sku,
        stock: totalStock,
        vendor: p.store.name,
        description: p.description || 'No description provided.'
      };
    });

    res.status(200).json({ products: formattedProducts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single Product Details API
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const p = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        store: true,
        variants: {
          include: {
            inventory: true
          }
        }
      }
    });

    if (!p) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const totalStock = p.variants.reduce((total, v) => {
      return total + v.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    }, 0);

    const mainVariant = p.variants[0];
    const sku = mainVariant ? mainVariant.sku : 'SKU-NONE';

    res.status(200).json({
      product: {
        id: p.id,
        name: p.name,
        price: p.basePrice,
        category: p.category.name,
        rating: 4.8,
        image: getProductImage(p.category.name, p.name),
        sku,
        stock: totalStock,
        vendor: p.store.name,
        description: p.description || 'No description provided.'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Category list
app.get('/api/categories', async (req, res) => {
  try {
    const list = await prisma.category.findMany();
    res.status(200).json({ categories: ['All', ...list.map((c) => c.name)] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new category (Admin & Super Admin permission required)
app.post('/api/categories', verifyJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCategory = await prisma.category.create({
      data: { name, slug }
    });
    res.status(201).json({ category: newCategory });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Upload New Product SKU
app.post('/api/products', verifyJWT, requireRole(['VENDOR_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  const { name, price, category, stock, sku, description, attributes } = req.body;
  if (!name || !price || !sku) {
    return res.status(400).json({ error: 'Name, Base Price and SKU are required.' });
  }

  try {
    // Check if category exists
    let dbCategory = await prisma.category.findUnique({ where: { name: category } });
    if (!dbCategory) {
      dbCategory = await prisma.category.create({
        data: { name: category, slug: category.toLowerCase().replace(/\s+/g, '-') }
      });
    }

    // Retrieve active store associated with user
    const store = await prisma.store.findFirst({
      where: { ownerId: req.user!.id }
    });

    if (!store) {
      return res.status(400).json({ error: 'No registered vendor store found for user profile.' });
    }

    // Check SKU duplicate
    const existingVariant = await prisma.productVariant.findUnique({ where: { sku: sku.toUpperCase() } });
    if (existingVariant) {
      return res.status(400).json({ error: 'SKU code is already registered in catalog.' });
    }

    // Transaction to create product, variant and inventory
    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          storeId: store.id,
          categoryId: dbCategory.id,
          name,
          basePrice: parseFloat(price),
          description,
          status: 'PUBLISHED'
        }
      });

      const variant = await tx.productVariant.create({
        data: {
          productId: prod.id,
          sku: sku.toUpperCase(),
          attributes: JSON.stringify(attributes || {}),
          price: parseFloat(price)
        }
      });

      // Find first warehouse
      const wh = await tx.warehouse.findFirst({ where: { storeId: store.id } });
      const qty = parseInt(stock) || 0;

      await tx.inventory.create({
        data: {
          variantId: variant.id,
          warehouseId: wh ? wh.id : null,
          quantity: qty,
          reorderPoint: 10
        }
      });

      return prod;
    });

    await createAuditLog(req.user!.id, `PRODUCT_UPLOAD: SKU=${sku}`, req);
    res.status(201).json({ message: 'SKU published successfully.', product: newProduct });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// CHECKOUT & ORDERS LIFE-CYCLE
// -----------------------------------------------------------------------------

// Place E-Commerce Order (Cart Checkout)
app.post('/api/orders', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Shopping cart items cannot be empty.' });
  }

  try {
    const customerId = req.user!.id;

    // Build the order process transaction
    const finalOrder = await prisma.$transaction(async (tx) => {
      // Determine store of the first product item
      const sampleVariant = await tx.productVariant.findUnique({
        where: { sku: items[0].product.sku },
        include: { product: true }
      });

      if (!sampleVariant) throw new Error('Variant catalog SKU not found.');
      const storeId = sampleVariant.product.storeId;

      let subTotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const dbVariant = await tx.productVariant.findUnique({
          where: { sku: item.product.sku },
          include: { inventory: true }
        });

        if (!dbVariant) throw new Error(`Product SKU ${item.product.sku} is unavailable.`);

        const requestedQty = item.quantity;
        subTotal += dbVariant.price * requestedQty;

        // Find primary inventory and decrement stock
        const primaryInv = dbVariant.inventory[0];
        if (!primaryInv || primaryInv.quantity < requestedQty) {
          throw new Error(`Insufficient stock for SKU ${dbVariant.sku}. Available: ${primaryInv ? primaryInv.quantity : 0}`);
        }

        await tx.inventory.update({
          where: { id: primaryInv.id },
          data: { quantity: primaryInv.quantity - requestedQty }
        });

        orderItemsData.push({
          variantId: dbVariant.id,
          quantity: requestedQty,
          price: dbVariant.price
        });
      }

      const tax = subTotal * 0.05; // 5% online purchase tax
      const shipping = 10.0;
      const total = subTotal + tax + shipping;

      const order = await tx.order.create({
        data: {
          customerId,
          storeId,
          source: 'ONLINE',
          subTotal,
          tax,
          discount: 0.0,
          total,
          status: 'PENDING',
          items: {
            create: orderItemsData
          }
        }
      });

      return order;
    });

    await createAuditLog(customerId, `ORDER_ONLINE_PLACED: OrderId=${finalOrder.id}`, req);
    res.status(201).json({
      orderId: finalOrder.id,
      status: finalOrder.status,
      total: finalOrder.total,
      message: 'Order recorded to database successfully!'
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch user orders list
app.get('/api/orders', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user!.role;
    let dbOrders;

    if (['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'ACCOUNTANT', 'CUSTOMER_SUPPORT', 'DELIVERY_MANAGER', 'DELIVERY_MAN'].includes(role)) {
      dbOrders = await prisma.order.findMany({
        include: { items: { include: { variant: { include: { product: true } } } } },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'VENDOR_ADMIN' || role === 'VENDOR_STAFF') {
      let storeId = req.user!.storeId;
      if (!storeId) {
        if (role === 'VENDOR_STAFF') {
          const staff = await prisma.staffMember.findFirst({ where: { userId: req.user!.id } });
          if (staff) {
            const store = await prisma.store.findFirst({ where: { ownerId: staff.sellerId } });
            storeId = store?.id;
          }
        } else {
          const store = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
          storeId = store?.id;
        }
      }

      if (!storeId) return res.status(200).json({ orders: [] });

      dbOrders = await prisma.order.findMany({
        where: { storeId },
        include: { items: { include: { variant: { include: { product: true } } } } },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Customer or Reseller role
      dbOrders = await prisma.order.findMany({
        where: { customerId: req.user!.id },
        include: { items: { include: { variant: { include: { product: true } } } } },
        orderBy: { createdAt: 'desc' }
      });
    }

    const formattedOrders = dbOrders.map((o) => {
      const cartItems = o.items.map((it) => ({
        product: {
          id: it.variant.product.id,
          name: it.variant.product.name,
          price: it.price,
          sku: it.variant.sku,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
        },
        quantity: it.quantity
      }));

      return {
        id: o.id,
        date: o.createdAt.toISOString().split('T')[0],
        items: cartItems,
        total: o.total,
        status: o.status,
        source: o.source,
        customerName: o.customerId ? 'Marketplace Customer' : 'Walk-in Guest'
      };
    });

    res.status(200).json({ orders: formattedOrders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status lifecycle
app.patch('/api/orders/:id/status', verifyJWT, requireRole(['VENDOR_ADMIN', 'VENDOR_STAFF', 'ADMIN', 'MANAGER', 'DELIVERY_MANAGER', 'DELIVERY_MAN']), async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required.' });

  try {
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });

    await createAuditLog(req.user!.id, `ORDER_STATUS_UPDATE: OrderId=${updated.id} Status=${status}`, req);
    res.status(200).json({ order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// ERP POS REGISTER & INVENTORIES
// -----------------------------------------------------------------------------

// Cashier POS Checkout
app.post('/api/erp/pos/checkout', verifyJWT, requireRole(['VENDOR_ADMIN', 'VENDOR_STAFF', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  const { branchId, items, discountPercent, paymentMethod, customerId } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'POS cart queue cannot be empty.' });
  }

  try {
    const userStore = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
    if (!userStore) throw new Error('No registered vendor store profile found.');

    const receipt = await prisma.$transaction(async (tx) => {
      let subTotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const qty = item.quantity;
        const price = item.product.price;
        subTotal += price * qty;

        const dbVariant = await tx.productVariant.findUnique({
          where: { sku: item.product.sku },
          include: { inventory: true }
        });

        if (!dbVariant) throw new Error(`SKU ${item.product.sku} not found in catalog.`);

        // Deduct inventory at Branch specifically if provided, or first inventory
        const branchInv = dbVariant.inventory.find(i => i.branchId === branchId) || dbVariant.inventory[0];
        if (!branchInv || branchInv.quantity < qty) {
          throw new Error(`Insufficient branch stock for POS item ${dbVariant.sku}.`);
        }

        await tx.inventory.update({
          where: { id: branchInv.id },
          data: { quantity: branchInv.quantity - qty }
        });

        orderItemsData.push({
          variantId: dbVariant.id,
          quantity: qty,
          price
        });
      }

      const discAmt = subTotal * ((discountPercent || 0) / 100);
      const tax = (subTotal - discAmt) * 0.08; // 8% local tax
      const total = subTotal - discAmt + tax;

      const order = await tx.order.create({
        data: {
          storeId: userStore.id,
          branchId: branchId || null,
          source: 'POS',
          subTotal,
          tax,
          discount: discAmt,
          total,
          status: 'DELIVERED',
          items: {
            create: orderItemsData
          }
        }
      });

      // Update CRM client's lifetime spent total
      if (customerId) {
        const client = await tx.cRMClient.findUnique({ where: { id: customerId } });
        if (client) {
          await tx.cRMClient.update({
            where: { id: customerId },
            data: { spentTotal: client.spentTotal + total }
          });
        }
      }

      return order;
    });

    await createAuditLog(req.user!.id, `POS_CHECKOUT: ReceiptId=${receipt.id}`, req);

    res.status(200).json({
      receiptId: receipt.id,
      total: receipt.total,
      changeDue: 0.00,
      timestamp: receipt.createdAt.toISOString()
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch Inventory Levels
app.get('/api/erp/inventory', verifyJWT, requireRole(['VENDOR_ADMIN', 'VENDOR_STAFF', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
    if (!store) return res.status(200).json({ stock: [] });

    const inventoryItems = await prisma.inventory.findMany({
      where: {
        OR: [
          { warehouse: { storeId: store.id } },
          { branch: { storeId: store.id } }
        ]
      },
      include: {
        variant: { include: { product: true } },
        warehouse: true,
        branch: true
      }
    });

    const stock = inventoryItems.map((inv) => ({
      sku: inv.variant.sku,
      productName: inv.variant.product.name,
      quantity: inv.quantity,
      reorderPoint: inv.reorderPoint,
      warehouse: inv.warehouse ? inv.warehouse.name : null,
      branch: inv.branch ? inv.branch.name : null
    }));

    res.status(200).json({ stock });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Relocate Stock (Warehouse to Branch)
app.post('/api/erp/inventory/transfer', verifyJWT, requireRole(['VENDOR_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  const { sku, sourceWarehouseId, targetBranchId, qty } = req.body;
  if (!sku || !sourceWarehouseId || !targetBranchId || !qty) {
    return res.status(400).json({ error: 'SKU, Source Warehouse, Target Branch and Quantity are required.' });
  }

  try {
    const transferQty = parseInt(qty);
    const dbVariant = await prisma.productVariant.findUnique({
      where: { sku: sku.toUpperCase() },
      include: { inventory: true }
    });

    if (!dbVariant) return res.status(404).json({ error: 'Product Variant SKU not found.' });

    const sourceInv = dbVariant.inventory.find(i => i.warehouseId === sourceWarehouseId);
    if (!sourceInv || sourceInv.quantity < transferQty) {
      return res.status(400).json({ error: 'Insufficient stock in source warehouse.' });
    }

    let targetInv = dbVariant.inventory.find(i => i.branchId === targetBranchId);

    await prisma.$transaction(async (tx) => {
      // Deduct source warehouse
      await tx.inventory.update({
        where: { id: sourceInv.id },
        data: { quantity: sourceInv.quantity - transferQty }
      });

      // Add to branch
      if (targetInv) {
        await tx.inventory.update({
          where: { id: targetInv.id },
          data: { quantity: targetInv.quantity + transferQty }
        });
      } else {
        await tx.inventory.create({
          data: {
            variantId: dbVariant.id,
            branchId: targetBranchId,
            quantity: transferQty
          }
        });
      }
    });

    await createAuditLog(req.user!.id, `STOCK_TRANSFER: SKU=${sku} Qty=${transferQty}`, req);
    res.status(200).json({ message: 'Stock relocation completed successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Warehouses capacity
app.get('/api/erp/warehouses', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
    if (!store) return res.status(200).json({ warehouses: [] });

    const whs = await prisma.warehouse.findMany({ where: { storeId: store.id } });
    const formatted = whs.map(w => ({
      id: w.id,
      name: w.name,
      location: w.location,
      capacities: '65%' // mock dynamic capacity level
    }));

    res.status(200).json({ warehouses: formatted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Branches list
app.get('/api/erp/branches', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
    if (!store) return res.status(200).json({ branches: [] });

    const brs = await prisma.branch.findMany({ where: { storeId: store.id } });
    const formatted = brs.map(b => ({
      id: b.id,
      name: b.name,
      city: b.city,
      activeTerminals: 2
    }));

    res.status(200).json({ branches: formatted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// CRM, EXPENSES & PROCUREMENTS
// -----------------------------------------------------------------------------

// CRM clients directory
app.get('/api/erp/crm', verifyJWT, requireRole(['VENDOR_ADMIN', 'VENDOR_STAFF', 'ADMIN']), async (req, res) => {
  try {
    const list = await prisma.cRMClient.findMany({ orderBy: { spentTotal: 'desc' } });
    const mapped = list.map(c => {
      let status: 'VIP' | 'Regular' | 'New' = 'New';
      if (c.spentTotal > 1000) status = 'VIP';
      else if (c.spentTotal > 200) status = 'Regular';

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        ordersCount: 2, // dynamic ordering count stub
        totalSpent: c.spentTotal,
        status
      };
    });

    res.status(200).json({ customers: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add CRM client record
app.post('/api/erp/crm/customer', verifyJWT, requireRole(['VENDOR_ADMIN', 'VENDOR_STAFF', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });

  try {
    const newClient = await prisma.cRMClient.create({
      data: { name, email, phone, spentTotal: 0.0 }
    });

    res.status(201).json({ customer: newClient });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Expense tracking logs
app.get('/api/erp/expenses', verifyJWT, requireRole(['VENDOR_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
    if (!store) return res.status(200).json({ expenses: [] });

    const list = await prisma.expense.findMany({
      where: { storeId: store.id },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({ expenses: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add Expense Entry
app.post('/api/erp/expenses', verifyJWT, requireRole(['VENDOR_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  const { desc, category, amount } = req.body;
  if (!desc || !amount) return res.status(400).json({ error: 'Description and amount are required.' });

  try {
    const store = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
    if (!store) return res.status(400).json({ error: 'No registered vendor store found.' });

    const exp = await prisma.expense.create({
      data: {
        storeId: store.id,
        desc,
        category: category || 'Operations',
        amount: parseFloat(amount)
      }
    });

    res.status(201).json({ expense: exp });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// GOVERNANCE & KYCS (ADMIN PORTAL)
// -----------------------------------------------------------------------------

// Fetch pending KYC store reviews
app.get('/api/admin/pending-vendors', verifyJWT, requireRole(['ADMIN']), async (req, res) => {
  try {
    const list = await prisma.store.findMany({
      where: { isApproved: false },
      include: { owner: { include: { profile: true } } }
    });

    const formatted = list.map(s => ({
      id: s.id,
      name: s.name,
      owner: s.owner.profile?.fullName || 'Sarah Jenkins',
      type: 'Retail Products',
      date: s.createdAt.toISOString().split('T')[0],
      status: 'pending'
    }));

    res.status(200).json({ vendors: formatted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve vendor KYC credentials
app.post('/api/admin/approve-vendor/:id', verifyJWT, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const approvedStore = await prisma.store.update({
      where: { id: req.params.id },
      data: { isApproved: true }
    });

    await createAuditLog(req.user!.id, `KYC_APPROVED: Store=${approvedStore.name}`, req);
    res.status(200).json({ message: 'Vendor store registration approved successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reject/Suspend vendor storefront
app.post('/api/admin/reject-vendor/:id', verifyJWT, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.store.delete({ where: { id: req.params.id } });
    await createAuditLog(req.user!.id, `KYC_REJECTED: StoreId=${req.params.id}`, req);
    res.status(200).json({ message: 'Vendor application rejected successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Audit Logs lookup
app.get('/api/admin/audit-logs', verifyJWT, requireRole(['ADMIN']), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const formatted = logs.map(l => ({
      time: l.createdAt.toTimeString().split(' ')[0],
      ip: l.ipAddress || '127.0.0.1',
      type: l.action.split(':')[0],
      desc: l.action,
      severity: l.action.includes('FAILED') || l.action.includes('REJECT') ? 'ERROR' : 'INFO'
    }));

    res.status(200).json({ auditLogs: formatted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// ARTIFICIAL INTELLIGENCE & ANALYTICS MODULES
// -----------------------------------------------------------------------------

// AI Stock Forecast predictions
app.get('/api/ai/inventory-forecast', verifyJWT, requireRole(['VENDOR_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
    if (!store) return res.status(200).json({ forecast: [] });

    // Grab a random product variant belonging to the store to forecast
    const pVariant = await prisma.productVariant.findFirst({
      where: { product: { storeId: store.id } }
    });

    const sku = pVariant ? pVariant.sku : 'HP-PRO-WHT';

    res.status(200).json({
      sku,
      forecast: [
        { month: 'Jul 2026', projectedSales: 120, confidenceInterval: '92%' },
        { month: 'Aug 2026', projectedSales: 145, confidenceInterval: '89%' }
      ],
      recommendedReorderQty: 150,
      daysToDepletion: 12
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Similar Product recommendations
app.get('/api/ai/recommendations', async (req, res) => {
  try {
    // Recommend top published items
    const recs = await prisma.product.findMany({
      take: 3,
      where: { status: 'PUBLISHED' }
    });

    res.status(200).json({ recommendations: recs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// ACCOUNT MANAGEMENT SYSTEM — FULL MULTI-ROLE API
// =============================================================================

// --- ACCOUNTS LIST (Super Admin / Admin) ----------------------------------------
app.get('/api/accounts', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (role)   where.role   = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { profile: { fullName: { contains: search } } },
        { phone: { contains: search } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { profile: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const safeUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      avatar: u.avatar,
      fullName: u.profile?.fullName,
      walletBalance: u.walletBalance,
      loyaltyPoints: u.loyaltyPoints,
      emailVerifiedAt: u.emailVerifiedAt,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt
    }));

    res.json({ accounts: safeUsers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ACCOUNT DETAIL -----------------------------------------------------------
app.get('/api/accounts/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        profile: true,
        addresses: true,
        userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        sessions: { orderBy: { createdAt: 'desc' }, take: 5 },
        loginHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
        notifications: { where: { isRead: false }, take: 5 }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { passwordHash, twoFactorSecret, ...safe } = user as any;
    res.json({ account: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CREATE ACCOUNT (Super Admin) -----------------------------------------------
app.post('/api/accounts/create', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, fullName, phone, role, status = 'ACTIVE' } = req.body;
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'email, password, fullName, role required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const hash2 = await bcrypt.hash(password, 10);
    const refCode = email.split('@')[0].toUpperCase() + Math.floor(Math.random() * 9000 + 1000);

    const newUser = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash: hash2,
        role,
        status,
        emailVerifiedAt: status === 'ACTIVE' ? new Date() : null,
        referralCode: refCode,
        createdById: req.user?.id,
        profile: { create: { fullName } }
      }
    });

    await prisma.auditLog.create({
      data: { userId: req.user?.id, action: `ADMIN_CREATE_ACCOUNT:${role}:${email}`, ipAddress: req.ip }
    });
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: 'Account Created',
        body: `Your ${role} account was created by an administrator.`,
        type: 'INFO',
        link: '/account'
      }
    });

    const { passwordHash: _, twoFactorSecret: __, ...safeUser } = newUser as any;
    res.status(201).json({ message: 'Account created', account: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- UPDATE ACCOUNT STATUS (activate/suspend/block/reject/delete) ----------------
app.patch('/api/accounts/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, reason } = req.body;
    const allowed = ['ACTIVE', 'PENDING', 'VERIFIED', 'SUSPENDED', 'BLOCKED', 'REJECTED', 'DELETED'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        status,
        suspendedAt: status === 'SUSPENDED' ? new Date() : undefined,
        suspendedReason: reason || undefined
      }
    });

    await prisma.auditLog.create({
      data: { userId: req.user?.id, action: `ACCOUNT_STATUS_CHANGE:${status}:${req.params.id}`, ipAddress: req.ip }
    });
    await prisma.notification.create({
      data: {
        userId: req.params.id,
        title: 'Account Status Updated',
        body: `Your account status changed to: ${status}${reason ? '. Reason: ' + reason : ''}.`,
        type: status === 'ACTIVE' ? 'SUCCESS' : 'WARNING',
        link: '/account'
      }
    });

    res.json({ message: `Account status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- VERIFY ACCOUNT -----------------------------------------------------------
app.patch('/api/accounts/:id/verify', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'VERIFIED', emailVerifiedAt: new Date() }
    });
    await prisma.auditLog.create({
      data: { userId: req.user?.id, action: `ACCOUNT_VERIFIED:${req.params.id}`, ipAddress: req.ip }
    });
    res.json({ message: 'Account verified successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ACCOUNT ACTIVITY LOGS ----------------------------------------------------
app.get('/api/accounts/:id/activity', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [auditLogs, loginHistory, sessions] = await Promise.all([
      prisma.auditLog.findMany({ where: { userId: req.params.id }, orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.loginHistory.findMany({ where: { userId: req.params.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.session.findMany({ where: { userId: req.params.id }, orderBy: { createdAt: 'desc' }, take: 5 })
    ]);
    res.json({ auditLogs, loginHistory, sessions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// RBAC — ROLES & PERMISSIONS
// =============================================================================

// List all roles with permissions
app.get('/api/roles', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { userRoles: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ roles });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List all permissions
app.get('/api/permissions', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({ orderBy: [{ group: 'asc' }, { label: 'asc' }] });
    res.json({ permissions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new role
app.post('/api/roles', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, permissionKeys } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    const role = await prisma.role.create({ data: { name, description, isSystem: false } });

    if (permissionKeys?.length) {
      const perms = await prisma.permission.findMany({ where: { key: { in: permissionKeys } } });
      for (const p of perms) {
        await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: p.id } });
      }
    }

    await prisma.auditLog.create({ data: { userId: req.user?.id, action: `ROLE_CREATED:${name}`, ipAddress: req.ip } });
    res.status(201).json({ message: 'Role created', role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update role permissions
app.put('/api/roles/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { description, permissionKeys } = req.body;
    const role = await prisma.role.findUnique({ where: { id: req.params.id } });
    if (!role) return res.status(404).json({ error: 'Role not found' });
    if (role.isSystem && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'System roles can only be modified by Super Admin' });
    }

    if (description !== undefined) await prisma.role.update({ where: { id: role.id }, data: { description } });

    if (permissionKeys) {
      await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
      const perms = await prisma.permission.findMany({ where: { key: { in: permissionKeys } } });
      for (const p of perms) {
        await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: p.id } });
      }
    }

    await prisma.auditLog.create({ data: { userId: req.user?.id, action: `ROLE_UPDATED:${role.name}`, ipAddress: req.ip } });
    res.json({ message: 'Role updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete role (non-system only)
app.delete('/api/roles/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = await prisma.role.findUnique({ where: { id: req.params.id } });
    if (!role) return res.status(404).json({ error: 'Role not found' });
    if (role.isSystem) return res.status(403).json({ error: 'System roles cannot be deleted' });

    await prisma.role.delete({ where: { id: req.params.id } });
    res.json({ message: 'Role deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Assign role to user
app.post('/api/roles/assign', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, roleId } = req.body;
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId }
    });
    await prisma.auditLog.create({ data: { userId: req.user?.id, action: `ROLE_ASSIGNED:${roleId}:${userId}`, ipAddress: req.ip } });
    res.json({ message: 'Role assigned' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// CUSTOMER SELF-SERVICE API
// =============================================================================

// --- PROFILE ------------------------------------------------------------------
app.get('/api/me/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { profile: true, addresses: true }
    });
    if (!user) return res.status(404).json({ error: 'Not found' });
    const { passwordHash, twoFactorSecret, ...safe } = user as any;
    res.json({ user: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/me/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, phone, dateOfBirth, gender, bio } = req.body;
    if (phone) await prisma.user.update({ where: { id: req.user!.id }, data: { phone } });
    await prisma.profile.upsert({
      where: { userId: req.user!.id },
      update: { fullName, dateOfBirth, gender, bio },
      create: { userId: req.user!.id, fullName: fullName || '' }
    });
    res.json({ message: 'Profile updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADDRESSES ----------------------------------------------------------------
app.get('/api/me/addresses', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user!.id } });
    res.json({ addresses });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/me/addresses', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: { userId: req.user!.id, label: label || 'Home', fullName, phone, addressLine1, addressLine2, city, state: state || '', postalCode, country: country || 'Bangladesh', isDefault: isDefault || false }
    });
    res.status(201).json({ address });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/me/addresses/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.address.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ message: 'Address deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- WALLET -------------------------------------------------------------------
app.get('/api/me/wallet', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { walletBalance: true, loyaltyPoints: true, referralCode: true } });
    const transactions = await prisma.walletTransaction.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 20 });
    const loyaltyTxns = await prisma.loyaltyTransaction.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 10 });
    const referrals = await prisma.referral.findMany({ where: { ownerId: req.user!.id } });
    res.json({ ...user, transactions, loyaltyTxns, referrals });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/me/wallet/add', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount } = req.body;
    const addAmt = parseFloat(amount);
    if (isNaN(addAmt) || addAmt <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        walletBalance: { increment: addAmt }
      }
    });

    const tx = await prisma.walletTransaction.create({
      data: {
        userId: req.user!.id,
        amount: addAmt,
        type: 'CREDIT',
        description: 'Funded wallet via mobile dashboard',
        balance: user.walletBalance
      }
    });

    res.json({ balance: user.walletBalance, transaction: tx });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- WISHLIST -----------------------------------------------------------------

// GET /api/me/wishlist — returns full product objects for the user's wishlist
app.get('/api/me/wishlist', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch full product data for each wishlist item
    const productIds = wishlistItems.map(w => w.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        store: true,
        variants: {
          include: { inventory: true }
        }
      }
    });

    const formatted = products.map(p => {
      const totalStock = p.variants.reduce((t, v) =>
        t + v.inventory.reduce((s, inv) => s + inv.quantity, 0), 0);
      return {
        id: p.id,
        name: p.name,
        price: p.basePrice,
        category: p.category.name,
        rating: 4.8,
        image: getProductImage(p.category.name, p.name),
        sku: p.variants[0]?.sku || 'SKU-NONE',
        stock: totalStock,
        vendor: p.store.name,
        description: p.description || ''
      };
    });

    // Return both product IDs (for quick checks) and full product objects
    res.json({
      wishlist: wishlistItems.map(w => w.productId),
      products: formatted
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/me/wishlist/:productId — add product to wishlist
app.post('/api/me/wishlist/:productId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params;
  try {
    await prisma.wishlist.upsert({
      where: { userId_productId: { userId: req.user!.id, productId } },
      create: { userId: req.user!.id, productId },
      update: {}
    });
    res.json({ message: 'Added to wishlist', productId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/me/wishlist/:productId — remove product from wishlist
app.delete('/api/me/wishlist/:productId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params;
  try {
    await prisma.wishlist.deleteMany({
      where: { userId: req.user!.id, productId }
    });
    res.json({ message: 'Removed from wishlist', productId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/me/tickets', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { creatorId: req.user!.id },
      include: { messages: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ tickets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/me/tickets', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, description, category = 'GENERAL', priority = 'NORMAL' } = req.body;
    if (!subject || !description) return res.status(400).json({ error: 'subject and description required' });

    const ticket = await prisma.supportTicket.create({
      data: { creatorId: req.user!.id, subject, description, category, priority }
    });
    res.status(201).json({ ticket });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/me/tickets/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { body } = req.body;
    const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const isStaff = ['CUSTOMER_SUPPORT', 'ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(req.user!.role);
    const msg = await prisma.ticketMessage.create({
      data: { ticketId: req.params.id, senderId: req.user!.id, body, isStaff }
    });
    if (!isStaff && ticket.status === 'RESOLVED') {
      await prisma.supportTicket.update({ where: { id: req.params.id }, data: { status: 'OPEN' } });
    }
    res.status(201).json({ message: msg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SECURITY (sessions, devices, login history) -------------------------------
app.get('/api/me/security', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [sessions, loginHistory, devices, user] = await Promise.all([
      prisma.session.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.loginHistory.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.device.findMany({ where: { userId: req.user!.id } }),
      prisma.user.findUnique({ where: { id: req.user!.id }, select: { twoFactorEnabled: true, updatedAt: true } })
    ]);
    res.json({ sessions, loginHistory, devices, twoFactorEnabled: user?.twoFactorEnabled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/me/sessions/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.session.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ message: 'Session revoked' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2FA toggle
app.patch('/api/me/2fa', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { enabled } = req.body;
    await prisma.user.update({ where: { id: req.user!.id }, data: { twoFactorEnabled: !!enabled } });
    await prisma.auditLog.create({ data: { userId: req.user!.id, action: enabled ? '2FA_ENABLED' : '2FA_DISABLED', ipAddress: req.ip } });
    res.json({ message: `2FA ${enabled ? 'enabled' : 'disabled'}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// STAFF & SELLER ROUTES
// =============================================================================

// List staff members for a seller
app.get('/api/seller/staff', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = await prisma.staffMember.findMany({
      where: { sellerId: req.user!.id },
      include: { user: { include: { profile: true } } }
    });
    res.json({ staff });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create staff member under seller
app.post('/api/seller/staff', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, fullName, phone, jobTitle, permissions } = req.body;
    if (!email || !fullName || !jobTitle) return res.status(400).json({ error: 'email, fullName, jobTitle required' });

    let staffUser = await prisma.user.findUnique({ where: { email } });
    if (!staffUser) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hash2 = await bcrypt.hash(tempPassword, 10);
      staffUser = await prisma.user.create({
        data: {
          email, phone, passwordHash: hash2, role: 'VENDOR_STAFF', status: 'ACTIVE',
          referralCode: email.split('@')[0].toUpperCase() + '999',
          profile: { create: { fullName } }
        }
      });
    }

    const staffMember = await prisma.staffMember.upsert({
      where: { sellerId_userId: { sellerId: req.user!.id, userId: staffUser.id } },
      update: { jobTitle, permissions: JSON.stringify(permissions || []) },
      create: { sellerId: req.user!.id, userId: staffUser.id, jobTitle, permissions: JSON.stringify(permissions || []) }
    });

    await prisma.auditLog.create({ data: { userId: req.user!.id, action: `STAFF_CREATED:${email}:${jobTitle}`, ipAddress: req.ip } });
    res.status(201).json({ message: 'Staff member added', staffMember });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update staff permissions
app.patch('/api/seller/staff/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { permissions, jobTitle, isActive } = req.body;
    const updateData: any = {};
    if (permissions !== undefined) updateData.permissions = JSON.stringify(permissions);
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (isActive !== undefined) updateData.isActive = isActive;
    await prisma.staffMember.updateMany({ where: { id: req.params.id, sellerId: req.user!.id }, data: updateData });
    res.json({ message: 'Staff updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Remove staff member
app.delete('/api/seller/staff/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.staffMember.deleteMany({ where: { id: req.params.id, sellerId: req.user!.id } });
    res.json({ message: 'Staff member removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Seller Store Details
app.get('/api/seller/store', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let store;
    if (req.user!.role === 'VENDOR_STAFF') {
      const staff = await prisma.staffMember.findFirst({ where: { userId: req.user!.id } });
      if (staff) {
        store = await prisma.store.findFirst({ where: { ownerId: staff.sellerId } });
      }
    } else {
      store = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
    }
    if (!store) {
      store = await prisma.store.findFirst();
    }
    res.json({ store });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Seller Store Details
app.put('/api/seller/store', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, logo, banner, bankInfo, taxInfo } = req.body;
    let store = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
    if (!store) {
      store = await prisma.store.create({
        data: {
          name: name || 'Vendor Store',
          ownerId: req.user!.id,
          description,
          logo,
          banner,
          bankInfo,
          taxInfo,
          isApproved: true
        }
      });
    } else {
      store = await prisma.store.update({
        where: { id: store.id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(logo !== undefined && { logo }),
          ...(banner !== undefined && { banner }),
          ...(bankInfo !== undefined && { bankInfo }),
          ...(taxInfo !== undefined && { taxInfo })
        }
      });
    }
    res.json({ store, message: 'Store properties updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Seller Wallet & Financials
app.get('/api/seller/wallet', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let store;
    if (req.user!.role === 'VENDOR_STAFF') {
      const staff = await prisma.staffMember.findFirst({ where: { userId: req.user!.id } });
      if (staff) {
        store = await prisma.store.findFirst({ where: { ownerId: staff.sellerId } });
      }
    } else {
      store = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
    }

    if (!store) {
      return res.json({ earnings: 0, storeId: null, transactions: [] });
    }

    const storeOrders = await prisma.order.findMany({ where: { storeId: store.id } });
    const totalRevenue = storeOrders.reduce((sum, o) => sum + o.total, 0);

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: store.ownerId },
      orderBy: { createdAt: 'desc' }
    });

    // Separate out withdrawal (DEBIT) transactions for the frontend
    const withdrawals = transactions
      .filter((t: any) => t.type === 'DEBIT')
      .map((t: any) => ({
        id: t.id,
        amount: t.amount,
        status: t.description?.includes('approved') ? 'APPROVED' : 'PENDING',
        date: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '',
        description: t.description
      }));

    res.json({
      earnings: totalRevenue,
      storeId: store.id,
      storeName: store.name,
      transactions,
      withdrawals
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Seller Payout / Withdrawal Request
app.post('/api/seller/withdraw', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, bankDetails } = req.body;
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ error: 'Valid withdrawal amount is required.' });
    }

    const withdrawTx = await prisma.walletTransaction.create({
      data: {
        userId: req.user!.id,
        type: 'DEBIT',
        amount: withdrawAmount,
        description: `Vendor payout request: ${bankDetails || 'Bank Transfer'}`,
        balance: 0
      }
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: `VENDOR_PAYOUT_REQUEST: Amount=${withdrawAmount}`, ipAddress: req.ip }
    });

    res.json({ message: 'Payout request logged successfully.', transaction: withdrawTx });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Seller Analytics (Monthly GMV, Customer Count, Top Products)
app.get('/api/seller/analytics', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Resolve the seller's store
    let store;
    if (req.user!.role === 'VENDOR_STAFF') {
      const staff = await prisma.staffMember.findFirst({ where: { userId: req.user!.id } });
      if (staff) {
        store = await prisma.store.findFirst({ where: { ownerId: staff.sellerId } });
      }
    } else {
      store = await prisma.store.findFirst({ where: { ownerId: req.user!.id } });
    }

    if (!store) {
      return res.json({ monthlyGMV: [], totalCustomers: 0, topProducts: [] });
    }

    // Get all store orders
    const storeOrders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Monthly GMV — last 6 months
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyGMV: { month: string; value: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = monthNames[d.getMonth()];

      const monthTotal = storeOrders
        .filter(o => {
          const oDate = new Date(o.createdAt);
          return oDate >= monthStart && oDate <= monthEnd;
        })
        .reduce((sum, o) => sum + o.total, 0);

      monthlyGMV.push({ month: label, value: monthTotal });
    }

    // Unique customer count
    const uniqueCustomerIds = new Set(storeOrders.map(o => o.customerId).filter(Boolean));
    const totalCustomers = uniqueCustomerIds.size;

    // Top selling products (by order item quantity)
    const productSales: Record<string, { name: string; totalQty: number; totalRevenue: number }> = {};
    for (const order of storeOrders) {
      for (const item of order.items) {
        const pName = item.variant?.product?.name || 'Unknown';
        const pId = item.variant?.product?.id || item.variantId;
        if (!productSales[pId]) {
          productSales[pId] = { name: pName, totalQty: 0, totalRevenue: 0 };
        }
        productSales[pId].totalQty += item.quantity;
        productSales[pId].totalRevenue += item.price * item.quantity;
      }
    }

    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b.totalQty - a.totalQty)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }));

    res.json({ monthlyGMV, totalCustomers, topProducts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Product Item (Seller / Vendor / Admin)
app.put('/api/products/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.id;
    const { name, price, stock, description, category } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    let categoryId = existingProduct.categoryId;
    if (category) {
      let dbCategory = await prisma.category.findUnique({ where: { name: category } });
      if (!dbCategory) {
        dbCategory = await prisma.category.create({
          data: { name: category, slug: category.toLowerCase().replace(/\s+/g, '-') }
        });
      }
      categoryId = dbCategory.id;
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id: productId },
        data: {
          ...(name && { name }),
          ...(price && { basePrice: parseFloat(price) }),
          ...(description !== undefined && { description }),
          categoryId
        }
      });

      if (existingProduct.variants.length > 0) {
        const variantId = existingProduct.variants[0].id;
        if (price) {
          await tx.productVariant.update({
            where: { id: variantId },
            data: { price: parseFloat(price) }
          });
        }
        if (stock !== undefined) {
          const inv = await tx.inventory.findFirst({ where: { variantId } });
          if (inv) {
            await tx.inventory.update({
              where: { id: inv.id },
              data: { quantity: parseInt(stock) }
            });
          }
        }
      }

      return prod;
    });

    res.json({ message: 'Product updated successfully.', product: updatedProduct });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Product Item (Seller / Vendor / Admin)
app.delete('/api/products/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.id;
    await prisma.product.delete({ where: { id: productId } });
    res.json({ message: 'Product deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// SUPPORT STAFF ROUTES (for CUSTOMER_SUPPORT role)
// =============================================================================

// All tickets (support view)
app.get('/api/support/tickets', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, category } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        creator: { include: { profile: true } },
        assignee: { include: { profile: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ tickets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Assign ticket to self
app.patch('/api/support/tickets/:id/assign', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: { assigneeId: req.user!.id, status: 'IN_PROGRESS' }
    });
    res.json({ message: 'Ticket assigned' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve ticket
app.patch('/api/support/tickets/:id/resolve', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.supportTicket.update({ where: { id: req.params.id }, data: { status: 'RESOLVED' } });
    res.json({ message: 'Ticket resolved' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// VERIFICATION REQUESTS
// =============================================================================

app.post('/api/verification/submit', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, data } = req.body;
    const validTypes = ['EMAIL', 'PHONE_OTP', 'NATIONAL_ID', 'TRADE_LICENSE', 'BUSINESS', 'BANK_ACCOUNT'];
    if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid verification type' });

    const req2 = await prisma.verificationRequest.create({
      data: { userId: req.user!.id, type, data: JSON.stringify(data || {}), status: 'PENDING' }
    });
    res.status(201).json({ message: 'Verification request submitted', id: req2.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/verification/pending', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const verifications = await prisma.verificationRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ verifications });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/verification/:id/review', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, reviewNote } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ error: 'status must be APPROVED or REJECTED' });

    await prisma.verificationRequest.update({
      where: { id: req.params.id },
      data: { status, reviewNote, reviewedAt: new Date() }
    });
    await prisma.auditLog.create({ data: { userId: req.user?.id, action: `VERIFICATION_${status}:${req.params.id}`, ipAddress: req.ip } });
    res.json({ message: `Verification ${status.toLowerCase()}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// PLATFORM STATS (Super Admin / Admin)
// =============================================================================
app.get('/api/admin/platform-stats', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [totalUsers, activeUsers, pendingVerifications, openTickets, totalOrders, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
      prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } })
    ]);

    const byRole: Record<string, number> = {};
    const roleCounts = await prisma.user.groupBy({ by: ['role'], _count: { role: true } });
    for (const r of roleCounts) byRole[r.role] = r._count.role;

    res.json({
      totalUsers,
      activeUsers,
      pendingVerifications,
      openTickets,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      byRole
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// UNIFIED ENTERPRISE NOTIFICATION SYSTEM
// -----------------------------------------------------------------------------

// Connected websocket clients map
const wsClients = new Map<string, WebSocket>();

// Initialize WebSocket server
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket, req: any) => {
  const url = new URL(req.url || '', 'http://localhost');
  const userId = url.searchParams.get('userId');

  if (userId) {
    wsClients.set(userId, ws);
    console.log(`🔌 WebSocket connected for User ID: ${userId}`);

    // Send initial unread count
    prisma.notification.count({ where: { userId, isRead: false, isArchived: false } })
      .then(count => {
        ws.send(JSON.stringify({ event: 'connected', unreadCount: count }));
      }).catch(err => console.error(err));
  }

  ws.on('close', () => {
    if (userId) {
      wsClients.delete(userId);
      console.log(`🔌 WebSocket disconnected for User ID: ${userId}`);
    }
  });
});

// Centralized Notification Dispatcher
async function dispatchNotification(
  userId: string,
  title: string,
  body: string,
  options?: {
    type?: string;          // INFO | SUCCESS | WARNING | ERROR | ORDER | SECURITY
    priority?: string;      // CRITICAL | HIGH | MEDIUM | LOW | INFO
    module?: string;        // MARKETPLACE | ERP | CRM | HRM | FINANCE | SECURITY | SUPPORT | WALLET
    link?: string;          // redirect URL
    metadata?: Record<string, any>;
  }
) {
  try {
    // 1. Fetch user to get email/phone preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { notificationPreference: true }
    });

    if (!user) return;

    // 2. Ensure preferences exist
    let pref = user.notificationPreference;
    if (!pref) {
      pref = await prisma.notificationPreference.create({
        data: { userId }
      });
    }

    // Determine target channels
    const channelsList: string[] = ['In-App'];
    if (pref.emailEnabled) channelsList.push('Email');
    if (pref.smsEnabled && user.phone) channelsList.push('SMS');
    if (pref.whatsappEnabled && user.phone) channelsList.push('WhatsApp');
    if (pref.pushEnabled) channelsList.push('Push');

    // 3. Save to database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type: options?.type || 'INFO',
        priority: options?.priority || 'INFO',
        module: options?.module || 'MARKETPLACE',
        link: options?.link || null,
        channels: channelsList.join(', '),
        metadata: options?.metadata ? JSON.stringify(options.metadata) : null,
        isRead: false,
        isArchived: false,
        isAcknowledged: false
      }
    });

    // 4. Send real-time ws alert
    const ws = wsClients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        event: 'notification',
        data: notification
      }));
    }

    // 5. Log external channel simulations (audit trails)
    if (pref.emailEnabled) {
      console.log(`[SIMULATED EMAIL] To: ${user.email}, Subject: "${title}", Message: "${body}"`);
    }
    if (pref.smsEnabled && user.phone) {
      console.log(`[SIMULATED SMS] To: ${user.phone}, Message: "${title}: ${body}"`);
    }
    if (pref.whatsappEnabled && user.phone) {
      console.log(`[SIMULATED WHATSAPP] To: ${user.phone}, Message: "${title}: ${body}"`);
    }
    if (pref.pushEnabled) {
      console.log(`[SIMULATED PUSH] To: ${userId}, Message: "${body}"`);
    }

    return notification;
  } catch (err) {
    console.error('Notification dispatch failure:', err);
  }
}

// System Automation Engine Evaluator
async function triggerNotificationEvent(
  eventCode: string,
  metadata: {
    orderId?: string;
    customerId?: string;
    sellerId?: string;
    deliveryManId?: string;
    amount?: number;
    title?: string;
    body?: string;
    priority?: string;
    module?: string;
  }
) {
  try {
    console.log(`⚙️ Evaluating automation rules for event: ${eventCode}`);

    // Check if dynamic rule exists in db
    const rule = await prisma.notificationRule.findUnique({
      where: { triggerEvent: eventCode }
    });

    if (rule && !rule.isActive) {
      console.log(`⚙️ Rule for ${eventCode} is currently muted.`);
      return;
    }

    // Handle core defaults
    if (eventCode === 'ORDER_DELIVERED') {
      if (metadata.customerId) {
        await dispatchNotification(metadata.customerId, 'Order Delivered! 🎉', `Your order #${metadata.orderId || ''} has been successfully delivered.`, {
          type: 'SUCCESS', priority: 'HIGH', module: 'MARKETPLACE', link: '/customer'
        });
      }
      if (metadata.sellerId) {
        await dispatchNotification(metadata.sellerId, 'Delivery Completed 💰', `Order #${metadata.orderId || ''} completed. Funds have been settled to your wallet.`, {
          type: 'SUCCESS', priority: 'MEDIUM', module: 'WALLET', link: '/seller'
        });
      }
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const a of admins) {
        await dispatchNotification(a.id, 'Platform Order Completed', `Order #${metadata.orderId || ''} was marked delivered. Commission processed.`, {
          type: 'INFO', priority: 'LOW', module: 'MARKETPLACE', link: '/admin'
        });
      }
    }
    else if (eventCode === 'REFUND_APPROVED') {
      if (metadata.customerId) {
        await dispatchNotification(metadata.customerId, 'Refund Approved 💸', `Your refund for order has been approved and credited back to your wallet.`, {
          type: 'SUCCESS', priority: 'HIGH', module: 'WALLET', link: '/customer'
        });
      }
      const accountants = await prisma.user.findMany({ where: { role: 'ACCOUNTANT' } });
      for (const acc of accountants) {
        await dispatchNotification(acc.id, 'Refund Request Disbursed', `Refund payout of ৳${metadata.amount || 0} has been processed.`, {
          type: 'INFO', priority: 'MEDIUM', module: 'FINANCE', link: '/admin'
        });
      }
    }
    else if (eventCode === 'WITHDRAWAL_REQUESTED') {
      if (metadata.sellerId) {
        await dispatchNotification(metadata.sellerId, 'Withdrawal Requested ⏳', `Your payout request for ৳${metadata.amount || 0} is under review.`, {
          type: 'WARNING', priority: 'MEDIUM', module: 'WALLET', link: '/seller'
        });
      }
      const financeAndAdmins = await prisma.user.findMany({ where: { role: { in: ['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'] } } });
      for (const user of financeAndAdmins) {
        await dispatchNotification(user.id, 'New Payout Request', `Seller requested a payout of ৳${metadata.amount || 0}. Approval required.`, {
          type: 'WARNING', priority: 'HIGH', module: 'FINANCE', link: '/admin'
        });
      }
    }
    else if (eventCode === 'DELIVERY_ASSIGNED') {
      if (metadata.deliveryManId) {
        await dispatchNotification(metadata.deliveryManId, 'New Delivery Assigned 📦', `You have been assigned order #${metadata.orderId || ''}.`, {
          type: 'INFO', priority: 'HIGH', module: 'DELIVERY', link: '/delivery'
        });
      }
      if (metadata.customerId) {
        await dispatchNotification(metadata.customerId, 'Order Dispatched 🚚', `Order #${metadata.orderId || ''} is out for delivery with our courier agent.`, {
          type: 'INFO', priority: 'MEDIUM', module: 'MARKETPLACE', link: '/customer'
        });
      }
    }
  } catch (err) {
    console.error('Automation trigger failure:', err);
  }
}

// NOTIFICATION SYSTEM REST ROUTING

// 1. Get user notifications
app.get('/api/me/notifications', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { priority, module, status } = req.query as Record<string, string>;
    const where: any = { userId: req.user!.id, isArchived: false };

    if (priority) where.priority = priority;
    if (module)   where.module = module;
    if (status === 'unread') where.isRead = false;
    else if (status === 'read') where.isRead = true;
    else if (status === 'archived') {
      where.isArchived = true;
    }

    const list = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ notifications: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Mark specific read
app.patch('/api/me/notifications/:id/read', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Acknowledge critical
app.patch('/api/me/notifications/:id/acknowledge', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isAcknowledged: true, isRead: true }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Archive specific
app.patch('/api/me/notifications/:id/archive', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isArchived: true }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get preferences
app.get('/api/me/notifications/preferences', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let pref = await prisma.notificationPreference.findUnique({
      where: { userId: req.user!.id }
    });
    if (!pref) {
      pref = await prisma.notificationPreference.create({
        data: { userId: req.user!.id }
      });
    }
    res.json({ preferences: pref });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update preferences
app.put('/api/me/notifications/preferences', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { emailEnabled, smsEnabled, pushEnabled, whatsappEnabled, telegramEnabled, marketingMuted } = req.body;
    const updated = await prisma.notificationPreference.upsert({
      where: { userId: req.user!.id },
      update: { emailEnabled, smsEnabled, pushEnabled, whatsappEnabled, telegramEnabled, marketingMuted },
      create: { userId: req.user!.id, emailEnabled, smsEnabled, pushEnabled, whatsappEnabled, telegramEnabled, marketingMuted }
    });
    res.json({ preferences: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Get automation rules (Admin / Super Admin only)
app.get('/api/admin/notifications/rules', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const rules = await prisma.notificationRule.findMany({ orderBy: { triggerEvent: 'asc' } });
    res.json({ rules });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Create or toggle automation rules (Admin / Super Admin only)
app.post('/api/admin/notifications/rules', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const { triggerEvent, actionPayload, isActive } = req.body;
    if (!triggerEvent) return res.status(400).json({ error: 'triggerEvent required' });

    const rule = await prisma.notificationRule.upsert({
      where: { triggerEvent },
      update: { actionPayload: JSON.stringify(actionPayload || {}), isActive },
      create: { triggerEvent, actionPayload: JSON.stringify(actionPayload || {}), isActive }
    });
    res.json({ rule });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. AI Smart Trigger simulation route
app.post('/api/admin/notifications/trigger-ai', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetUserId, title, body, priority, module } = req.body;
    if (!targetUserId || !title || !body) {
      return res.status(400).json({ error: 'targetUserId, title, and body are required' });
    }

    const notification = await dispatchNotification(targetUserId, `🤖 AI Analytics: ${title}`, body, {
      type: 'INFO',
      priority: priority || 'LOW',
      module: module || 'MARKETPLACE'
    });

    res.json({ success: true, notification });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// COUPON MANAGER
// =============================================================================

// List all coupons
app.get('/api/admin/coupons', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const coupons = await (prisma as any).coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ coupons });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new coupon
app.post('/api/admin/coupons', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  const { code, discount, expiry } = req.body;
  if (!code || discount === undefined || !expiry) {
    return res.status(400).json({ error: 'code, discount, and expiry are required.' });
  }
  try {
    const coupon = await (prisma as any).coupon.create({
      data: { code: code.toUpperCase().trim(), discount: parseFloat(discount), expiry, active: true }
    });
    await createAuditLog(req.user!.id, `COUPON_CREATED: ${code.toUpperCase()}`, req);
    res.status(201).json({ coupon });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle coupon active status
app.patch('/api/admin/coupons/:id', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  const { active } = req.body;
  try {
    const coupon = await (prisma as any).coupon.update({
      where: { id: req.params.id },
      data: { active: !!active }
    });
    res.json({ coupon });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete coupon
app.delete('/api/admin/coupons/:id', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await (prisma as any).coupon.delete({ where: { id: req.params.id } });
    res.json({ message: 'Coupon deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// HRM — EMPLOYEE MANAGEMENT
// =============================================================================

// List employees
app.get('/api/admin/employees', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'HR_MANAGER']), async (req: Request, res: Response) => {
  try {
    const employees = await (prisma as any).employee.findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ employees });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create employee
app.post('/api/admin/employees', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  const { name, role, dept, salary, attendance, status } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'name and role are required.' });
  try {
    const employee = await (prisma as any).employee.create({
      data: { name, role, dept: dept || 'Administration', salary: parseFloat(salary) || 30000, attendance: attendance || '100%', status: status || 'Processing' }
    });
    await createAuditLog(req.user!.id, `EMPLOYEE_CREATED: ${name}`, req);
    res.status(201).json({ employee });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update employee
app.patch('/api/admin/employees/:id', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  const { name, role, dept, salary, attendance, status } = req.body;
  try {
    const employee = await (prisma as any).employee.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(role && { role }), ...(dept && { dept }), ...(salary !== undefined && { salary: parseFloat(salary) }), ...(attendance && { attendance }), ...(status && { status }) }
    });
    res.json({ employee });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete employee
app.delete('/api/admin/employees/:id', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await (prisma as any).employee.delete({ where: { id: req.params.id } });
    res.json({ message: 'Employee record removed.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// CRM NOTES (Admin Sales Pipeline)
// =============================================================================

// List all CRM notes
app.get('/api/admin/crm-notes', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'CRM_MANAGER']), async (req: Request, res: Response) => {
  try {
    const notes = await (prisma as any).cRMNote.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ notes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create CRM note
app.post('/api/admin/crm-notes', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'CRM_MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  const { name, note } = req.body;
  if (!name || !note) return res.status(400).json({ error: 'name and note are required.' });
  try {
    const crmNote = await (prisma as any).cRMNote.create({ data: { name, note } });
    res.status(201).json({ note: crmNote });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete CRM note
app.delete('/api/admin/crm-notes/:id', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await (prisma as any).cRMNote.delete({ where: { id: req.params.id } });
    res.json({ message: 'CRM note removed.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// REAL PASSWORD RESET — Token-based flow
// =============================================================================

// Step 1: Request reset — generates a token and logs it (simulate email)
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
    }

    // Generate a random token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Invalidate old tokens
    await (prisma as any).passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Store the new token
    await (prisma as any).passwordResetToken.create({
      data: { userId: user.id, token, expiresAt }
    });

    // Log the reset link (in production, send via email)
    const resetLink = `https://zibonbaba.vercel.app/forgot-password?token=${token}&email=${encodeURIComponent(email)}`;
    console.log(`[PASSWORD_RESET] Email: ${email}, Link: ${resetLink}`);

    await createAuditLog(user.id, `PASSWORD_RESET_REQUESTED`, req);

    res.status(200).json({
      message: 'If this email is registered, a reset link has been sent.',
      // Only expose in non-production or for debugging:
      ...(process.env.NODE_ENV !== 'production' && { debug_token: token, debug_link: resetLink })
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Step 2: Verify token and set new password
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { token, email, newPassword } = req.body;
  if (!token || !email || !newPassword) {
    return res.status(400).json({ error: 'token, email, and newPassword are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const resetToken = await (prisma as any).passwordResetToken.findFirst({
      where: { userId: user.id, token, usedAt: null }
    });

    if (!resetToken) return res.status(400).json({ error: 'Invalid or expired reset token.' });
    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash, failedLoginAttempts: 0, lockoutUntil: null } });
    await (prisma as any).passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } });

    // Invalidate all sessions for security
    await prisma.session.deleteMany({ where: { userId: user.id } });

    await createAuditLog(user.id, 'PASSWORD_RESET_COMPLETED', req);

    res.status(200).json({ message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// SERVICE BOOT
// -----------------------------------------------------------------------------

const server = app.listen(PORT, () => {
  console.log(`Zibonbaba Express backend listening on http://localhost:${PORT}`);
});

// Attach WebSocket Server upgrade handler
server.on('upgrade', (request: any, socket: any, head: any) => {
  wss.handleUpgrade(request, socket, head, (ws: any) => {
    wss.emit('connection', ws, request);
  });
});

export { app, server };

