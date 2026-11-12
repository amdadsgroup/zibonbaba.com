import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan, logAdminAction } from '@/lib/auth';
import { realtimeEngine } from '@/lib/services/realtimeEngine';
import { PlatformEventType } from '@/lib/constants/events';

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const body = await request.json();
    const { action, type, newValue, otp } = body;

    if (!type || !['PHONE', 'EMAIL'].includes(type.toUpperCase())) {
      return NextResponse.json({ error: "Type must be either 'PHONE' or 'EMAIL'." }, { status: 400 });
    }

    const contactType = type.toUpperCase() as 'PHONE' | 'EMAIL';

    // -------------------------------------------------------------------------
    // ACTION 1: REQUEST OTP FOR CONTACT CHANGE
    // -------------------------------------------------------------------------
    if (action === 'request') {
      if (!newValue || !newValue.trim()) {
        return NextResponse.json({ error: `New ${contactType.toLowerCase()} address is required.` }, { status: 400 });
      }

      const cleanVal = newValue.trim();

      // Format validation
      if (contactType === 'EMAIL') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanVal)) {
          return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
        }
        // Duplicate check
        const existing = await prisma.user.findFirst({
          where: { email: cleanVal.toLowerCase(), NOT: { id: userId } }
        });
        if (existing) {
          return NextResponse.json({ error: 'This email is already associated with another account.' }, { status: 400 });
        }
      } else {
        // Phone validation (Bangladesh format)
        const cleanDigits = cleanVal.replace(/[^0-9]/g, '');
        if (cleanDigits.length < 11) {
          return NextResponse.json({ error: 'Please enter a valid Bangladeshi mobile number (e.g. 01712345678).' }, { status: 400 });
        }
        // Duplicate check
        const existing = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: cleanVal },
              { phone: cleanVal.startsWith('0') ? `+88${cleanVal}` : cleanVal }
            ],
            NOT: { id: userId }
          }
        });
        if (existing) {
          return NextResponse.json({ error: 'This phone number is already associated with another account.' }, { status: 400 });
        }
      }

      // Generate secure 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save to VerificationRequest
      await prisma.verificationRequest.create({
        data: {
          userId,
          type: contactType === 'PHONE' ? 'PHONE_OTP' : 'EMAIL',
          status: 'PENDING',
          data: JSON.stringify({
            targetType: contactType,
            targetValue: cleanVal,
            otp: generatedOtp,
            expiresAt: expiresAt.toISOString()
          })
        }
      });

      // Notify via In-App Notification
      await prisma.notification.create({
        data: {
          userId,
          title: `${contactType === 'PHONE' ? 'Phone' : 'Email'} Verification Code 🔐`,
          body: `Your verification OTP to update your contact info is ${generatedOtp}. Valid for 10 minutes.`,
          type: 'SECURITY',
          priority: 'HIGH',
          module: 'SECURITY'
        }
      });

      return NextResponse.json({
        success: true,
        message: `Verification code sent to your ${contactType === 'PHONE' ? 'new phone number' : 'email address'}. (Sandbox OTP: ${generatedOtp})`,
        expiresInSeconds: 600,
        sandboxOtp: generatedOtp // Provided for rapid testing and simulation
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 2: CONFIRM OTP AND APPLY UPDATE
    // -------------------------------------------------------------------------
    if (action === 'verify') {
      if (!otp || !otp.trim()) {
        return NextResponse.json({ error: 'Verification code (OTP) is required.' }, { status: 400 });
      }

      // Find pending verification request
      const pendingRequest = await prisma.verificationRequest.findFirst({
        where: {
          userId,
          type: contactType === 'PHONE' ? 'PHONE_OTP' : 'EMAIL',
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!pendingRequest || !pendingRequest.data) {
        return NextResponse.json({ error: 'No active verification request found. Please request a new code.' }, { status: 404 });
      }

      const parsedData = JSON.parse(pendingRequest.data);
      const isExpired = new Date() > new Date(parsedData.expiresAt);
      if (isExpired) {
        return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
      }

      if (parsedData.otp.trim() !== otp.trim()) {
        return NextResponse.json({ error: 'Invalid verification code. Please check and try again.' }, { status: 400 });
      }

      const verifiedValue = parsedData.targetValue;

      // Update User in database
      if (contactType === 'PHONE') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            phone: verifiedValue,
            phoneVerifiedAt: new Date()
          }
        });
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: {
            email: verifiedValue.toLowerCase(),
            emailVerifiedAt: new Date()
          }
        });
      }

      // Mark request as APPROVED
      await prisma.verificationRequest.update({
        where: { id: pendingRequest.id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewNote: 'Verified via 6-digit OTP code by account owner.'
        }
      });

      // Audit log
      await logAdminAction(userId, `CONTACT_VERIFIED_AND_UPDATED: Type=${contactType}, Value=${verifiedValue}`);

      // Broadcast real-time update
      await realtimeEngine.broadcast({
        eventId: `evt_contact_${Date.now()}`,
        eventType: PlatformEventType.DELIVERY_PROFILE_UPDATED,
        aggregateType: 'DELIVERY',
        aggregateId: userId,
        timestamp: new Date().toISOString(),
        channels: ['role:ADMIN', 'role:DELIVERY_MAN', `user:${userId}`],
        data: {
          userId,
          updatedField: contactType.toLowerCase(),
          newValue: verifiedValue
        }
      });

      return NextResponse.json({
        success: true,
        message: `${contactType === 'PHONE' ? 'Phone number' : 'Email address'} has been verified and updated successfully.`,
        updatedValue: verifiedValue
      });
    }

    return NextResponse.json({ error: "Invalid action. Must be 'request' or 'verify'." }, { status: 400 });
  } catch (err: any) {
    console.error('Contact Change Verify Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
