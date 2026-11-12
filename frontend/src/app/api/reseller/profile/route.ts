import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireReseller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        resellerProfile: true
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        phone: user?.phone,
        fullName: user?.profile?.fullName || '',
        avatar: user?.avatar,
        walletBalance: user?.walletBalance || 0
      },
      resellerProfile: user?.resellerProfile || null
    });
  } catch (err: any) {
    console.error('Reseller Profile GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const body = await request.json();
    const {
      fullName,
      phone,
      businessName,
      address,
      city,
      district,
      division,
      nidNumber,
      paymentMethod,
      paymentNumber,
      bankName,
      bankAccount,
      bankBranch
    } = body;

    // Update User & Profile
    if (fullName || phone) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          phone: phone || undefined,
          profile: {
            upsert: {
              create: { fullName: fullName || '' },
              update: { fullName: fullName || undefined }
            }
          }
        }
      });
    }

    // Update ResellerProfile
    const updatedProfile = await prisma.resellerProfile.upsert({
      where: { userId },
      update: {
        businessName: businessName || undefined,
        address: address !== undefined ? address : undefined,
        city: city !== undefined ? city : undefined,
        district: district !== undefined ? district : undefined,
        division: division !== undefined ? division : undefined,
        nidNumber: nidNumber !== undefined ? nidNumber : undefined,
        paymentMethod: paymentMethod || undefined,
        paymentNumber: paymentNumber !== undefined ? paymentNumber : undefined,
        bankName: bankName !== undefined ? bankName : undefined,
        bankAccount: bankAccount !== undefined ? bankAccount : undefined,
        bankBranch: bankBranch !== undefined ? bankBranch : undefined
      },
      create: {
        userId,
        businessName: businessName || 'My Reseller Hub',
        address: address || null,
        city: city || null,
        district: district || null,
        division: division || null,
        nidNumber: nidNumber || null,
        paymentMethod: paymentMethod || 'bKash',
        paymentNumber: paymentNumber || null,
        bankName: bankName || null,
        bankAccount: bankAccount || null,
        bankBranch: bankBranch || null,
        status: 'ACTIVE',
        commissionRate: 5.0
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Reseller profile updated successfully.',
      resellerProfile: updatedProfile
    });
  } catch (err: any) {
    console.error('Reseller Profile PUT API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
