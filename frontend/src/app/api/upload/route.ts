import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikocqacatdvhrameqeox.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qC9hzMB61EWQLVH7flBdXA_GurkO2rd';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'products';
    const customFolder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate allowed buckets
    const allowedBuckets = ['products', 'avatars', 'stores', 'documents', 'banners'];
    const targetBucket = allowedBuckets.includes(bucket) ? bucket : 'products';

    // Generate unique safe file name
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${customFolder}/${timestamp}_${randomStr}_${sanitizedName}`;

    // Convert file to ArrayBuffer / Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
      bucket: targetBucket,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (err: any) {
    console.error('Upload API route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error during upload' },
      { status: 500 }
    );
  }
}
