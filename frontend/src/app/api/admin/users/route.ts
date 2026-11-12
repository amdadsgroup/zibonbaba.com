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
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereClause: any = {};

    if (role && role !== 'ALL') {
      whereClause.role = role.toUpperCase();
    }

    if (status && status !== 'ALL') {
      whereClause.status = status.toUpperCase();
    }

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { profile: { fullName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        include: {
          profile: true,
          stores: { select: { id: true, name: true, isApproved: true } },
          _count: { select: { orders: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })
    ]);

    const formattedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      phone: u.phone || 'N/A',
      name: u.profile?.fullName || u.email.split('@')[0],
      role: u.role,
      status: u.status,
      ordersCount: u._count.orders,
      stores: u.stores,
      walletBalance: u.walletBalance,
      loyaltyPoints: u.loyaltyPoints,
      createdAt: u.createdAt
    }));

    return NextResponse.json({
      success: true,
      total,
      limit,
      offset,
      users: formattedUsers
    });
  } catch (err: any) {
    console.error('Admin Get Users Error:', err);
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
    const { email, password, fullName, phone, role, status } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password and full name are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existing) {
      return NextResponse.json({ error: 'A user account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = (role || 'CUSTOMER').toUpperCase();
    const assignedStatus = (status || 'ACTIVE').toUpperCase();

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        status: assignedStatus,
        phone: phone || null,
        profile: {
          create: {
            fullName
          }
        }
      },
      include: {
        profile: true
      }
    });

    await logAdminAction(auth.user?.id || null, `Created user account ${cleanEmail} with role [${assignedRole}]`);

    return NextResponse.json({
      success: true,
      message: `User ${cleanEmail} created successfully.`,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.profile?.fullName,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt
      }
    }, { status: 201 });
  } catch (err: any) {
    console.error('Admin Create User Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
