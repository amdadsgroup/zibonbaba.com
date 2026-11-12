import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const isApprovedParam = searchParams.get('isApproved');

    let whereClause: any = {};

    if (isApprovedParam !== null && isApprovedParam !== undefined && isApprovedParam !== 'ALL') {
      whereClause.isApproved = isApprovedParam === 'true';
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { owner: { email: { contains: search, mode: 'insensitive' } } },
        { owner: { profile: { fullName: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        owner: {
          include: {
            profile: true
          }
        },
        _count: {
          select: {
            products: true,
            orders: true
          }
        },
        orders: {
          select: {
            total: true,
            subTotal: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedSellers = stores.map((s) => {
      const grossSales = s.orders.reduce((sum, o) => sum + o.total, 0);
      return {
        id: s.id,
        name: s.name,
        description: s.description || '',
        logo: s.logo || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=120&auto=format&fit=crop',
        banner: s.banner || '',
        commissionRate: s.commissionRate,
        isApproved: s.isApproved,
        createdAt: s.createdAt,
        ownerId: s.ownerId,
        owner: {
          id: s.owner.id,
          email: s.owner.email,
          phone: s.owner.phone || 'N/A',
          name: s.owner.profile?.fullName || s.owner.email.split('@')[0],
          status: s.owner.status,
          walletBalance: s.owner.walletBalance
        },
        productsCount: s._count.products,
        ordersCount: s._count.orders,
        grossSales
      };
    });

    return NextResponse.json({
      success: true,
      total: formattedSellers.length,
      sellers: formattedSellers
    });
  } catch (err: any) {
    console.error('Admin Get Sellers API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { storeName, description, commissionRate, ownerEmail, ownerName, ownerPhone, password } = body;

    if (!storeName || !ownerEmail) {
      return NextResponse.json({ error: 'Store name and owner email are required.' }, { status: 400 });
    }

    const cleanEmail = ownerEmail.trim().toLowerCase();

    // Find or create owner user
    let owner = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!owner) {
      const passwordHash = await bcrypt.hash(password || 'Vendor123!', 10);
      owner = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: 'VENDOR_ADMIN',
          status: 'ACTIVE',
          phone: ownerPhone || null,
          profile: {
            create: {
              fullName: ownerName || storeName + ' Owner'
            }
          }
        }
      });
    } else {
      // Ensure owner has VENDOR_ADMIN role
      if (owner.role !== 'VENDOR_ADMIN' && owner.role !== 'SUPER_ADMIN') {
        owner = await prisma.user.update({
          where: { id: owner.id },
          data: { role: 'VENDOR_ADMIN' }
        });
      }
    }

    // Check if store name exists
    const existingStore = await prisma.store.findUnique({ where: { name: storeName.trim() } });
    if (existingStore) {
      return NextResponse.json({ error: 'A store with this name already exists.' }, { status: 409 });
    }

    const rate = commissionRate !== undefined ? parseFloat(commissionRate) : 8.5;

    const newStore = await prisma.store.create({
      data: {
        name: storeName.trim(),
        description: description ? description.trim() : 'Authorized marketplace vendor',
        commissionRate: isNaN(rate) ? 8.5 : rate,
        ownerId: owner.id,
        isApproved: true
      },
      include: {
        owner: { include: { profile: true } }
      }
    });

    await logAdminAction(auth.user?.id || null, `Created verified vendor store: ${newStore.name} for owner ${cleanEmail}`);

    return NextResponse.json({
      success: true,
      message: `Store ${newStore.name} created successfully.`,
      seller: {
        id: newStore.id,
        name: newStore.name,
        description: newStore.description,
        commissionRate: newStore.commissionRate,
        isApproved: newStore.isApproved,
        owner: {
          id: newStore.owner.id,
          email: newStore.owner.email,
          name: newStore.owner.profile?.fullName,
          phone: newStore.owner.phone
        }
      }
    }, { status: 201 });
  } catch (err: any) {
    console.error('Admin Create Seller API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
