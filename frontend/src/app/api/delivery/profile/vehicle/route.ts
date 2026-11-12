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
      vehicleType,
      vehicleModel,
      vehicleNumber,
      vehicleColor,
      vehicleOwnership,
      drivingLicense,
      licenseStatus
    } = body;

    const allowedTypes = ['BIKE', 'MOTORCYCLE', 'CYCLE', 'SCOOTER', 'RICKSHAW', 'VAN', 'TRUCK', 'CAR', 'ON_FOOT', 'OTHER'];
    const resolvedType = vehicleType ? vehicleType.toUpperCase().trim() : undefined;
    if (resolvedType && !allowedTypes.includes(resolvedType)) {
      return NextResponse.json({ error: `Invalid vehicle type: ${vehicleType}` }, { status: 400 });
    }

    const updatedProfile = await prisma.deliveryProfile.upsert({
      where: { userId },
      create: {
        userId,
        vehicleType: resolvedType || 'MOTORCYCLE',
        vehicleModel: vehicleModel ? vehicleModel.trim() : null,
        vehicleNumber: vehicleNumber ? vehicleNumber.trim() : null,
        vehicleColor: vehicleColor ? vehicleColor.trim() : null,
        vehicleOwnership: vehicleOwnership ? vehicleOwnership.trim() : 'OWNED',
        drivingLicense: drivingLicense ? drivingLicense.trim() : null,
        licenseStatus: licenseStatus ? licenseStatus.trim() : 'ACTIVE'
      },
      update: {
        vehicleType: resolvedType !== undefined ? resolvedType : undefined,
        vehicleModel: vehicleModel !== undefined ? (vehicleModel ? vehicleModel.trim() : null) : undefined,
        vehicleNumber: vehicleNumber !== undefined ? (vehicleNumber ? vehicleNumber.trim() : null) : undefined,
        vehicleColor: vehicleColor !== undefined ? (vehicleColor ? vehicleColor.trim() : null) : undefined,
        vehicleOwnership: vehicleOwnership !== undefined ? (vehicleOwnership ? vehicleOwnership.trim() : 'OWNED') : undefined,
        drivingLicense: drivingLicense !== undefined ? (drivingLicense ? drivingLicense.trim() : null) : undefined,
        licenseStatus: licenseStatus !== undefined ? (licenseStatus ? licenseStatus.trim() : 'ACTIVE') : undefined
      }
    });

    // Audit log
    await logAdminAction(userId, `DELIVERY_VEHICLE_UPDATED: Type=${resolvedType || updatedProfile.vehicleType}, Plate=${vehicleNumber || 'N/A'}`);

    // Real-time broadcast
    await realtimeEngine.broadcast({
      eventId: `evt_veh_${Date.now()}`,
      eventType: PlatformEventType.DELIVERY_PROFILE_UPDATED,
      aggregateType: 'DELIVERY',
      aggregateId: userId,
      timestamp: new Date().toISOString(),
      channels: ['role:ADMIN', 'role:DELIVERY_MAN', `user:${userId}`],
      data: {
        userId,
        section: 'vehicle',
        vehicle: {
          vehicleType: updatedProfile.vehicleType,
          vehicleModel: updatedProfile.vehicleModel,
          vehicleNumber: updatedProfile.vehicleNumber,
          vehicleColor: updatedProfile.vehicleColor,
          vehicleOwnership: updatedProfile.vehicleOwnership,
          drivingLicense: updatedProfile.drivingLicense,
          licenseStatus: updatedProfile.licenseStatus
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Vehicle information updated successfully.',
      deliveryProfile: updatedProfile
    });
  } catch (err: any) {
    console.error('Delivery Profile Vehicle PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
