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
    const { fullName, dateOfBirth, gender, emergencyContact } = body;

    // Direct phone or email changes are protected and require OTP verification
    if (body.phone !== undefined || body.email !== undefined) {
      return NextResponse.json(
        { error: 'Direct phone or email update is restricted. Please use the contact verification process with OTP.' },
        { status: 400 }
      );
    }

    if (fullName && fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Full name must be at least 2 characters.' }, { status: 400 });
    }

    // Update Profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: (fullName || '').trim(),
        dateOfBirth: dateOfBirth || null,
        gender: gender || null
      },
      update: {
        fullName: fullName !== undefined ? fullName.trim() : undefined,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : undefined,
        gender: gender !== undefined ? gender : undefined
      }
    });

    // Update emergency contact on DeliveryProfile if provided
    if (emergencyContact !== undefined) {
      await prisma.deliveryProfile.upsert({
        where: { userId },
        create: {
          userId,
          emergencyContact: emergencyContact ? emergencyContact.trim() : null
        },
        update: {
          emergencyContact: emergencyContact ? emergencyContact.trim() : null
        }
      });
    }

    // Audit log
    await logAdminAction(userId, `DELIVERY_PERSONAL_INFO_UPDATED: FullName=${fullName || 'unchanged'}`);

    // Real-time broadcast
    await realtimeEngine.broadcast({
      eventId: `evt_pers_${Date.now()}`,
      eventType: PlatformEventType.DELIVERY_PROFILE_UPDATED,
      aggregateType: 'DELIVERY',
      aggregateId: userId,
      timestamp: new Date().toISOString(),
      channels: ['role:ADMIN', 'role:DELIVERY_MAN', `user:${userId}`],
      data: {
        userId,
        section: 'personal',
        profile: updatedProfile
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Personal information updated successfully.',
      profile: updatedProfile
    });
  } catch (err: any) {
    console.error('Delivery Profile Personal PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
