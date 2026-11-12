import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, logAdminAction } from '@/lib/auth';

/**
 * GET /api/hubs
 * List all delivery hubs with real-time statistics (stationed riders, active orders, capacity).
 * Filter by division, district, status, or search query.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const division = searchParams.get('division')?.trim();
    const district = searchParams.get('district')?.trim();
    const status = searchParams.get('status')?.trim();
    const query = searchParams.get('query')?.toLowerCase().trim();

    const where: any = {};

    if (division && division !== 'ALL') {
      where.division = { equals: division, mode: 'insensitive' };
    }
    if (district && district !== 'ALL') {
      where.district = { equals: district, mode: 'insensitive' };
    }
    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { district: { contains: query, mode: 'insensitive' } },
        { division: { contains: query, mode: 'insensitive' } },
        { upazila: { contains: query, mode: 'insensitive' } }
      ];
    }

    const hubs = await prisma.deliveryHub.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            phone: true,
            profile: { select: { fullName: true } }
          }
        },
        riders: {
          select: {
            id: true,
            userId: true,
            isOnline: true,
            availabilityStatus: true,
            vehicleType: true,
            cashInHand: true,
            completedDeliveries: true,
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                profile: { select: { fullName: true } }
              }
            }
          }
        },
        assignments: {
          select: {
            id: true,
            status: true,
            codAmount: true,
            codCollected: true,
            deliveryFee: true
          }
        },
        orders: {
          select: {
            id: true,
            status: true,
            total: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formatted = hubs.map((h) => {
      const allRiders = h.riders || [];
      const onlineRidersCount = allRiders.filter(r => r.isOnline).length;
      const offlineRidersCount = allRiders.length - onlineRidersCount;

      const activeAssignments = h.assignments.filter(a =>
        ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(a.status)
      );
      const deliveredAssignments = h.assignments.filter(a => a.status === 'DELIVERED');
      const failedAssignments = h.assignments.filter(a => a.status === 'FAILED' || a.status === 'RETURNED');

      const totalCodInTransit = activeAssignments.reduce((sum, a) => sum + (a.codAmount || 0), 0);
      const totalCodCollected = deliveredAssignments.filter(a => a.codCollected).reduce((sum, a) => sum + (a.codAmount || 0), 0);

      let coverageList: string[] = [];
      if (h.coverageAreas) {
        try {
          coverageList = JSON.parse(h.coverageAreas);
        } catch (_) {
          coverageList = h.coverageAreas.split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      const activeParcelsCount = activeAssignments.length;
      const capacityUtilization = h.capacity > 0 ? Math.min(100, Math.round((activeParcelsCount / h.capacity) * 100)) : 0;

      return {
        id: h.id,
        name: h.name,
        code: h.code,
        address: h.address,
        division: h.division,
        district: h.district,
        upazila: h.upazila || '',
        contactNumber: h.contactNumber || 'N/A',
        email: h.email || 'N/A',
        capacity: h.capacity,
        status: h.status,
        operatingHours: h.operatingHours || '8:00 AM - 10:00 PM',
        coverageAreas: coverageList,
        latitude: h.latitude,
        longitude: h.longitude,
        manager: h.manager ? {
          id: h.manager.id,
          name: h.manager.profile?.fullName || h.manager.email.split('@')[0],
          email: h.manager.email,
          phone: h.manager.phone
        } : null,
        stats: {
          totalRiders: allRiders.length,
          onlineRiders: onlineRidersCount,
          offlineRiders: offlineRidersCount,
          activeParcels: activeParcelsCount,
          deliveredCount: deliveredAssignments.length,
          failedCount: failedAssignments.length,
          totalCodInTransit,
          totalCodCollected,
          capacityUtilization
        },
        ridersPreview: allRiders.slice(0, 5).map(r => ({
          id: r.id,
          userId: r.userId,
          name: r.user?.profile?.fullName || r.user?.email.split('@')[0] || 'Rider',
          phone: r.user?.phone || 'N/A',
          isOnline: r.isOnline,
          vehicleType: r.vehicleType,
          cashInHand: r.cashInHand
        }))
      };
    });

    return NextResponse.json({
      success: true,
      hubs: formatted,
      total: formatted.length
    });
  } catch (err: any) {
    console.error('Hubs GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/hubs
 * Create a new delivery hub.
 * Requires Admin, Superadmin, or Delivery Manager role.
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER', 'WAREHOUSE_MANAGER', 'MANAGER'];
    if (!allowedRoles.includes(user.role.toUpperCase())) {
      return NextResponse.json({ error: 'Access Denied: Insufficient permissions to create a Delivery Hub.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      code,
      address,
      division,
      district,
      upazila,
      contactNumber,
      email,
      capacity,
      managerId,
      operatingHours,
      coverageAreas,
      latitude,
      longitude
    } = body;

    if (!name || !address || !division || !district) {
      return NextResponse.json({ error: 'Hub Name, Address, Division, and District are required.' }, { status: 400 });
    }

    // Auto-generate code if missing
    let resolvedCode = code ? code.trim().toUpperCase() : '';
    if (!resolvedCode) {
      const prefix = district.substring(0, 3).toUpperCase();
      const count = await prisma.deliveryHub.count();
      resolvedCode = `HUB-${prefix}-${String(count + 1).padStart(2, '0')}`;
    }

    // Check unique code
    const existingCode = await prisma.deliveryHub.findUnique({
      where: { code: resolvedCode }
    });
    if (existingCode) {
      return NextResponse.json({ error: `Hub with code '${resolvedCode}' already exists.` }, { status: 400 });
    }

    let parsedCoverage = coverageAreas;
    if (Array.isArray(coverageAreas)) {
      parsedCoverage = JSON.stringify(coverageAreas);
    } else if (typeof coverageAreas === 'string' && !coverageAreas.startsWith('[')) {
      parsedCoverage = JSON.stringify(coverageAreas.split(',').map(s => s.trim()).filter(Boolean));
    }

    const hub = await prisma.deliveryHub.create({
      data: {
        name: name.trim(),
        code: resolvedCode,
        address: address.trim(),
        division: division.trim(),
        district: district.trim(),
        upazila: upazila ? upazila.trim() : null,
        contactNumber: contactNumber ? contactNumber.trim() : null,
        email: email ? email.trim() : null,
        capacity: capacity ? parseInt(capacity, 10) : 500,
        status: 'ACTIVE',
        managerId: managerId || null,
        operatingHours: operatingHours ? operatingHours.trim() : '8:00 AM - 10:00 PM',
        coverageAreas: parsedCoverage || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      }
    });

    await logAdminAction(user.id, `CREATE_DELIVERY_HUB: Code=${hub.code}, Name=${hub.name}, District=${hub.district}`);

    return NextResponse.json({
      success: true,
      message: `Delivery Hub '${hub.name}' (${hub.code}) created successfully.`,
      hub
    }, { status: 201 });
  } catch (err: any) {
    console.error('Hub POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
