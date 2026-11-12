import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

declare const process: any;

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Master Database Seeding for Zibonbaba.com Platform...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. CLEAR EXISTING DATA CLEANLY
  console.log('🧹 Clearing previous records...');
  try {
    await prisma.ticketMessage.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.referral.deleteMany();
    await prisma.loyaltyTransaction.deleteMany();
    await prisma.walletTransaction.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.notificationPreference.deleteMany();
    await prisma.notificationRule.deleteMany();
    await prisma.loginHistory.deleteMany();
    await prisma.device.deleteMany();
    await prisma.staffMember.deleteMany();
    await prisma.verificationRequest.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.cRMClient.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.store.deleteMany();
    await prisma.address.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.user.deleteMany();
  } catch (err) {
    console.log('Note during clean up:', err);
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
    const perm = await prisma.permission.create({ data: p });
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
    const roleRecord = await prisma.role.create({
      data: { name: r.name, description: r.desc, isSystem: r.isSys }
    });
    createdRoles[r.name] = roleRecord.id;

    // Super Admin gets all permissions
    if (r.name === 'SUPER_ADMIN') {
      for (const pKey of Object.keys(createdPerms)) {
        await prisma.rolePermission.create({
          data: { roleId: roleRecord.id, permissionId: createdPerms[pKey] }
        });
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

    // Attach UserRole
    if (createdRoles[u.role]) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: createdRoles[u.role] }
      });
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

    // Attach staff for Tech Baba
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
  const warehouse2 = await prisma.warehouse.create({
    data: { storeId: techStore.id, name: 'Chittagong Port Warehouse', location: 'Agrabad C/A, Chittagong' }
  });

  const branch1 = await prisma.branch.create({
    data: { storeId: techStore.id, name: 'Gulshan Flagship Branch', city: 'Dhaka' }
  });
  const branch2 = await prisma.branch.create({
    data: { storeId: techStore.id, name: 'Dhanmondi Retail Counter', city: 'Dhaka' }
  });

  // 7. CATEGORIES
  console.log('📁 Seeding Marketplace Categories...');
  const categoriesList = [
    { name: 'Electronics & Gadgets', slug: 'electronics', storeKey: 'tech' },
    { name: 'Health & Beauty', slug: 'health-beauty', storeKey: 'glamour' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', storeKey: 'kitchen' },
    { name: 'Apparel & Fashion', slug: 'apparel-fashion', storeKey: 'fashion' },
    { name: 'Groceries & Staples', slug: 'groceries', storeKey: 'organic' },
    { name: 'Books & Stationery', slug: 'books', storeKey: 'books' },
    { name: 'Toys & Kids', slug: 'toys-games', storeKey: 'kids' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', storeKey: 'sports' },
    { name: 'Automotive & Motors', slug: 'automotive', storeKey: 'auto' },
    { name: 'Jewelry & Watches', slug: 'jewelry', storeKey: 'jewelry' }
  ];

  const categoryMap: Record<string, any> = {};
  for (const c of categoriesList) {
    const cat = await prisma.category.create({
      data: { name: c.name, slug: c.slug }
    });
    categoryMap[c.slug] = cat;
  }

  // 8. 100+ REAL PRODUCTS WITH VARIANTS & INVENTORY
  console.log('📦 Seeding 100+ Detailed Products with Inventory...');
  const productCatalog = [
    // Electronics
    { cat: 'electronics', store: 'tech', name: 'Zibonbaba ANC Pro Wireless Earbuds', price: 2850, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop', desc: 'Hybrid Active Noise Cancellation, Bluetooth 5.3, 36hr battery case.' },
    { cat: 'electronics', store: 'tech', name: 'Zibonbaba Ultra Smartwatch Series 9', price: 4200, img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop', desc: 'AMOLED 1.9-inch HD display, ECG & SpO2 tracking, IP68 water resistant.' },
    { cat: 'electronics', store: 'tech', name: 'RGB Mechanical Gaming Keyboard', price: 3450, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop', desc: 'Hot-swappable blue tactile switches with programmable macro keys.' },
    { cat: 'electronics', store: 'tech', name: 'BassMax 360 Portable Speaker', price: 1950, img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop', desc: 'IPX7 rugged waterproof cylinder speaker with punchy bass radiators.' },
    { cat: 'electronics', store: 'tech', name: '4K UltraHD Streamer Webcam Pro', price: 2600, img: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop', desc: 'Auto-focus Sony sensor lens, dual noise cancelling microphones.' },
    { cat: 'electronics', store: 'tech', name: 'Ergonomic Precision Wireless Mouse', price: 1450, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop', desc: 'Adjustable 4000 DPI sensor with silent click buttons and thumb rest.' },
    { cat: 'electronics', store: 'tech', name: '6-in-1 Aluminium USB-C Multi Hub', price: 1650, img: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop', desc: '4K HDMI port, 100W Power Delivery, SD/TF readers, 3x USB 3.0.' },
    { cat: 'electronics', store: 'tech', name: 'Studio Ring Light 14-inch Tripod Kit', price: 1750, img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop', desc: 'Tri-color temperature ring light with phone mount & bluetooth remote.' },
    { cat: 'electronics', store: 'tech', name: 'GaN 65W Super Fast Travel Charger', price: 1850, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop', desc: 'Dual Type-C and USB-A fast charging for laptops, tablets, and phones.' },
    { cat: 'electronics', store: 'tech', name: 'Studio Master Over-Ear Headphones', price: 5400, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop', desc: '50mm neodymium drivers, plush memory foam earcups, detachable cable.' },

    // Health & Beauty
    { cat: 'health-beauty', store: 'glamour', name: 'Organic Pure Rosehip Face Serum 30ml', price: 1250, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop', desc: 'Deep hydration and anti-aging serum cold-pressed from Chilean rosehip.' },
    { cat: 'health-beauty', store: 'glamour', name: 'Botanical Vitamin C Brightening Cream', price: 950, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop', desc: 'Evens skin tone, reduces dark spots and boosts collagen with citrus bioflavonoids.' },
    { cat: 'health-beauty', store: 'glamour', name: 'Velvet Matte Longwear Liquid Lipstick', price: 780, img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop', desc: 'Smudge-proof 16hr formula enriched with vitamin E and jojoba oil.' },
    { cat: 'health-beauty', store: 'glamour', name: 'Activated Charcoal Detox Peel Mask', price: 650, img: 'https://images.unsplash.com/photo-1567928815116-f6d0774b74e6?w=600&auto=format&fit=crop', desc: 'Purifies clogged pores, removes blackheads and excess sebum gently.' },
    { cat: 'health-beauty', store: 'glamour', name: 'Sulfate-Free Moroccan Argan Shampoo', price: 850, img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop', desc: 'Restores dry, damaged hair with organic cold-pressed Moroccan argan oil.' },
    { cat: 'health-beauty', store: 'glamour', name: 'Mineral Sunscreen SPF 50+ PA++++', price: 1150, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop', desc: 'Zero white-cast broad spectrum non-comedogenic daily sun fluid.' },
    { cat: 'health-beauty', store: 'glamour', name: 'Hyaluronic Acid Hydrating Essence', price: 1100, img: 'https://images.unsplash.com/photo-1608248597359-bbcf36077366?w=600&auto=format&fit=crop', desc: 'Multi-molecular weight hyaluronic acid formula for plump, dewy skin.' },
    { cat: 'health-beauty', store: 'glamour', name: 'Lavender & Chamomile Night Elixir', price: 1400, img: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop', desc: 'Calming facial oil to repair skin barrier and soothe redness overnight.' },
    { cat: 'health-beauty', store: 'glamour', name: 'Tea Tree Purifying Spot Treatment Gel', price: 480, img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&auto=format&fit=crop', desc: 'Rapid relief acne solution with 5% pure Australian tea tree oil.' },
    { cat: 'health-beauty', store: 'glamour', name: 'Exfoliating Coffee & Sugar Body Scrub', price: 720, img: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=600&auto=format&fit=crop', desc: 'Buffs away dead skin cells leaving skin ultra soft and energised.' },

    // Home & Kitchen
    { cat: 'home-kitchen', store: 'kitchen', name: 'Smart Touch Induction Cooktop 2200W', price: 3800, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop', desc: 'Crystal glass surface with 8 preset cooking modes and safety auto-shutoff.' },
    { cat: 'home-kitchen', store: 'kitchen', name: 'Granite Non-Stick Frying Pan 28cm', price: 1650, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop', desc: '5-layer stone non-stick coating, PFOA free with stay-cool wooden handle.' },
    { cat: 'home-kitchen', store: 'kitchen', name: 'Stainless Steel Electric Kettle 1.8L', price: 1450, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop', desc: 'Fast boiling 1500W element with double-wall cool-touch exterior.' },
    { cat: 'home-kitchen', store: 'kitchen', name: 'High-Speed Smoothie Blender & Grinder', price: 2950, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop', desc: '1000W copper motor with 6 stainless steel crushing blades and 2 to-go cups.' },
    { cat: 'home-kitchen', store: 'kitchen', name: 'Digital Multi-Program Rice Cooker 2.2L', price: 3400, img: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=600&auto=format&fit=crop', desc: 'Fuzzy logic micro-computer cooker with 24hr delay timer and steamer basket.' },
    { cat: 'home-kitchen', store: 'kitchen', name: 'Professional Chef Knife Set (6 Pieces)', price: 2800, img: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&auto=format&fit=crop', desc: 'German high-carbon stainless steel blades with acrylic standing block.' },
    { cat: 'home-kitchen', store: 'kitchen', name: 'Precision Digital Kitchen Scale 5kg', price: 750, img: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop', desc: '0.1g accuracy with tare function and backlit LCD display.' },
    { cat: 'home-kitchen', store: 'kitchen', name: 'Vacuum Insulated Steel Thermos 1L', price: 950, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop', desc: 'Keeps liquids piping hot for 18 hours or ice cold for 24 hours.' },
    { cat: 'home-kitchen', store: 'kitchen', name: 'Food Grade Silicone Cooking Utensil Set', price: 850, img: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop', desc: 'Heat-resistant up to 230°C with ergonomic natural beechwood handles.' },
    { cat: 'home-kitchen', store: 'kitchen', name: 'Aroma Diffuser & Ultrasonic Humidifier', price: 1350, img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop', desc: '500ml tank with 7 LED ambient light colors and whisper-quiet misting.' },

    // Apparel
    { cat: 'apparel-fashion', store: 'fashion', name: 'Classic Indigo Denim Trucker Jacket', price: 2450, img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop', desc: 'Heavyweight 100% cotton denim with copper shank buttons and twin chest pockets.' },
    { cat: 'apparel-fashion', store: 'fashion', name: 'Stretch Slim-Fit Chino Trousers', price: 1550, img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop', desc: 'Premium combed cotton with 2% elastane for flexible all-day comfort.' },
    { cat: 'apparel-fashion', store: 'fashion', name: 'Premium Honeycomb Pique Polo Shirt', price: 980, img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop', desc: 'Breathable organic cotton polo with ribbed collar and mother-of-pearl buttons.' },
    { cat: 'apparel-fashion', store: 'fashion', name: 'Urban Heavyweight Graphic T-Shirt', price: 550, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop', desc: '220 GSM combed cotton crewneck with minimalist high-density print.' },
    { cat: 'apparel-fashion', store: 'fashion', name: 'Breezy Linen Long Sleeve Shirt', price: 1850, img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop', desc: 'Pure French flax linen shirt tailored for relaxed warm-weather elegance.' },
    { cat: 'apparel-fashion', store: 'fashion', name: 'Thermal Fleece Zip Hoodie', price: 1950, img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop', desc: 'Plush brushed fleece interior with dual hand pockets and metal YKK zipper.' },
    { cat: 'apparel-fashion', store: 'fashion', name: 'Slim Tailored Formal Oxford Shirt', price: 1350, img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop', desc: 'Wrinkle-resistant pinpoint Oxford fabric with structured semi-spread collar.' },
    { cat: 'apparel-fashion', store: 'fashion', name: 'Athletic Tapered Training Joggers', price: 1150, img: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop', desc: 'Moisture-wicking 4-way stretch joggers with concealed zipper pockets.' },
    { cat: 'apparel-fashion', store: 'fashion', name: 'Genuine Full-Grain Leather Belt', price: 850, img: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&auto=format&fit=crop', desc: 'Handcrafted cowhide leather belt with brushed stainless steel buckle.' },
    { cat: 'apparel-fashion', store: 'fashion', name: 'Lightweight Packable Windbreaker', price: 1450, img: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop', desc: 'Water-repellent ripstop shell that folds into its own compact pouch.' },

    // Groceries
    { cat: 'groceries', store: 'organic', name: 'Premium Aged Basmati Rice 5kg', price: 920, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop', desc: 'Extra long grain aromatic basmati rice aged for 2 full years.' },
    { cat: 'groceries', store: 'organic', name: 'Cold-Pressed Pure Mustard Oil 1L', price: 340, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop', desc: 'Traditional Ghani-pressed unfiltered mustard oil with authentic pungent aroma.' },
    { cat: 'groceries', store: 'organic', name: 'Sundarban Raw Forest Honey 500g', price: 680, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop', desc: '100% natural raw mangrove forest honey loaded with natural pollen.' },
    { cat: 'groceries', store: 'organic', name: 'Organic Ceylon Loose Leaf Black Tea 400g', price: 450, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop', desc: 'Handpicked orthodox tea leaves delivering a robust malt character and rich cup.' },
    { cat: 'groceries', store: 'organic', name: 'Stoneground Whole Wheat Atta 5kg', price: 310, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop', desc: 'High-fiber unbleached whole wheat flour ideal for soft, nutritious rotis.' },
    { cat: 'groceries', store: 'organic', name: 'Premium Red Lentils (Masoor Daal) 1kg', price: 160, img: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop', desc: 'Triple-sorted, polished high-protein split red lentils.' },
    { cat: 'groceries', store: 'organic', name: 'Whole Cashew Nuts (Kaju) 500g', price: 780, img: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop', desc: 'Grade W240 large jumbo roasted unsalted whole cashew kernels.' },
    { cat: 'groceries', store: 'organic', name: 'Organic Cold-Pressed Coconut Oil 500ml', price: 420, img: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop', desc: 'Virgin unrefined edible coconut oil extracted from fresh coconut milk.' },
    { cat: 'groceries', store: 'organic', name: 'Medjool Jumbo Dates 1kg', price: 1100, img: 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=600&auto=format&fit=crop', desc: 'Plump, luscious organic Medjool dates with natural caramel sweetness.' },
    { cat: 'groceries', store: 'organic', name: 'Pink Himalayan Crystal Salt 1kg', price: 180, img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop', desc: 'Unrefined natural mineral rock salt sourced from ancient mountain deposits.' },

    // Books
    { cat: 'books', store: 'books', name: 'Atomic Habits by James Clear', price: 650, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop', desc: 'An easy & proven way to build good habits and break bad ones.' },
    { cat: 'books', store: 'books', name: 'The Psychology of Money', price: 580, img: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&auto=format&fit=crop', desc: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.' },
    { cat: 'books', store: 'books', name: 'Deep Work: Rules for Focused Success', price: 620, img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop', desc: 'Cal Newport’s seminal guide on achieving peak cognitive output in a distracted world.' },
    { cat: 'books', store: 'books', name: 'Sapiens: A Brief History of Humankind', price: 750, img: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop', desc: 'Yuval Noah Harari explores how human culture shaped history.' },

    // Toys
    { cat: 'toys-games', store: 'kids', name: 'STEM Robotics Solar Experiment Kit', price: 1450, img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop', desc: '14-in-1 educational solar robot building kit for young innovators.' },
    { cat: 'toys-games', store: 'kids', name: 'Magnetic 3D Building Tiles Set (64 Pcs)', price: 1850, img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop', desc: 'Vibrant geometric magnetic blocks promoting spatial reasoning.' },
    { cat: 'toys-games', store: 'kids', name: 'Remote Control High-Speed Off-Road Buggy', price: 2350, img: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&auto=format&fit=crop', desc: '1:16 scale 4WD shock-resistant monster truck with rechargeable battery.' },

    // Sports
    { cat: 'sports-outdoors', store: 'sports', name: 'Adjustable Dumbbell Set 20kg with Case', price: 4200, img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop', desc: 'Cast iron weight plates with spin-lock collars and textured chrome bar.' },
    { cat: 'sports-outdoors', store: 'sports', name: 'Anti-Tear Extra Thick Yoga Mat 8mm', price: 950, img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop', desc: 'Eco-friendly high density TPE mat with alignment lines and carry strap.' },
    { cat: 'sports-outdoors', store: 'sports', name: 'Heavy Duty Resistance Loop Bands (Set of 5)', price: 650, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop', desc: 'Natural latex exercise bands with different tension levels for strength training.' },

    // Automotive
    { cat: 'automotive', store: 'auto', name: 'Dual Dashcam 1080p Night Vision + GPS', price: 3600, img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop', desc: 'Front and cabin dual camera with G-sensor loop recording and parking monitor.' },
    { cat: 'automotive', store: 'auto', name: 'Portable Digital Tire Inflator Air Compressor', price: 1950, img: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop', desc: '150 PSI cordless tire pump with auto shutoff and emergency LED beacon.' },

    // Jewelry
    { cat: 'jewelry', store: 'jewelry', name: 'Minimalist 18K Gold Plated Solitaire Pendant', price: 2150, img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop', desc: 'AAA cubic zirconia gemstone set in hypoallergenic sterling silver.' },
    { cat: 'jewelry', store: 'jewelry', name: 'Classic Chronograph Stainless Steel Watch', price: 4800, img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop', desc: 'Japanese quartz movement, 5ATM water resistance with sapphire crystal.' }
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

    // Variant 1
    const variant1 = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `${skuBase}-STD`,
        attributes: JSON.stringify({ color: 'Standard', size: 'Regular' }),
        price: item.price
      }
    });

    // Inventory
    await prisma.inventory.create({
      data: {
        variantId: variant1.id,
        warehouseId: warehouse1.id,
        quantity: 120,
        reorderPoint: 15
      }
    });
    await prisma.inventory.create({
      data: {
        variantId: variant1.id,
        branchId: branch1.id,
        quantity: 35,
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

  if (seededProducts.length >= 2) {
    // Order 1: Delivered
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

    // Order 2: Processing
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

    // POS In-Store Sale
    await prisma.order.create({
      data: {
        storeId: techStore.id,
        branchId: branch1.id,
        source: 'POS',
        subTotal: 3450,
        tax: 172.5,
        discount: 150,
        total: 3472.5,
        status: 'DELIVERED',
        items: {
          create: {
            variantId: seededProducts[2]?.variant.id || seededProducts[0].variant.id,
            quantity: 1,
            price: 3450
          }
        }
      }
    });
  }

  // 10. NOTIFICATION AUTOMATION RULES & NOTIFICATIONS
  console.log('🔔 Seeding Real-Time Notification Engine Rules & Logs...');
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

  // Welcome notifications for users
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

  // 11. CRM CLIENTS & EXPENSES
  console.log('📊 Seeding CRM Records & Vendor Expenses...');
  await prisma.cRMClient.create({
    data: { name: 'Rahim Telecom Ltd', email: 'rahim@telecom.bd', phone: '+8801811223344', spentTotal: 45200 }
  });
  await prisma.cRMClient.create({
    data: { name: 'Ayesha Corp Lifestyle', email: 'ayesha@lifestylecorp.com', phone: '+8801999887766', spentTotal: 78500 }
  });

  await prisma.expense.create({
    data: { storeId: techStore.id, desc: 'Tejgaon Central Warehouse Electricity & Solar bill', category: 'Utilities', amount: 8450 }
  });
  await prisma.expense.create({
    data: { storeId: techStore.id, desc: 'Social Media & Seasonal Ad Campaign Boost', category: 'Marketing', amount: 15000 }
  });

  // 12. SUPPORT TICKETS
  console.log('🎫 Seeding Support Tickets...');
  await prisma.supportTicket.create({
    data: {
      creatorId: customerUser.id,
      assigneeId: userMap['support@zibonbaba.com'].id,
      subject: 'Inquiry regarding fast delivery in Chittagong',
      description: 'Hello, what is the expected transit time for standard delivery to Agrabad Chittagong?',
      status: 'OPEN',
      priority: 'NORMAL',
      category: 'ORDER',
      messages: {
        create: {
          senderId: customerUser.id,
          body: 'Hello, what is the expected transit time for standard delivery to Agrabad Chittagong?',
          isStaff: false
        }
      }
    }
  });

  // 13. AUDIT LOGS
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
