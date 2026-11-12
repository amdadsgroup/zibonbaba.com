const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function runSeed() {
  console.log('🚀 Running High-Speed Robust Seed for Delivery Hubs & Platform...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. ROLES
  console.log('🛡️ Upserting Roles...');
  const roleNames = [
    { name: 'SUPER_ADMIN', desc: 'Full unrestricted platform access', isSys: true },
    { name: 'ADMIN', desc: 'Platform operational administrator', isSys: true },
    { name: 'DELIVERY_MANAGER', desc: 'Logistics Coordinator & Hub Manager', isSys: true },
    { name: 'DELIVERY_MAN', desc: 'Courier rider', isSys: true },
    { name: 'VENDOR_ADMIN', desc: 'Merchant store owner', isSys: true },
    { name: 'CUSTOMER', desc: 'Marketplace consumer', isSys: true },
    { name: 'RESELLER', desc: 'Affiliate commission partner', isSys: true }
  ];

  for (const r of roleNames) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name, description: r.desc, isSystem: r.isSys }
    });
  }

  // 2. USERS
  console.log('👤 Upserting Core Users...');
  const usersToSeed = [
    { email: 'superadmin@zibonbaba.com', role: 'SUPER_ADMIN', name: 'Zibonbaba Superadmin', phone: '+8801700000001' },
    { email: 'admin@zibonbaba.com', role: 'ADMIN', name: 'Platform Admin', phone: '+8801700000002' },
    { email: 'delivery@zibonbaba.com', role: 'DELIVERY_MANAGER', name: 'Logistics Coordinator', phone: '+8801700000009' },
    { email: 'courier@zibonbaba.com', role: 'DELIVERY_MAN', name: 'Sabbir Ahmed (Dhaka Central Rider)', phone: '+8801777777777' },
    { email: 'courier2@zibonbaba.com', role: 'DELIVERY_MAN', name: 'Tanvir Hasan (Uttara Express Rider)', phone: '+8801777777778' },
    { email: 'courier3@zibonbaba.com', role: 'DELIVERY_MAN', name: 'Rasel Mia (CTG Port Rider)', phone: '+8801811223344' },
    { email: 'vendor@zibonbaba.com', role: 'VENDOR_ADMIN', name: 'Abir Hasan (Tech Baba)', phone: '+8801711111111' },
    { email: 'customer@zibonbaba.com', role: 'CUSTOMER', name: 'Rashedul Karim', phone: '+8801799999999' },
    { email: 'reseller@zibonbaba.com', role: 'RESELLER', name: 'Mehedi Hasan', phone: '+8801788888888' }
  ];

  const userMap = {};
  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        status: 'ACTIVE'
      },
      create: {
        email: u.email,
        phone: u.phone,
        passwordHash,
        role: u.role,
        status: 'ACTIVE',
        walletBalance: 15000,
        loyaltyPoints: 500,
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        profile: {
          create: {
            fullName: u.name,
            bio: `${u.role} on Zibonbaba Platform`
          }
        }
      }
    });
    userMap[u.email] = user;
    userMap[u.role] = user;
  }

  // 3. STORE & PRODUCTS
  console.log('🏪 Upserting Store & Products...');
  const vendorUser = userMap['vendor@zibonbaba.com'];
  let store = await prisma.store.findFirst({ where: { ownerId: vendorUser.id } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: 'Tech Baba Official Store',
        description: 'Premium consumer electronics and smart accessories',
        ownerId: vendorUser.id,
        isApproved: true,
        commissionRate: 8.5
      }
    });
  }

  const category = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics & Gadgets',
      slug: 'electronics'
    }
  });

  let product1 = await prisma.product.findFirst({ where: { storeId: store.id, name: 'Zibonbaba ANC Pro Wireless Earbuds' } });
  if (!product1) {
    product1 = await prisma.product.create({
      data: {
        name: 'Zibonbaba ANC Pro Wireless Earbuds',
        description: 'Hybrid Active Noise Cancellation, Bluetooth 5.3, 36hr battery case.',
        basePrice: 2850,
        status: 'PUBLISHED',
        storeId: store.id,
        categoryId: category.id,
        variants: {
          create: {
            sku: 'ANC-PRO-STD',
            attributes: JSON.stringify({ color: 'Matte Black', size: 'Standard' }),
            price: 2850
          }
        }
      },
      include: { variants: true }
    });
  } else {
    product1 = await prisma.product.findUnique({ where: { id: product1.id }, include: { variants: true } });
  }

  let product2 = await prisma.product.findFirst({ where: { storeId: store.id, name: 'Zibonbaba Ultra Smartwatch Series 9' } });
  if (!product2) {
    product2 = await prisma.product.create({
      data: {
        name: 'Zibonbaba Ultra Smartwatch Series 9',
        description: 'AMOLED 1.9-inch HD display, ECG & SpO2 tracking, IP68 water resistant.',
        basePrice: 4200,
        status: 'PUBLISHED',
        storeId: store.id,
        categoryId: category.id,
        variants: {
          create: {
            sku: 'WATCH9-PRO',
            attributes: JSON.stringify({ color: 'Titanium Silver', size: '45mm' }),
            price: 4200
          }
        }
      },
      include: { variants: true }
    });
  } else {
    product2 = await prisma.product.findUnique({ where: { id: product2.id }, include: { variants: true } });
  }

  // 4. DELIVERY HUBS
  console.log('🚚 Seeding 6 Regional Delivery Hubs...');
  const deliveryManager = userMap['delivery@zibonbaba.com'];

  const dhakaHub = await prisma.deliveryHub.upsert({
    where: { code: 'HUB-DHK-01' },
    update: {
      managerId: deliveryManager?.id || null
    },
    create: {
      name: 'Dhaka Central Hub',
      code: 'HUB-DHK-01',
      address: 'Plot 14, Road 5, Tejgaon Industrial Area, Dhaka',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Tejgaon',
      contactNumber: '+8801700000009',
      email: 'dhaka.hub@zibonbaba.com',
      capacity: 1200,
      status: 'ACTIVE',
      managerId: deliveryManager?.id || null,
      operatingHours: '7:30 AM - 11:00 PM',
      coverageAreas: JSON.stringify(['Tejgaon', 'Gulshan', 'Banani', 'Dhanmondi', 'Mohakhali', 'Badda', 'Mirpur']),
      latitude: 23.7594,
      longitude: 90.3906
    }
  });

  const uttaraHub = await prisma.deliveryHub.upsert({
    where: { code: 'HUB-UTR-02' },
    update: {},
    create: {
      name: 'Uttara Dispatch Hub',
      code: 'HUB-UTR-02',
      address: 'House 32, Road 18, Sector 3, Uttara, Dhaka',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Uttara',
      contactNumber: '+8801711223399',
      email: 'uttara.hub@zibonbaba.com',
      capacity: 800,
      status: 'ACTIVE',
      managerId: deliveryManager?.id || null,
      operatingHours: '8:00 AM - 10:00 PM',
      coverageAreas: JSON.stringify(['Uttara', 'Airport', 'Khilkhet', 'Tongi', 'Gazipur Border', 'Dania']),
      latitude: 23.8759,
      longitude: 90.3795
    }
  });

  const ctgHub = await prisma.deliveryHub.upsert({
    where: { code: 'HUB-CTG-01' },
    update: {},
    create: {
      name: 'Chattogram Port Hub',
      code: 'HUB-CTG-01',
      address: 'Holding 89, Agrabad Commercial Area, Chattogram',
      division: 'Chattogram',
      district: 'Chattogram',
      upazila: 'Double Mooring',
      contactNumber: '+8801811998877',
      email: 'ctg.hub@zibonbaba.com',
      capacity: 950,
      status: 'ACTIVE',
      operatingHours: '8:00 AM - 10:30 PM',
      coverageAreas: JSON.stringify(['Agrabad', 'GEC Circle', 'Nasirabad', 'Halishahar', 'Chawkbazar', 'Patenga']),
      latitude: 22.3275,
      longitude: 91.8123
    }
  });

  const sylhetHub = await prisma.deliveryHub.upsert({
    where: { code: 'HUB-SYL-01' },
    update: {},
    create: {
      name: 'Sylhet Express Hub',
      code: 'HUB-SYL-01',
      address: 'Shubidbazar Road, Zindabazar, Sylhet',
      division: 'Sylhet',
      district: 'Sylhet',
      upazila: 'Sylhet Sadar',
      contactNumber: '+8801733445566',
      email: 'sylhet.hub@zibonbaba.com',
      capacity: 600,
      status: 'ACTIVE',
      operatingHours: '8:30 AM - 9:30 PM',
      coverageAreas: JSON.stringify(['Zindabazar', 'Amberkhana', 'Shahi Eidgah', 'Subidbazar', 'Kumarpara']),
      latitude: 24.8949,
      longitude: 91.8687
    }
  });

  const khulnaHub = await prisma.deliveryHub.upsert({
    where: { code: 'HUB-KLN-01' },
    update: {},
    create: {
      name: 'Khulna Logistics Hub',
      code: 'HUB-KLN-01',
      address: 'KDA Avenue, Shib Bari Mor, Khulna',
      division: 'Khulna',
      district: 'Khulna',
      upazila: 'Sonadanga',
      contactNumber: '+8801922334455',
      email: 'khulna.hub@zibonbaba.com',
      capacity: 500,
      status: 'ACTIVE',
      operatingHours: '8:30 AM - 9:00 PM',
      coverageAreas: JSON.stringify(['Shib Bari', 'Sonadanga', 'Boyra', 'Khalishpur', 'Daulatpur']),
      latitude: 22.8456,
      longitude: 89.5403
    }
  });

  const rajshahiHub = await prisma.deliveryHub.upsert({
    where: { code: 'HUB-RAJ-01' },
    update: {},
    create: {
      name: 'Rajshahi Regional Hub',
      code: 'HUB-RAJ-01',
      address: 'Station Road, Shaheb Bazar, Rajshahi',
      division: 'Rajshahi',
      district: 'Rajshahi',
      upazila: 'Boalia',
      contactNumber: '+8801744556677',
      email: 'rajshahi.hub@zibonbaba.com',
      capacity: 450,
      status: 'ACTIVE',
      operatingHours: '8:30 AM - 9:00 PM',
      coverageAreas: JSON.stringify(['Shaheb Bazar', 'Motihar', 'Kazla', 'Upashahar', 'Talaimari']),
      latitude: 24.3745,
      longitude: 88.6042
    }
  });

  // 5. STATION RIDERS
  console.log('🛵 Stationing Riders at Delivery Hubs...');
  const rider1 = userMap['courier@zibonbaba.com'];
  const rider2 = userMap['courier2@zibonbaba.com'];
  const rider3 = userMap['courier3@zibonbaba.com'];

  await prisma.deliveryProfile.upsert({
    where: { userId: rider1.id },
    update: { hubId: dhakaHub.id, isOnline: true },
    create: {
      userId: rider1.id,
      hubId: dhakaHub.id,
      vehicleType: 'MOTORCYCLE',
      vehicleNumber: 'DHAKA-METRO-HA-12-3456',
      drivingLicense: 'DL-88239012',
      nidNumber: '1995827361928',
      emergencyContact: '01700000099',
      preferredZone: 'Tejgaon, Gulshan, Banani',
      isOnline: true,
      availabilityStatus: 'ONLINE',
      cashInHand: 4200,
      totalEarnings: 8500,
      completedDeliveries: 28,
      failedDeliveries: 1,
      status: 'APPROVED'
    }
  });

  await prisma.deliveryProfile.upsert({
    where: { userId: rider2.id },
    update: { hubId: uttaraHub.id, isOnline: true },
    create: {
      userId: rider2.id,
      hubId: uttaraHub.id,
      vehicleType: 'MOTORCYCLE',
      vehicleNumber: 'DHAKA-METRO-LA-44-8899',
      drivingLicense: 'DL-77382910',
      nidNumber: '1996283746192',
      emergencyContact: '+8801711002233',
      preferredZone: 'Uttara, Airport, Tongi',
      isOnline: true,
      availabilityStatus: 'ONLINE',
      cashInHand: 2400,
      totalEarnings: 6200,
      completedDeliveries: 19,
      failedDeliveries: 0,
      status: 'APPROVED'
    }
  });

  await prisma.deliveryProfile.upsert({
    where: { userId: rider3.id },
    update: { hubId: ctgHub.id, isOnline: true },
    create: {
      userId: rider3.id,
      hubId: ctgHub.id,
      vehicleType: 'VAN',
      vehicleNumber: 'CHATTO-METRO-CHA-11-2233',
      drivingLicense: 'DL-99482019',
      nidNumber: '1994726152839',
      emergencyContact: '+8801811009988',
      preferredZone: 'Agrabad, GEC, Halishahar',
      isOnline: true,
      availabilityStatus: 'ONLINE',
      cashInHand: 5600,
      totalEarnings: 11400,
      completedDeliveries: 42,
      failedDeliveries: 2,
      status: 'APPROVED'
    }
  });

  // 6. SAMPLE ORDERS READY FOR DISPATCH IN HUBS
  console.log('📦 Seeding Sample Parcels in Hub Queue...');
  const customer = userMap['customer@zibonbaba.com'];

  const order1 = await prisma.order.create({
    data: {
      customerId: customer.id,
      storeId: store.id,
      hubId: dhakaHub.id,
      source: 'ONLINE',
      subTotal: 2850,
      tax: 150,
      discount: 0,
      total: 3000,
      status: 'PROCESSING',
      items: {
        create: {
          variantId: product1.variants[0].id,
          quantity: 1,
          price: 2850
        }
      },
      deliveryAssignment: {
        create: {
          deliveryManId: rider1.id,
          hubId: dhakaHub.id,
          status: 'ASSIGNED',
          deliveryOtp: '4821',
          deliveryFee: 120,
          codAmount: 3000,
          specialInstructions: 'Handle with care - premium ANC wireless earbuds.'
        }
      }
    }
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: customer.id,
      storeId: store.id,
      hubId: dhakaHub.id,
      source: 'ONLINE',
      subTotal: 4200,
      tax: 200,
      discount: 100,
      total: 4300,
      status: 'READY_FOR_DELIVERY',
      items: {
        create: {
          variantId: product2.variants[0].id,
          quantity: 1,
          price: 4200
        }
      }
    }
  });

  const order3 = await prisma.order.create({
    data: {
      customerId: customer.id,
      storeId: store.id,
      hubId: uttaraHub.id,
      source: 'ONLINE',
      subTotal: 2850,
      tax: 150,
      discount: 50,
      total: 2950,
      status: 'PENDING',
      items: {
        create: {
          variantId: product1.variants[0].id,
          quantity: 1,
          price: 2850
        }
      }
    }
  });

  console.log('🎉 HIGH-SPEED SEED COMPLETE! 6 Regional Hubs & Stationed Fleet Ready.');
}

runSeed()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
