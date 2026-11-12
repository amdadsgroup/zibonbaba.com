import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan, logAdminAction } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;

    let pref = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!pref) {
      pref = await prisma.notificationPreference.create({
        data: {
          userId,
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
          whatsappEnabled: false,
          telegramEnabled: false,
          marketingMuted: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        channels: {
          inApp: true,
          push: pref.pushEnabled,
          sms: pref.smsEnabled,
          email: pref.emailEnabled,
          whatsapp: pref.whatsappEnabled
        },
        triggers: {
          newAssignment: true,
          orderStatusUpdate: true,
          deliveryReminder: true,
          earningsAlert: true,
          withdrawalUpdate: true,
          accountSecurity: true,
          promotions: !pref.marketingMuted
        }
      }
    });
  } catch (err: any) {
    console.error('Notification Preferences GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const body = await request.json();
    const { channels, triggers } = body;

    const emailEnabled = channels?.email !== undefined ? Boolean(channels.email) : undefined;
    const smsEnabled = channels?.sms !== undefined ? Boolean(channels.sms) : undefined;
    const pushEnabled = channels?.push !== undefined ? Boolean(channels.push) : undefined;
    const whatsappEnabled = channels?.whatsapp !== undefined ? Boolean(channels.whatsapp) : undefined;
    const marketingMuted = triggers?.promotions !== undefined ? !triggers.promotions : undefined;

    const updated = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        emailEnabled,
        smsEnabled,
        pushEnabled,
        whatsappEnabled,
        marketingMuted
      },
      create: {
        userId,
        emailEnabled: emailEnabled ?? true,
        smsEnabled: smsEnabled ?? true,
        pushEnabled: pushEnabled ?? true,
        whatsappEnabled: whatsappEnabled ?? false,
        marketingMuted: marketingMuted ?? false
      }
    });

    await logAdminAction(userId, `NOTIFICATION_PREFERENCES_UPDATED: DriverId=${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Notification preferences saved successfully.',
      preferences: {
        channels: {
          inApp: true,
          push: updated.pushEnabled,
          sms: updated.smsEnabled,
          email: updated.emailEnabled,
          whatsapp: updated.whatsappEnabled
        },
        triggers: {
          newAssignment: triggers?.newAssignment ?? true,
          orderStatusUpdate: triggers?.orderStatusUpdate ?? true,
          deliveryReminder: triggers?.deliveryReminder ?? true,
          earningsAlert: triggers?.earningsAlert ?? true,
          withdrawalUpdate: triggers?.withdrawalUpdate ?? true,
          accountSecurity: triggers?.accountSecurity ?? true,
          promotions: !updated.marketingMuted
        }
      }
    });
  } catch (err: any) {
    console.error('Notification Preferences PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
