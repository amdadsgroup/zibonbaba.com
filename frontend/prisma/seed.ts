import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🚀 Starting Master Database Seeding for Zibonbaba.com Platform...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. CLEANUP PREVIOUS RECORDS IN PROPER DEPENDENCY ORDER
  console.log('🧹 Clearing previous records...');
  try {
    // Try raw cascade truncate for fastest and cleanest reset
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "WithdrawalRequest",
        "DeliveryAssignment",
        "DeliveryProfile",
        "DeliveryHub",
        "ResellerOrder",
        "ResellerCustomer",
        "ResellerProduct",
        "ResellerProfile",
        "TicketMessage",
        "SupportTicket",
        "Referral",
        "LoyaltyTransaction",
        "WalletTransaction",
        "Notification",
        "NotificationPreference",
        "NotificationRule",
        "LoginHistory",
        "Device",
        "StaffMember",
        "VerificationRequest",
        "UserRole",
        "RolePermission",
        "Permission",
        "Role",
        "AuditLog",
        "Session",
        "CRMClient",
        "CRMNote",
        "Coupon",
        "Employee",
        "PasswordResetToken",
        "Expense",
        "Supplier",
        "OrderItem",
        "Order",
        "Inventory",
        "Branch",
        "Warehouse",
        "ProductVariant",
        "Product",
        "Category",
        "Store",
        "Address",
        "Profile",
        "Wishlist",
        "User"
      CASCADE;
    `);
    console.log('✓ Tables truncated cleanly via CASCADE.');
  } catch (err: any) {
    console.log('Cascade truncate note, falling back to ordered deleteMany:', err?.message || err);
    await prisma.withdrawalRequest.deleteMany().catch(() => {});
    await prisma.deliveryAssignment.deleteMany().catch(() => {});
    await prisma.deliveryProfile.deleteMany().catch(() => {});
    await prisma.deliveryHub.deleteMany().catch(() => {});
    await prisma.resellerOrder.deleteMany().catch(() => {});
    await prisma.resellerCustomer.deleteMany().catch(() => {});
    await prisma.resellerProduct.deleteMany().catch(() => {});
    await prisma.resellerProfile.deleteMany().catch(() => {});
    await prisma.ticketMessage.deleteMany().catch(() => {});
    await prisma.supportTicket.deleteMany().catch(() => {});
    await prisma.referral.deleteMany().catch(() => {});
    await prisma.loyaltyTransaction.deleteMany().catch(() => {});
    await prisma.walletTransaction.deleteMany().catch(() => {});
    await prisma.notification.deleteMany().catch(() => {});
    await prisma.notificationPreference.deleteMany().catch(() => {});
    await prisma.notificationRule.deleteMany().catch(() => {});
    await prisma.loginHistory.deleteMany().catch(() => {});
    await prisma.device.deleteMany().catch(() => {});
    await prisma.staffMember.deleteMany().catch(() => {});
    await prisma.verificationRequest.deleteMany().catch(() => {});
    await prisma.userRole.deleteMany().catch(() => {});
    await prisma.rolePermission.deleteMany().catch(() => {});
    await prisma.permission.deleteMany().catch(() => {});
    await prisma.role.deleteMany().catch(() => {});
    await prisma.auditLog.deleteMany().catch(() => {});
    await prisma.session.deleteMany().catch(() => {});
    await prisma.cRMClient.deleteMany().catch(() => {});
    await prisma.cRMNote.deleteMany().catch(() => {});
    await prisma.coupon.deleteMany().catch(() => {});
    await prisma.employee.deleteMany().catch(() => {});
    await prisma.passwordResetToken.deleteMany().catch(() => {});
    await prisma.expense.deleteMany().catch(() => {});
    await prisma.supplier.deleteMany().catch(() => {});
    await prisma.orderItem.deleteMany().catch(() => {});
    await prisma.order.deleteMany().catch(() => {});
    await prisma.inventory.deleteMany().catch(() => {});
    await prisma.branch.deleteMany().catch(() => {});
    await prisma.warehouse.deleteMany().catch(() => {});
    await prisma.productVariant.deleteMany().catch(() => {});
    await prisma.product.deleteMany().catch(() => {});
    await prisma.category.deleteMany().catch(() => {});
    await prisma.store.deleteMany().catch(() => {});
    await prisma.address.deleteMany().catch(() => {});
    await prisma.profile.deleteMany().catch(() => {});
    await prisma.wishlist.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
  }

  // 2. PERMISSIONS
  console.log('🔑 Seeding System Permissions...');
  const permissionsList = [
    { key: 'create:users', label: 'Create Users', group: 'Users' },
    { key: 'view:users', label: 'View Users', group: 'Users' },
    { key: 'edit:users', label: 'Edit Users', group: 'Users' },
    { key: 'delete:users', label: 'Delete Users', group: 'Users' },
    { key: 'suspend:users', label: 'Suspend Users', group: 'Users' },
    { key: 'verify:users', label: 'Verify Users', group: 'Users' },
    { key: 'create:products', label: 'Create Products', group: 'Products' },
    { key: 'view:products', label: 'View Products', group: 'Products' },
    { key: 'edit:products', label: 'Edit Products', group: 'Products' },
    { key: 'delete:products', label: 'Delete Products', group: 'Products' },
    { key: 'view:orders', label: 'View Orders', group: 'Orders' },
    { key: 'manage:orders', label: 'Manage Orders', group: 'Orders' },
    { key: 'cancel:orders', label: 'Cancel Orders', group: 'Orders' },
    { key: 'view:inventory', label: 'View Inventory', group: 'Inventory' },
    { key: 'manage:inventory', label: 'Manage Inventory', group: 'Inventory' },
    { key: 'transfer:stock', label: 'Transfer Stock', group: 'Inventory' },
    { key: 'view:finance', label: 'View Finance', group: 'Finance' },
    { key: 'manage:finance', label: 'Manage Finance', group: 'Finance' },
    { key: 'view:reports', label: 'View Reports', group: 'Finance' },
    { key: 'view:tickets', label: 'View Tickets', group: 'Support' },
    { key: 'manage:tickets', label: 'Manage Tickets', group: 'Support' },
    { key: 'view:vendors', label: 'View Vendors', group: 'Vendors' },
    { key: 'approve:vendors', label: 'Approve Vendors', group: 'Vendors' },
    { key: 'manage:vendors', label: 'Manage Vendors', group: 'Vendors' },
    { key: 'manage:settings', label: 'Manage Settings', group: 'Settings' },
    { key: 'manage:marketing', label: 'Manage Marketing', group: 'Marketing' },
    { key: 'manage:delivery', label: 'Manage Delivery', group: 'Delivery' }
  ];

  const createdPerms: Record<string, string> = {};
  for (const p of permissionsList) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p
    });
    createdPerms[p.key] = perm.id;
  }

  // 3. ROLES
  console.log('🛡️ Seeding Roles & Bindings...');
  const roleNames = [
    { name: 'SUPER_ADMIN', desc: 'Full unrestricted platform access', isSys: true },
    { name: 'ADMIN', desc: 'Platform operational administrator', isSys: true },
    { name: 'MANAGER', desc: 'General manager operations', isSys: true },
    { name: 'ACCOUNTANT', desc: 'Financial records and auditing', isSys: true },
    { name: 'CUSTOMER_SUPPORT', desc: 'Help desk & dispute agent', isSys: true },
    { name: 'MARKETING', desc: 'Campaign and discount manager', isSys: true },
    { name: 'WAREHOUSE_MANAGER', desc: 'Central stock coordinator', isSys: true },
    { name: 'INVENTORY_MANAGER', desc: 'Stock allocation specialist', isSys: true },
    { name: 'DELIVERY_MANAGER', desc: 'Logistics router', isSys: true },
    { name: 'VENDOR_ADMIN', desc: 'Merchant store owner', isSys: true },
    { name: 'VENDOR_STAFF', desc: 'Store floor and cashier clerk', isSys: true },
    { name: 'CUSTOMER', desc: 'Marketplace consumer', isSys: true },
    { name: 'RESELLER', desc: 'Affiliate commission partner', isSys: true },
    { name: 'DELIVERY_MAN', desc: 'Courier rider', isSys: true }
  ];

  const createdRoles: Record<string, string> = {};
  for (const r of roleNames) {
    const roleRecord = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name, description: r.desc, isSystem: r.isSys }
    });
    createdRoles[r.name] = roleRecord.id;

    if (r.name === 'SUPER_ADMIN') {
      for (const pKey of Object.keys(createdPerms)) {
        await prisma.rolePermission.create({
          data: { roleId: roleRecord.id, permissionId: createdPerms[pKey] }
        }).catch(() => {});
      }
    }
  }

  // 4. USER ACCOUNTS (14 ROLES)
  console.log('👤 Seeding 14 Multi-Role Accounts...');
  const usersToCreate = [
    { email: 'superadmin@zibonbaba.com', role: 'SUPER_ADMIN', name: 'Zibonbaba Superadmin', phone: '+8801700000001', balance: 500000, points: 5000 },
    { email: 'admin@zibonbaba.com', role: 'ADMIN', name: 'Platform Admin', phone: '+8801700000002', balance: 250000, points: 2500 },
    { email: 'manager@zibonbaba.com', role: 'MANAGER', name: 'Operations Manager', phone: '+8801700000003', balance: 10000, points: 100 },
    { email: 'accountant@zibonbaba.com', role: 'ACCOUNTANT', name: 'Senior Accountant', phone: '+8801700000004', balance: 15000, points: 150 },
    { email: 'support@zibonbaba.com', role: 'CUSTOMER_SUPPORT', name: 'Support Lead', phone: '+8801700000005', balance: 5000, points: 50 },
    { email: 'marketing@zibonbaba.com', role: 'MARKETING', name: 'Marketing Lead', phone: '+8801700000006', balance: 8000, points: 80 },
    { email: 'warehouse@zibonbaba.com', role: 'WAREHOUSE_MANAGER', name: 'Warehouse Controller', phone: '+8801700000007', balance: 6000, points: 60 },
    { email: 'inventory@zibonbaba.com', role: 'INVENTORY_MANAGER', name: 'Inventory Specialist', phone: '+8801700000008', balance: 6000, points: 60 },
    { email: 'delivery@zibonbaba.com', role: 'DELIVERY_MANAGER', name: 'Logistics Coordinator', phone: '+8801700000009', balance: 7000, points: 70 },
    { email: 'vendor@zibonbaba.com', role: 'VENDOR_ADMIN', name: 'Abir Hasan (Tech Baba)', phone: '+8801711111111', balance: 125000, points: 1200 },
    { email: 'staff@zibonbaba.com', role: 'VENDOR_STAFF', name: 'Tanvir Hossain', phone: '+8801711111112', balance: 3500, points: 30 },
    { email: 'customer@zibonbaba.com', role: 'CUSTOMER', name: 'Rashedul Karim', phone: '+8801799999999', balance: 5000, points: 450 },
    { email: 'reseller@zibonbaba.com', role: 'RESELLER', name: 'Mehedi Hasan', phone: '+8801788888888', balance: 18500, points: 800 },
    { email: 'courier@zibonbaba.com', role: 'DELIVERY_MAN', name: 'Sabbir Ahmed (Rider)', phone: '+8801777777777', balance: 4200, points: 200 }
  ];

  const userMap: Record<string, any> = {};
  for (const u of usersToCreate) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        phone: u.phone,
        passwordHash,
        role: u.role,
        status: 'ACTIVE',
        walletBalance: u.balance,
        loyaltyPoints: u.points,
        referralCode: u.email.split('@')[0].toUpperCase() + '2026',
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        profile: {
          create: {
            fullName: u.name,
            bio: `${u.role} on Zibonbaba Ecosystem`
          }
        },
        notificationPreference: {
          create: {
            emailEnabled: true,
            pushEnabled: true,
            smsEnabled: true
          }
        },
        addresses: {
          create: {
            fullName: u.name,
            phone: u.phone,
            addressLine1: 'House 42, Road 7, Sector 3, Uttara',
            city: 'Dhaka',
            state: 'Dhaka Division',
            postalCode: '1230',
            country: 'Bangladesh',
            isDefault: true
          }
        }
      }
    });

    userMap[u.role] = user;
    userMap[u.email] = user;

    if (createdRoles[u.role]) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: createdRoles[u.role] }
      }).catch(() => {});
    }
  }

  // 5. STORES (10 VENDOR MERCHANTS)
  console.log('🏪 Seeding 10 Verified Vendor Stores...');
  const storeData = [
    { key: 'tech', email: 'vendor@zibonbaba.com', name: 'Tech Baba Electronics', desc: 'Authorized gadget distributor & premium consumer tech.', logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&auto=format&fit=crop' },
    { key: 'glamour', email: 'seller2@zibonbaba.com', name: 'Glamour Baba Beauty', desc: '100% genuine skincare, cosmetics, and wellness goods.', logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop' },
    { key: 'kitchen', email: 'seller3@zibonbaba.com', name: 'Kitchen Baba Hub', desc: 'Smart kitchenware, stainless appliances, and culinary essentials.', logo: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop' },
    { key: 'fashion', email: 'seller4@zibonbaba.com', name: 'Fashion Baba Outfitters', desc: 'Modern street fashion, denim, formal wear, and accessories.', logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop' },
    { key: 'organic', email: 'seller5@zibonbaba.com', name: 'Organic Baba Farm Fresh', desc: 'Pure honeys, mustard oils, organic grains, and pantry staples.', logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop' },
    { key: 'books', email: 'seller6@zibonbaba.com', name: 'Book Baba Library', desc: 'Bestseller novels, academic guides, and literature classics.', logo: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop' },
    { key: 'kids', email: 'seller7@zibonbaba.com', name: 'Kids Baba Toys & Play', desc: 'Educational toys, STEM building blocks, and creative sets.', logo: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&auto=format&fit=crop' },
    { key: 'sports', email: 'seller8@zibonbaba.com', name: 'Fit Baba Athletics', desc: 'Gym equipment, sports apparel, and fitness gear.', logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop' },
    { key: 'auto', email: 'seller9@zibonbaba.com', name: 'Auto Baba Accessories', desc: 'Car maintenance kits, dashcams, and riding accessories.', logo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop' },
    { key: 'jewelry', email: 'seller10@zibonbaba.com', name: 'Luxury Baba Jewels', desc: 'Handcrafted jewelry, timepieces, and accessories.', logo: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&auto=format&fit=crop' }
  ];

  const storeMap: Record<string, any> = {};
  for (const s of storeData) {
    let owner = userMap[s.email];
    if (!owner) {
      owner = await prisma.user.create({
        data: {
          email: s.email,
          passwordHash,
          role: 'VENDOR_ADMIN',
          status: 'ACTIVE',
          walletBalance: 85000,
          profile: { create: { fullName: s.name + ' Owner' } }
        }
      });
    }

    const store = await prisma.store.create({
      data: {
        name: s.name,
        description: s.desc,
        logo: s.logo,
        banner: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop',
        ownerId: owner.id,
        isApproved: true,
        commissionRate: 8.5
      }
    });
    storeMap[s.key] = store;

    if (s.key === 'tech') {
      await prisma.staffMember.create({
        data: {
          sellerId: owner.id,
          userId: userMap['staff@zibonbaba.com'].id,
          jobTitle: 'Sales Floor Lead & POS Operator',
          permissions: JSON.stringify(['view:products', 'manage:orders', 'view:inventory'])
        }
      });
    }
  }

  // 6. WAREHOUSES & BRANCHES
  console.log('🏢 Seeding Warehouses & Retail Branches...');
  const techStore = storeMap['tech'];
  const warehouse1 = await prisma.warehouse.create({
    data: { storeId: techStore.id, name: 'Dhaka Central Hub', location: 'Tejgaon Industrial Area, Dhaka' }
  });

  const branch1 = await prisma.branch.create({
    data: { storeId: techStore.id, name: 'Gulshan Flagship Branch', city: 'Dhaka' }
  });

  // 7. CATEGORIES
  console.log('📁 Seeding Marketplace Categories...');
  const categoriesList = [
    { name: 'Electronics & Gadgets', slug: 'electronics' },
    { name: 'Health & Beauty', slug: 'health-beauty' },
    { name: 'Home & Kitchen', slug: 'home-kitchen' },
    { name: 'Apparel & Fashion', slug: 'apparel-fashion' },
    { name: 'Groceries & Staples', slug: 'groceries' },
    { name: 'Books & Stationery', slug: 'books' },
    { name: 'Toys & Kids', slug: 'toys-games' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors' },
    { name: 'Automotive & Motors', slug: 'automotive' },
    { name: 'Jewelry & Watches', slug: 'jewelry' }
  ];

  const categoryMap: Record<string, any> = {};
  for (const c of categoriesList) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug }
    });
    categoryMap[c.slug] = cat;
  }

  // 8. REAL PRODUCTS WITH VARIANTS & INVENTORY
  console.log('📦 Seeding Products with Inventory...');
  const productCatalog = [
    { cat: 'electronics', store: 'tech', name: 'Zibonbaba ANC Pro Wireless Earbuds', price: 2850, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop', desc: 'Hybrid Active Noise Cancellation, Bluetooth 5.3, 36hr battery case.' },
    { cat: 'electronics', store: 'tech', name: 'Zibonbaba Ultra Smartwatch Series 9', price: 4200, img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop', desc: 'AMOLED 1.9-inch HD display, ECG & SpO2 tracking, IP68 water resistant.' },
    { cat: 'electronics', store: 'tech', name: 'RGB Mechanical Gaming Keyboard', price: 3450, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop', desc: 'Hot-swappable blue tactile switches with programmable macro keys.' },
    { cat: 'electronics', store: 'tech', name: 'BassMax 360 Portable Speaker', price: 1950, img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop', desc: 'IPX7 rugged waterproof cylinder speaker with punchy bass radiators.' },
    { cat: 'health-beauty', store: 'glamour', name: 'Organic Pure Rosehip Face Serum 30ml', price: 1250, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop', desc: 'Deep hydration and anti-aging serum cold-pressed from Chilean rosehip.' },
    { cat: 'health-beauty', store: 'glamour', name: 'Botanical Vitamin C Brightening Cream', price: 950, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop', desc: 'Evens skin tone, reduces dark spots and boosts collagen.' },
    { cat: 'home-kitchen', store: 'kitchen', name: 'Smart Touch Induction Cooktop 2200W', price: 3800, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop', desc: 'Crystal glass surface with 8 preset cooking modes and safety auto-shutoff.' },
    { cat: 'apparel-fashion', store: 'fashion', name: 'Classic Indigo Denim Trucker Jacket', price: 2450, img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop', desc: 'Heavyweight 100% cotton denim with copper shank buttons.' },
    { cat: 'groceries', store: 'organic', name: 'Sundarban Raw Forest Honey 500g', price: 680, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop', desc: '100% natural raw mangrove forest honey loaded with natural pollen.' },
    { cat: 'books', store: 'books', name: 'Atomic Habits by James Clear', price: 650, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop', desc: 'An easy & proven way to build good habits and break bad ones.' }
  ];

  let prodCount = 0;
  const seededProducts: any[] = [];

  for (const item of productCatalog) {
    const category = categoryMap[item.cat];
    const store = storeMap[item.store];

    if (!category || !store) continue;

    const product = await prisma.product.create({
      data: {
        name: item.name,
        description: item.desc,
        basePrice: item.price,
        status: 'PUBLISHED',
        storeId: store.id,
        categoryId: category.id
      }
    });

    const skuBase = item.name.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

    const variant1 = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `${skuBase}-STD`,
        attributes: JSON.stringify({ color: 'Standard', size: 'Regular' }),
        price: item.price
      }
    });

    await prisma.inventory.create({
      data: {
        variantId: variant1.id,
        warehouseId: warehouse1.id,
        quantity: 150,
        reorderPoint: 15
      }
    });

    await prisma.inventory.create({
      data: {
        variantId: variant1.id,
        branchId: branch1.id,
        quantity: 45,
        reorderPoint: 8
      }
    });

    seededProducts.push({ product, variant: variant1, price: item.price });
    prodCount++;
  }

  console.log(`✅ Successfully seeded ${prodCount} Products with variants and inventory.`);

  // 9. ORDERS & TRANSACTIONS
  console.log('🛍️ Seeding Sample Marketplace Orders & POS Sales...');
  const customerUser = userMap['customer@zibonbaba.com'];

  const o1 = await prisma.order.create({
    data: {
      customerId: customerUser.id,
      storeId: techStore.id,
      source: 'ONLINE',
      subTotal: seededProducts[0].price,
      tax: 150,
      discount: 100,
      total: seededProducts[0].price + 50,
      status: 'DELIVERED',
      items: {
        create: {
          variantId: seededProducts[0].variant.id,
          quantity: 1,
          price: seededProducts[0].price
        }
      }
    }
  });

  const o2 = await prisma.order.create({
    data: {
      customerId: customerUser.id,
      storeId: techStore.id,
      source: 'ONLINE',
      subTotal: seededProducts[1].price,
      tax: 100,
      discount: 0,
      total: seededProducts[1].price + 100,
      status: 'PROCESSING',
      items: {
        create: {
          variantId: seededProducts[1].variant.id,
          quantity: 1,
          price: seededProducts[1].price
        }
      }
    }
  });

  // 10. RESELLER & DELIVERY PROFILES, COMMISSIONS, CATALOGS & ASSIGNMENTS
  console.log('🤝 Seeding Reseller & Delivery Man Ecosystems...');
  const resellerUser = userMap['reseller@zibonbaba.com'];
  const courierUser = userMap['courier@zibonbaba.com'];

  if (resellerUser) {
    await prisma.resellerProfile.create({
      data: {
        userId: resellerUser.id,
        businessName: 'Baba Deals & Retail Hub',
        address: 'Flat 4B, Road 12, Banani',
        city: 'Dhaka',
        district: 'Dhaka',
        division: 'Dhaka',
        paymentMethod: 'bKash',
        paymentNumber: '01788888888',
        status: 'ACTIVE',
        commissionRate: 7.5
      }
    });

    for (let i = 0; i < Math.min(6, seededProducts.length); i++) {
      await prisma.resellerProduct.create({
        data: {
          resellerId: resellerUser.id,
          productId: seededProducts[i].product.id,
          resellerPrice: seededProducts[i].price + 450,
          resellerMarkup: 450,
          isActive: true
        }
      });
    }

    await prisma.resellerCustomer.create({
      data: {
        resellerId: resellerUser.id,
        name: 'Tariqul Islam',
        phone: '01712345678',
        address: 'House 14, Road 3, Dhanmondi, Dhaka',
        city: 'Dhaka',
        totalOrders: 3,
        totalSales: 11500,
        totalProfit: 1850
      }
    });

    if (o1) {
      await prisma.resellerOrder.create({
        data: {
          orderId: o1.id,
          resellerId: resellerUser.id,
          customerName: 'Tariqul Islam',
          customerPhone: '01712345678',
          shippingAddress: 'House 14, Road 3, Dhanmondi, Dhaka',
          baseAmount: seededProducts[0].price,
          sellingAmount: seededProducts[0].price + 450,
          resellerProfit: 450,
          platformFee: 0,
          deliveryFee: 120,
          status: 'DELIVERED',
          payoutStatus: 'AVAILABLE'
        }
      });
    }
  }

  // 10. DELIVERY HUBS & COURIER FLEET ECOSYSTEM
  console.log('🚚 Seeding 6 Regional Delivery Hubs & Stationing Riders...');
  const deliveryManagerUser = userMap['delivery@zibonbaba.com'];

  const dhakaHub = await prisma.deliveryHub.create({
    data: {
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
      managerId: deliveryManagerUser?.id || null,
      operatingHours: '7:30 AM - 11:00 PM',
      coverageAreas: JSON.stringify(['Tejgaon', 'Gulshan', 'Banani', 'Dhanmondi', 'Mohakhali', 'Badda', 'Mirpur']),
      latitude: 23.7594,
      longitude: 90.3906
    }
  });

  const uttaraHub = await prisma.deliveryHub.create({
    data: {
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
      managerId: deliveryManagerUser?.id || null,
      operatingHours: '8:00 AM - 10:00 PM',
      coverageAreas: JSON.stringify(['Uttara', 'Airport', 'Khilkhet', 'Tongi', 'Gazipur Border', 'Dania']),
      latitude: 23.8759,
      longitude: 90.3795
    }
  });

  const ctgHub = await prisma.deliveryHub.create({
    data: {
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

  const sylhetHub = await prisma.deliveryHub.create({
    data: {
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

  const khulnaHub = await prisma.deliveryHub.create({
    data: {
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

  const rajshahiHub = await prisma.deliveryHub.create({
    data: {
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

  // Station Rider 1 at Dhaka Central Hub
  if (courierUser) {
    await prisma.deliveryProfile.create({
      data: {
        userId: courierUser.id,
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

    if (o1) {
      await prisma.order.update({
        where: { id: o1.id },
        data: { hubId: dhakaHub.id }
      });

      await prisma.deliveryAssignment.create({
        data: {
          orderId: o1.id,
          deliveryManId: courierUser.id,
          hubId: dhakaHub.id,
          status: 'DELIVERED',
          deliveryOtp: '1234',
          codAmount: seededProducts[0].price + 50,
          codCollected: true,
          deliveryFee: 150,
          specialInstructions: 'Fragile electronic item - handle with extra care.',
          pickedUpAt: new Date(Date.now() - 3600000 * 2),
          deliveredAt: new Date(Date.now() - 3600000),
          proofNotes: 'Handed over directly to customer at door.'
        }
      });
    }

    if (o2) {
      await prisma.order.update({
        where: { id: o2.id },
        data: { hubId: dhakaHub.id }
      });

      await prisma.deliveryAssignment.create({
        data: {
          orderId: o2.id,
          deliveryManId: courierUser.id,
          hubId: dhakaHub.id,
          status: 'IN_TRANSIT',
          deliveryOtp: '8492',
          codAmount: seededProducts[1].price + 100,
          codCollected: false,
          deliveryFee: 120,
          specialInstructions: 'Call customer 10 minutes prior to arrival.',
          pickedUpAt: new Date(Date.now() - 1800000)
        }
      });
    }
  }

  // Station Rider 2 (Uttara Dispatch Hub)
  const rider2User = await prisma.user.create({
    data: {
      email: 'courier2@zibonbaba.com',
      phone: '+8801777777778',
      passwordHash,
      role: 'DELIVERY_MAN',
      status: 'ACTIVE',
      walletBalance: 3200,
      loyaltyPoints: 120,
      profile: {
        create: {
          fullName: 'Tanvir Hasan (Uttara Fleet)',
          bio: 'Express motorcycle courier for Northern Dhaka zones'
        }
      },
      deliveryProfile: {
        create: {
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
      }
    }
  });
  if (createdRoles['DELIVERY_MAN']) {
    await prisma.userRole.create({
      data: { userId: rider2User.id, roleId: createdRoles['DELIVERY_MAN'] }
    }).catch(() => {});
  }

  // Station Rider 3 (Chattogram Port Hub)
  const rider3User = await prisma.user.create({
    data: {
      email: 'courier3@zibonbaba.com',
      phone: '+8801811223344',
      passwordHash,
      role: 'DELIVERY_MAN',
      status: 'ACTIVE',
      walletBalance: 4800,
      loyaltyPoints: 210,
      profile: {
        create: {
          fullName: 'Rasel Mia (CTG Express)',
          bio: 'Senior parcel delivery rider stationed at Agrabad Port Hub'
        }
      },
      deliveryProfile: {
        create: {
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
      }
    }
  });
  if (createdRoles['DELIVERY_MAN']) {
    await prisma.userRole.create({
      data: { userId: rider3User.id, roleId: createdRoles['DELIVERY_MAN'] }
    }).catch(() => {});
  }

  // Withdrawal Requests
  if (resellerUser) {
    await prisma.withdrawalRequest.create({
      data: {
        userId: resellerUser.id,
        role: 'RESELLER',
        amount: 5000,
        paymentMethod: 'bKash',
        accountNumber: '01788888888',
        status: 'COMPLETED',
        transactionRef: 'TRX_BKASH_99281',
        processedAt: new Date()
      }
    });
  }

  if (courierUser) {
    await prisma.withdrawalRequest.create({
      data: {
        userId: courierUser.id,
        role: 'DELIVERY_MAN',
        amount: 2500,
        paymentMethod: 'Nagad',
        accountNumber: '01777777777',
        status: 'PENDING'
      }
    });
  }

  // 11. NOTIFICATION ENGINE RULES & WELCOME NOTIFICATIONS
  console.log('🔔 Seeding Notification Engine Rules...');
  const notificationRules = [
    { triggerEvent: 'ORDER_PLACED', actionPayload: { roles: ['CUSTOMER', 'VENDOR_ADMIN'], channels: ['In-App', 'Email', 'SMS'] } },
    { triggerEvent: 'ORDER_DELIVERED', actionPayload: { roles: ['CUSTOMER', 'DELIVERY_MAN'], channels: ['In-App', 'Push'] } },
    { triggerEvent: 'LOW_STOCK_ALERT', actionPayload: { roles: ['VENDOR_ADMIN', 'INVENTORY_MANAGER'], channels: ['In-App'] } },
    { triggerEvent: 'KYC_APPROVED', actionPayload: { roles: ['VENDOR_ADMIN'], channels: ['In-App', 'Email'] } }
  ];

  for (const nr of notificationRules) {
    await prisma.notificationRule.create({
      data: { triggerEvent: nr.triggerEvent, actionPayload: JSON.stringify(nr.actionPayload), isActive: true }
    });
  }

  for (const u of usersToCreate) {
    const usr = userMap[u.email];
    if (usr) {
      await prisma.notification.create({
        data: {
          userId: usr.id,
          title: `Welcome to Zibonbaba Platform, ${u.name}!`,
          body: `Your ${u.role} portal has been initialized and verified with full privileges.`,
          type: 'SUCCESS',
          priority: 'HIGH',
          module: 'MARKETPLACE',
          isRead: false
        }
      });
    }
  }

  // 12. CRM CLIENTS & EXPENSES
  console.log('📊 Seeding CRM Records & Vendor Expenses...');
  await prisma.cRMClient.create({
    data: { name: 'Rahim Telecom Ltd', email: 'rahim@telecom.bd', phone: '+8801811223344', spentTotal: 45200 }
  });

  await prisma.expense.create({
    data: { storeId: techStore.id, desc: 'Tejgaon Central Warehouse Electricity & Solar bill', category: 'Utilities', amount: 8450 }
  });

  // 13. AUDIT LOG
  console.log('📝 Seeding System Audit Trail...');
  await prisma.auditLog.create({
    data: { userId: userMap['superadmin@zibonbaba.com'].id, action: 'SYSTEM_BOOTSTRAP_COMPLETE', ipAddress: '127.0.0.1' }
  });

  console.log('🎉 MASTER SEEDING COMPLETE! The Zibonbaba platform is fully populated with real data.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
