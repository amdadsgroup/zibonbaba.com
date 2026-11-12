import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan, logAdminAction } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { realtimeEngine } from '@/lib/services/realtimeEngine';
import { PlatformEventType } from '@/lib/constants/events';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikocqacatdvhrameqeox.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qC9hzMB61EWQLVH7flBdXA_GurkO2rd';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const formData = await request.formData();
    const file = formData.get('photo') as File | null || formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided for upload.' }, { status: 400 });
    }

    // 1. Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    // 2. Validate file size (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit. Please upload an image under 5MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let avatarUrl: string = '';

    // 3. Upload to Supabase Storage
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `delivery_riders/${userId}_${timestamp}.${fileExt}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        avatarUrl = publicUrlData.publicUrl;
      } else {
        // Fallback to data URL if bucket is unreachable or storage restricted
        const base64 = buffer.toString('base64');
        avatarUrl = `data:${file.type};base64,${base64}`;
      }
    } catch (storageErr) {
      console.warn('Supabase storage avatar fallback:', storageErr);
      const base64 = buffer.toString('base64');
      avatarUrl = `data:${file.type};base64,${base64}`;
    }

    // 4. Update User Avatar in Database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl }
    });

    // 5. Audit log
    await logAdminAction(userId, `DELIVERY_PHOTO_UPLOADED: DriverId=${userId}`);

    // 6. Real-time broadcast
    await realtimeEngine.broadcast({
      eventId: `evt_photo_${Date.now()}`,
      eventType: PlatformEventType.DELIVERY_PROFILE_UPDATED,
      aggregateType: 'DELIVERY',
      aggregateId: userId,
      timestamp: new Date().toISOString(),
      channels: ['role:ADMIN', 'role:DELIVERY_MAN', `user:${userId}`],
      data: {
        userId,
        avatar: avatarUrl
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile photo updated successfully.',
      avatar: avatarUrl
    });
  } catch (err: any) {
    console.error('Delivery Profile Photo Upload Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: null }
    });

    // Audit log
    await logAdminAction(userId, `DELIVERY_PHOTO_REMOVED: DriverId=${userId}`);

    // Real-time broadcast
    await realtimeEngine.broadcast({
      eventId: `evt_photo_del_${Date.now()}`,
      eventType: PlatformEventType.DELIVERY_PROFILE_UPDATED,
      aggregateType: 'DELIVERY',
      aggregateId: userId,
      timestamp: new Date().toISOString(),
      channels: ['role:ADMIN', 'role:DELIVERY_MAN', `user:${userId}`],
      data: {
        userId,
        avatar: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile photo removed successfully. Reset to fallback avatar.'
    });
  } catch (err: any) {
    console.error('Delivery Profile Photo Remove Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
