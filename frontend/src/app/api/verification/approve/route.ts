import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, userId, storeId } = body;

    let targetUserId = userId;

    // 1. If it's a verification request record
    if (id && !id.startsWith('store-')) {
      const vr = await prisma.verificationRequest.findUnique({ where: { id } });
      if (vr) {
        targetUserId = vr.userId;
        await prisma.verificationRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewedAt: new Date(),
            reviewNote: 'Approved by Administrator.'
          }
        });
      }
    }

    // 2. Approve store if storeId or userId given
    let updatedStore = null;
    if (storeId) {
      updatedStore = await prisma.store.update({
        where: { id: storeId },
        data: { isApproved: true }
      });
    } else if (targetUserId) {
      const userStores = await prisma.store.findMany({ where: { ownerId: targetUserId } });
      for (const st of userStores) {
        await prisma.store.update({
          where: { id: st.id },
          data: { isApproved: true }
        });
      }
      if (userStores.length > 0) updatedStore = userStores[0];
    }

    // 3. Update User status & role to VENDOR_ADMIN if pending
    if (targetUserId) {
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          status: 'ACTIVE',
          role: 'VENDOR_ADMIN'
        }
      });

      // 4. Create in-app notification for the vendor
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: 'Store & KYC Application Approved! 🎉',
          body: 'Congratulations! Your merchant store application and KYC documentation have been reviewed and approved. You may now upload products and start selling.',
          type: 'SUCCESS',
          priority: 'HIGH',
          module: 'MARKETPLACE'
        }
      });
    }

    await logAdminAction(
      auth.user?.id || null,
      `Approved vendor KYC/Store for user [${targetUserId}]`
    );

    return NextResponse.json({
      success: true,
      message: 'Seller verification request approved successfully.',
      store: updatedStore
    });
  } catch (err: any) {
    console.error('Approve Verification Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
