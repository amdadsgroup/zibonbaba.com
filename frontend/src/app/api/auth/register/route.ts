import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkRateLimit } from '@/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'zibonbaba_super_secure_jwt_session_secret_token_123';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikocqacatdvhrameqeox.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qC9hzMB61EWQLVH7flBdXA_GurkO2rd';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate unique referral code (e.g. ZB8X9K2)
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ZB';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  // 1. Rate limiting protection (Max 5 registration requests per minute per IP)
  const rateLimitResponse = checkRateLimit(request, 'register', { limit: 5, windowSeconds: 60 });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const {
      fullName,
      name,
      email,
      password,
      phone,
      role = 'CUSTOMER',
      referralCode,
      storeName,
      businessType
    } = body;

    const resolvedName = (fullName || name || '').trim();
    if (!resolvedName) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : null;

    // Normalize Role
    let normalizedRole = 'CUSTOMER';
    const rUpper = String(role).toUpperCase();
    if (rUpper === 'VENDOR_ADMIN' || rUpper === 'VENDOR' || rUpper === 'SELLER') {
      normalizedRole = 'VENDOR_ADMIN';
    } else if (rUpper === 'RESELLER') {
      normalizedRole = 'RESELLER';
    } else if (rUpper === 'DELIVERY_MAN' || rUpper === 'DELIVERYMAN') {
      normalizedRole = 'DELIVERY_MAN';
    }

    // 1. Check if user already exists in Prisma Database
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in instead.' },
        { status: 409 }
      );
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Register user in Supabase Auth (best-effort sync)
    try {
      await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: resolvedName,
            role: normalizedRole,
            phone: cleanPhone
          }
        }
      });
    } catch (supaErr) {
      console.warn('Supabase Auth SignUp sync notice:', supaErr);
    }

    // 4. Generate unique referral code
    let uniqueReferralCode = generateReferralCode();
    let isCodeTaken = await prisma.user.findUnique({ where: { referralCode: uniqueReferralCode } });
    let attempts = 0;
    while (isCodeTaken && attempts < 5) {
      uniqueReferralCode = generateReferralCode();
      isCodeTaken = await prisma.user.findUnique({ where: { referralCode: uniqueReferralCode } });
      attempts++;
    }

    // 5. Create Prisma User with Profile and optional Store, ResellerProfile, or DeliveryProfile
    const isSeller = normalizedRole === 'VENDOR_ADMIN';
    const isReseller = normalizedRole === 'RESELLER';
    const isDelivery = normalizedRole === 'DELIVERY_MAN';

    let finalStoreName = storeName ? storeName.trim() : (isSeller ? `${resolvedName}'s Store` : undefined);
    if (finalStoreName) {
      const existingStore = await prisma.store.findUnique({ where: { name: finalStoreName } });
      if (existingStore) {
        finalStoreName = `${finalStoreName} (${Date.now().toString().slice(-4)})`;
      }
    }

    const {
      businessName,
      address,
      district,
      division,
      city,
      paymentMethod,
      paymentNumber,
      vehicleType,
      preferredZone,
      emergencyContact,
      nidNumber
    } = body;

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: normalizedRole,
        status: isSeller ? 'PENDING' : 'ACTIVE',
        referralCode: uniqueReferralCode,
        loyaltyPoints: 100, // Welcome signup bonus
        profile: {
          create: {
            fullName: resolvedName,
          }
        },
        ...(isSeller && finalStoreName ? {
          stores: {
            create: {
              name: finalStoreName,
              description: businessType ? `Category / Type: ${businessType}` : undefined,
              isApproved: false, // Requires admin review
              commissionRate: 8.5
            }
          },
          verifications: {
            create: {
              type: 'TRADE_LICENSE',
              status: 'PENDING',
              data: JSON.stringify({
                storeName: finalStoreName,
                businessType: businessType || 'General Retail',
                phone: cleanPhone
              })
            }
          }
        } : {}),
        ...(isReseller ? {
          resellerProfile: {
            create: {
              businessName: businessName || `${resolvedName} Reseller Hub`,
              address: address || null,
              district: district || null,
              division: division || null,
              city: city || null,
              paymentMethod: paymentMethod || 'bKash',
              paymentNumber: paymentNumber || cleanPhone || null,
              status: 'ACTIVE',
              commissionRate: 5.0
            }
          }
        } : {}),
        ...(isDelivery ? {
          deliveryProfile: {
            create: {
              vehicleType: vehicleType || 'BIKE',
              preferredZone: preferredZone || district || 'Dhaka Central',
              emergencyContact: emergencyContact || null,
              nidNumber: nidNumber || null,
              district: district || null,
              division: division || null,
              status: 'APPROVED',
              availabilityStatus: 'OFFLINE'
            }
          }
        } : {}),
        notifications: {
          create: {
            title: isSeller
              ? 'Store Application Submitted 🏪'
              : isReseller
              ? 'Welcome to Reseller Portal! 🚀'
              : isDelivery
              ? 'Welcome to Delivery Network! 🛵'
              : 'Welcome to Zibonbaba! 🎉',
            body: isSeller
              ? `Welcome ${resolvedName}! Your store application for "${finalStoreName || 'My Store'}" has been received and is pending admin verification.`
              : isReseller
              ? `Welcome ${resolvedName}! Your Reseller account is active. Browse products, set your profit margins, and start earning.`
              : isDelivery
              ? `Welcome ${resolvedName}! Your Delivery account is ready. Go Online in your dashboard to receive shipment assignments.`
              : `Welcome ${resolvedName}! Your account has been registered successfully. You received 100 welcome bonus loyalty points!`,
            type: 'SUCCESS',
            module: isReseller ? 'MARKETPLACE' : isDelivery ? 'DELIVERY' : 'MARKETPLACE',
            priority: 'INFO'
          }
        }
      },
      include: {
        profile: true,
        stores: true,
        resellerProfile: true,
        deliveryProfile: true
      }
    });

    // 6. Handle Referral code if provided by customer
    if (referralCode && typeof referralCode === 'string' && referralCode.trim()) {
      try {
        const cleanRef = referralCode.trim().toUpperCase();
        const referrer = await prisma.user.findUnique({
          where: { referralCode: cleanRef }
        });

        if (referrer && referrer.id !== newUser.id) {
          await prisma.referral.create({
            data: {
              ownerId: referrer.id,
              usedById: newUser.id,
              code: cleanRef,
              rewardGiven: true,
              usedAt: new Date()
            }
          });

          await prisma.user.update({
            where: { id: referrer.id },
            data: { loyaltyPoints: { increment: 50 } }
          });

          await prisma.loyaltyTransaction.create({
            data: {
              userId: referrer.id,
              type: 'EARN',
              points: 50,
              description: `Referral bonus for inviting ${resolvedName}`
            }
          });

          await prisma.user.update({
            where: { id: newUser.id },
            data: { loyaltyPoints: { increment: 25 } }
          });

          await prisma.loyaltyTransaction.create({
            data: {
              userId: newUser.id,
              type: 'EARN',
              points: 25,
              description: `Welcome bonus for using referral code ${cleanRef}`
            }
          });
        }
      } catch (refErr) {
        console.error('Referral Processing Notice:', refErr);
      }
    }

    // 7. Generate JWT Session Token
    const payload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    const primaryStore = newUser.stores && newUser.stores.length > 0 ? newUser.stores[0] : null;

    const responseUser = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.profile?.fullName || resolvedName,
      avatar: newUser.avatar || null,
      phone: newUser.phone,
      referralCode: newUser.referralCode,
      loyaltyPoints: newUser.loyaltyPoints
    };

    const userJson = encodeURIComponent(JSON.stringify(responseUser));

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully.',
        accessToken,
        user: responseUser,
        store: primaryStore
      },
      { status: 201 }
    );

    // 8. Set Auth Cookies for immediate seamless login session
    response.cookies.set('zibonbaba_token', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 604800 // 7 days
    });
    response.cookies.set('zibonbaba_role', responseUser.role, {
      path: '/',
      sameSite: 'lax',
      maxAge: 604800
    });
    response.cookies.set('zibonbaba_user', userJson, {
      path: '/',
      sameSite: 'lax',
      maxAge: 604800
    });

    return response;
  } catch (err: any) {
    console.error('Registration API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error during registration.' },
      { status: 500 }
    );
  }
}
