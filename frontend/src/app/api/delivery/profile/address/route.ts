import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan, logAdminAction } from '@/lib/auth';
import { realtimeEngine } from '@/lib/services/realtimeEngine';
import { PlatformEventType } from '@/lib/constants/events';

export async function PATCH(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const body = await request.json();
    const {
      division,
      district,
      upazila,
      unionWard,
      area,
      fullAddress,
      postalCode
    } = body;

    const updatedProfile = await prisma.deliveryProfile.upsert({
      where: { userId },
      create: {
        userId,
        division: division ? division.trim() : 'Dhaka',
        district: district ? district.trim() : 'Dhaka',
        upazila: upazila ? upazila.trim() : null,
        unionWard: unionWard ? unionWard.trim() : null,
        area: area ? area.trim() : null,
        fullAddress: fullAddress ? fullAddress.trim() : null,
        postalCode: postalCode ? postalCode.trim() : null,
        preferredZone: area || upazila || district || 'Dhaka Central'
      },
      update: {
        division: division !== undefined ? (division ? division.trim() : null) : undefined,
        district: district !== undefined ? (district ? district.trim() : null) : undefined,
        upazila: upazila !== undefined ? (upazila ? upazila.trim() : null) : undefined,
        unionWard: unionWard !== undefined ? (unionWard ? unionWard.trim() : null) : undefined,
        area: area !== undefined ? (area ? area.trim() : null) : undefined,
        fullAddress: fullAddress !== undefined ? (fullAddress ? fullAddress.trim() : null) : undefined,
        postalCode: postalCode !== undefined ? (postalCode ? postalCode.trim() : null) : undefined
      }
    });

    // Also sync default Address entity
    if (fullAddress || district || division) {
      const existingAddress = await prisma.address.findFirst({
        where: { userId, isDefault: true }
      });

      if (existingAddress) {
        await prisma.address.update({
          where: { id: existingAddress.id },
          data: {
            addressLine1: fullAddress ? fullAddress.trim() : existingAddress.addressLine1,
            city: district ? district.trim() : existingAddress.city,
            state: division ? division.trim() : existingAddress.state,
            postalCode: postalCode ? postalCode.trim() : existingAddress.postalCode
          }
        });
      } else {
        await prisma.address.create({
          data: {
            userId,
            label: 'Home',
            fullName: context.user.fullName || context.user.email,
            phone: context.user.email,
            addressLine1: fullAddress ? fullAddress.trim() : `${district || 'Dhaka'}, Bangladesh`,
            city: district ? district.trim() : 'Dhaka',
            state: division ? division.trim() : 'Dhaka',
            postalCode: postalCode ? postalCode.trim() : '1200',
            isDefault: true
          }
        });
      }
    }

    // Audit log
    await logAdminAction(userId, `DELIVERY_ADDRESS_UPDATED: District=${district || 'Dhaka'}, Division=${division || 'Dhaka'}`);

    // Real-time broadcast
    await realtimeEngine.broadcast({
      eventId: `evt_addr_${Date.now()}`,
      eventType: PlatformEventType.DELIVERY_PROFILE_UPDATED,
      aggregateType: 'DELIVERY',
      aggregateId: userId,
      timestamp: new Date().toISOString(),
      channels: ['role:ADMIN', 'role:DELIVERY_MAN', `user:${userId}`],
      data: {
        userId,
        section: 'address',
        address: {
          division,
          district,
          upazila,
          unionWard,
          area,
          fullAddress,
          postalCode
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Address information updated successfully.',
      deliveryProfile: updatedProfile
    });
  } catch (err: any) {
    console.error('Delivery Profile Address PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
