import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, logAdminAction } from '@/lib/auth';

/**
 * GET /api/hubs/[id]
 * Fetch single hub details, all stationed riders, and active parcel queues.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hub = await prisma.deliveryHub.findFirst({
      where: {
        OR: [
          { id },
          { code: id }
        ]
      },
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
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                avatar: true,
                walletBalance: true,
                profile: { select: { fullName: true } }
              }
            }
          }
        },
        assignments: {
          include: {
            order: {
              include: {
                customer: { include: { profile: true } },
                resellerOrder: true,
                store: { select: { name: true } },
                items: {
                  include: {
                    variant: { include: { product: true } }
                  }
                }
              }
            },
            deliveryMan: {
              select: {
                id: true,
                email: true,
                phone: true,
                profile: { select: { fullName: true } }
              }
            }
          },
          orderBy: { assignedAt: 'desc' }
        },
        orders: {
          where: {
            status: { in: ['PENDING', 'PROCESSING', 'READY_FOR_DELIVERY'] }
          },
          include: {
            customer: { include: { profile: true } },
            resellerOrder: true,
            store: { select: { name: true } }
          }
        }
      }
    });

    if (!hub) {
      return NextResponse.json({ error: 'Delivery Hub not found.' }, { status: 404 });
    }

    const onlineRiders = hub.riders.filter(r => r.isOnline);
    const offlineRiders = hub.riders.filter(r => !r.isOnline);

    const activeAssignments = hub.assignments.filter(a =>
      ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(a.status)
    );
    const deliveredAssignments = hub.assignments.filter(a => a.status === 'DELIVERED');
    const failedAssignments = hub.assignments.filter(a => a.status === 'FAILED' || a.status === 'RETURNED');

    let coverageList: string[] = [];
    if (hub.coverageAreas) {
      try {
        coverageList = JSON.parse(hub.coverageAreas);
      } catch (_) {
        coverageList = hub.coverageAreas.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    return NextResponse.json({
      success: true,
      hub: {
        id: hub.id,
        name: hub.name,
        code: hub.code,
        address: hub.address,
        division: hub.division,
        district: hub.district,
        upazila: hub.upazila,
        contactNumber: hub.contactNumber,
        email: hub.email,
        capacity: hub.capacity,
        status: hub.status,
        operatingHours: hub.operatingHours,
        coverageAreas: coverageList,
        latitude: hub.latitude,
        longitude: hub.longitude,
        manager: hub.manager ? {
          id: hub.manager.id,
          name: hub.manager.profile?.fullName || hub.manager.email.split('@')[0],
          email: hub.manager.email,
          phone: hub.manager.phone
        } : null,
        stats: {
          totalRiders: hub.riders.length,
          onlineRiders: onlineRiders.length,
          offlineRiders: offlineRiders.length,
          activeParcels: activeAssignments.length,
          deliveredCount: deliveredAssignments.length,
          failedCount: failedAssignments.length,
          totalCodInTransit: activeAssignments.reduce((s, a) => s + (a.codAmount || 0), 0),
          totalCodCollected: deliveredAssignments.filter(a => a.codCollected).reduce((s, a) => s + (a.codAmount || 0), 0)
        },
        riders: hub.riders.map(r => ({
          id: r.id,
          userId: r.userId,
          name: r.user?.profile?.fullName || r.user?.email.split('@')[0] || 'Rider',
          email: r.user?.email,
          phone: r.user?.phone || 'N/A',
          avatar: r.user?.avatar,
          vehicleType: r.vehicleType,
          vehicleNumber: r.vehicleNumber || 'N/A',
          drivingLicense: r.drivingLicense || 'N/A',
          preferredZone: r.preferredZone || 'Hub Territory',
          isOnline: r.isOnline,
          availabilityStatus: r.availabilityStatus,
          cashInHand: r.cashInHand,
          completedDeliveries: r.completedDeliveries,
          failedDeliveries: r.failedDeliveries,
          totalEarnings: r.totalEarnings,
          walletBalance: r.user?.walletBalance || 0
        })),
        activeAssignments: activeAssignments.map(a => {
          const ro = a.order?.resellerOrder;
          const cust = a.order?.customer;
          return {
            id: a.id,
            orderId: a.orderId,
            status: a.status,
            customerName: ro?.customerName || cust?.profile?.fullName || 'Customer',
            customerPhone: ro?.customerPhone || cust?.phone || 'N/A',
            address: ro?.shippingAddress || 'Customer Address',
            codAmount: a.codAmount,
            deliveryFee: a.deliveryFee,
            deliveryOtp: a.deliveryOtp,
            riderName: a.deliveryMan?.profile?.fullName || a.deliveryMan?.email.split('@')[0] || 'Unassigned',
            riderPhone: a.deliveryMan?.phone || 'N/A',
            storeName: a.order?.store?.name || 'Zibonbaba Store',
            assignedAt: a.assignedAt.toISOString(),
            pickedUpAt: a.pickedUpAt?.toISOString() || null
          };
        })
      }
    });
  } catch (err: any) {
    console.error('Hub Detail GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/hubs/[id]
 * Update hub configuration, manager assignment, capacity, or status.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER', 'MANAGER'];
    if (!allowedRoles.includes(user.role.toUpperCase())) {
      return NextResponse.json({ error: 'Access Denied: Insufficient permissions.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      address,
      division,
      district,
      upazila,
      contactNumber,
      email,
      capacity,
      status,
      managerId,
      operatingHours,
      coverageAreas,
      latitude,
      longitude
    } = body;

    let parsedCoverage = coverageAreas;
    if (Array.isArray(coverageAreas)) {
      parsedCoverage = JSON.stringify(coverageAreas);
    } else if (typeof coverageAreas === 'string' && !coverageAreas.startsWith('[')) {
      parsedCoverage = JSON.stringify(coverageAreas.split(',').map(s => s.trim()).filter(Boolean));
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (address) updateData.address = address.trim();
    if (division) updateData.division = division.trim();
    if (district) updateData.district = district.trim();
    if (upazila !== undefined) updateData.upazila = upazila ? upazila.trim() : null;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber ? contactNumber.trim() : null;
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (capacity) updateData.capacity = parseInt(capacity, 10);
    if (status) updateData.status = status.toUpperCase().trim();
    if (managerId !== undefined) updateData.managerId = managerId || null;
    if (operatingHours) updateData.operatingHours = operatingHours.trim();
    if (parsedCoverage !== undefined) updateData.coverageAreas = parsedCoverage;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;

    const updated = await prisma.deliveryHub.update({
      where: { id },
      data: updateData
    });

    await logAdminAction(user.id, `UPDATE_DELIVERY_HUB: HubId=${id}, Status=${updated.status}`);

    return NextResponse.json({
      success: true,
      message: `Delivery Hub '${updated.name}' updated successfully.`,
      hub: updated
    });
  } catch (err: any) {
    console.error('Hub Detail PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/hubs/[id]
 * Delete or deactivate empty delivery hub.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    if (user.role.toUpperCase() !== 'SUPER_ADMIN' && user.role.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Access Denied: Only Superadmin can delete hubs.' }, { status: 403 });
    }

    const { id } = await params;

    // Check if hub has active shipments
    const activeShipmentsCount = await prisma.deliveryAssignment.count({
      where: {
        hubId: id,
        status: { in: ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] }
      }
    });

    if (activeShipmentsCount > 0) {
      return NextResponse.json({
        error: `Cannot delete hub. There are ${activeShipmentsCount} active parcel deliveries in progress. Reassign or complete them first.`
      }, { status: 400 });
    }

    await prisma.deliveryHub.delete({
      where: { id }
    });

    await logAdminAction(user.id, `DELETE_DELIVERY_HUB: HubId=${id}`);

    return NextResponse.json({
      success: true,
      message: 'Delivery Hub deleted successfully.'
    });
  } catch (err: any) {
    console.error('Hub DELETE Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
