const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for 10 Sellers and 100 Products...');

  const passwordHash = bcrypt.hashSync('pass1234', 10);

  const sellersInfo = [
    { email: 'seller1@zibonbaba.com', name: 'Tech Baba Shop', category: 'Electronics', fullName: 'Abir Hasan', phone: '01711111111' },
    { email: 'seller2@zibonbaba.com', name: 'Glamour Baba Store', category: 'Health & Beauty', fullName: 'Nabila Rahman', phone: '01722222222' },
    { email: 'seller3@zibonbaba.com', name: 'Kitchen Baba Hub', category: 'Home & Kitchen', fullName: 'Kamal Uddin', phone: '01733333333' },
    { email: 'seller4@zibonbaba.com', name: 'Fashion Baba Wear', category: 'Apparel', fullName: 'Sajid Islam', phone: '01744444444' },
    { email: 'seller5@zibonbaba.com', name: 'Organic Baba Goods', category: 'Groceries', fullName: 'Fahmida Akhtar', phone: '01755555555' },
    { email: 'seller6@zibonbaba.com', name: 'Book Baba Library', category: 'Books', fullName: 'Tariq Anam', phone: '01766666666' },
    { email: 'seller7@zibonbaba.com', name: 'Kids Baba Toys', category: 'Toys & Games', fullName: 'Zoya Khan', phone: '01777777777' },
    { email: 'seller8@zibonbaba.com', name: 'Fit Baba Sports', category: 'Sports & Outdoors', fullName: 'Imran Chowdhury', phone: '01788888888' },
    { email: 'seller9@zibonbaba.com', name: 'Auto Baba Gears', category: 'Automotive', fullName: 'Mahbub Alam', phone: '01799999999' },
    { email: 'seller10@zibonbaba.com', name: 'Luxury Baba Gems', category: 'Jewelry', fullName: 'Sadia Sultana', phone: '01700000000' }
  ];

  // Helper product names by category
  const productsByCategory = {
    'Electronics': [
      { name: 'Zibonbaba Wireless Earbuds', price: 2500, desc: 'High fidelity stereo wireless sound with active noise cancellation.' },
      { name: 'Smartwatch Pro Series', price: 4500, desc: 'Tracks heart rate, oxygen levels, sleep cycles, and daily steps.' },
      { name: 'Mechanical Gaming Keyboard', price: 3800, desc: 'Tactile blue switches with customizable RGB backlight configurations.' },
      { name: 'Bluetooth Portable Speaker', price: 1800, desc: 'Waterproof outdoor speaker with deep bass and 12-hour playback.' },
      { name: 'HD Streaming Webcam', price: 2200, desc: '1080p full HD resolution with built-in noise-cancelling dual mics.' },
      { name: 'Ergonomic Wireless Mouse', price: 1500, desc: 'Reduces wrist strain with adjustable DPI optical sensor buttons.' },
      { name: 'USB-C Multiport Adapter', price: 1200, desc: '6-in-1 type-C hub with HDMI, card readers, and USB-A ports.' },
      { name: 'LED Ring Light 12-inch', price: 1600, desc: 'Dimmable ring light with adjustable tripod stand for content creators.' },
      { name: 'Dual USB Fast Charger', price: 800, desc: 'Quick Charge 3.0 charger adapter for fast mobile phone charging.' },
      { name: 'Noise Cancelling Headset', price: 5500, desc: 'Wireless over-ear headset with studio-quality microphone boom.' }
    ],
    'Health & Beauty': [
      { name: 'Natural Face Serum', price: 1200, desc: 'Revitalizing facial serum made with organic rosehip seed oil.' },
      { name: 'Organic Lavender Cream', price: 950, desc: 'Soothing moisturizer infused with essential lavender extracts.' },
      { name: 'Vitamin C Face Cream', price: 850, desc: 'Brightens skin tone and reduces wrinkles with natural extracts.' },
      { name: 'Matte Liquid Lipstick', price: 750, desc: 'Long-lasting, smudge-proof liquid lipstick with velvet finish.' },
      { name: 'Charcoal Peel Mask', price: 600, desc: 'Deep cleaning blackhead removal peel-off mask.' },
      { name: 'Herbal Shampoo Aloe', price: 500, desc: 'Sulfate-free hydrating shampoo enriched with aloe vera gel.' },
      { name: 'Hydrating Face Mist', price: 450, desc: 'Refreshing mist spray with cucumber extracts and witch hazel.' },
      { name: 'Rose Water Toner', price: 350, desc: '100% organic pure distilled rose petals extract toner.' },
      { name: 'Tea Tree Acne Gel', price: 400, desc: 'Targeted spot treatment gel formulated with tea tree oil.' },
      { name: 'Sunscreen SPF 50', price: 1100, desc: 'Broad-spectrum non-greasy daily defense face sunscreen.' }
    ],
    'Home & Kitchen': [
      { name: 'Electric Induction Cooker', price: 3500, desc: 'Fast heating portable induction cooktop stove with touch keys.' },
      { name: 'Non-Stick Frying Pan', price: 1600, desc: 'Durable aluminum pan with double layer non-stick ceramic coat.' },
      { name: 'Stainless Steel Kettle', price: 1800, desc: 'Electric automatic shut-off water boiler kettle.' },
      { name: 'Multi-Functional Blender', price: 2800, desc: 'High-speed blender for smoothies, shakes, and food prep.' },
      { name: 'Automatic Rice Cooker', price: 3200, desc: 'Cooks and keeps rice warm with non-stick inner cooking pot.' },
      { name: 'Chef Knife Set 5-pcs', price: 2400, desc: 'High carbon stainless steel kitchen knives with acrylic stand.' },
      { name: 'Digital Kitchen Scale', price: 850, desc: 'High precision electronic food weighing scale.' },
      { name: 'Electric Coffee Grinder', price: 1500, desc: 'Grinds coffee beans, nuts, and spices with sharp steel blades.' },
      { name: 'Insulated Water Bottle', price: 950, desc: 'Double-walled vacuum insulated thermos bottle for hot/cold.' },
      { name: 'Silicone Spatula Set', price: 600, desc: 'Heat resistant food-grade cooking spatulas, set of 4.' }
    ],
    'Apparel': [
      { name: 'Classic Denim Jacket', price: 2200, desc: 'Vintage style blue cotton denim jacket with button pockets.' },
      { name: 'Slim Fit Chino Pants', price: 1400, desc: 'Stretchable cotton chinos suitable for casual and semi-formal wear.' },
      { name: 'Premium Cotton Polo Shirt', price: 950, desc: 'Breathable honeycomb knit polo shirt with embroidered detail.' },
      { name: 'Graphic Printed T-Shirt', price: 450, desc: '100% combed cotton t-shirt with premium screen print design.' },
      { name: 'Casual Linen Shirt', price: 1600, desc: 'Lightweight and airy long sleeve linen shirt for summers.' },
      { name: 'Athletic Running Shorts', price: 650, desc: 'Quick-dry workout shorts with zipper pockets and mesh lining.' },
      { name: 'Hooded Sweatshirt Pullover', price: 1800, desc: 'Fleece-lined warm winter hoodie with kangaroo pockets.' },
      { name: 'Formal Dress Shirt', price: 1200, desc: 'Easy-iron formal business shirt with modern spread collar.' },
      { name: 'Activewear Jogger Pants', price: 1100, desc: 'Comfortable sweatpants for training, gym, or lounging.' },
      { name: 'Leather Waist Belt', price: 800, desc: 'Genuine full-grain leather dress belt with steel buckle.' }
    ],
    'Groceries': [
      { name: 'Premium Jasmine Rice 5kg', price: 850, desc: 'Fragrant and fluffy premium long-grain jasmine rice.' },
      { name: 'Pure Mustard Oil 1L', price: 320, desc: 'Cold-pressed extra virgin mustard oil for traditional cooking.' },
      { name: 'Organic Honey 500g', price: 650, desc: 'Raw, unfiltered forest honey sourced from natural hives.' },
      { name: 'Premium Ceylon Tea 400g', price: 420, desc: 'Rich and aromatic loose leaf black tea blend.' },
      { name: 'Whole Wheat Atta 5kg', price: 280, desc: 'Stone-ground high fiber whole wheat flour.' },
      { name: 'Lentils Red (Masoor) 1kg', price: 140, desc: 'Cleaned, high protein red lentils for daily meals.' },
      { name: 'Himalayan Pink Salt 1kg', price: 180, desc: 'Natural, unrefined mineral-rich pink rock salt crystals.' },
      { name: 'Organic Chia Seeds 250g', price: 350, desc: 'Superfood chia seeds rich in fiber and omega-3.' },
      { name: 'Pure Ghee (Cow Butter) 500g', price: 750, desc: 'Clarified cow milk butter ghee with rich aroma.' },
      { name: 'Spices Gift Pack 6-in-1', price: 550, desc: 'Assorted spices: Turmeric, Chili, Cumin, Coriander, Garam Masala.' }
    ],
    'Books': [
      { name: 'Futuristic Business Strategy', price: 450, desc: 'An enterprise playbook for AI-driven operation systems.' },
      { name: 'The Art of Modern POS', price: 380, desc: 'A developer guide to retail terminal automation architectures.' },
      { name: 'Ecosystem Marketing Hacks', price: 320, desc: 'How to scale multi-vendor platforms and reseller networks.' },
      { name: 'Node.js Enterprise Patterns', price: 600, desc: 'Build scalable REST APIs and WebSocket notification queues.' },
      { name: 'Clean Code: Clean Architecture', price: 750, desc: 'Design systems that easily decouple modules and DB layers.' },
      { name: 'NextJS & React Complete Playbook', price: 680, desc: 'Master SSR, Server Actions, state stores, and Tailwind UI.' },
      { name: 'The Reseller Mindset', price: 290, desc: 'Build passive income streams through target-based networks.' },
      { name: 'Financial Ledger Basics', price: 400, desc: 'Accounting guidelines for multi-vendor commissions and taxes.' },
      { name: 'Prisma Schema Mastery', price: 500, desc: 'Optimize SQLite and PostgreSQL databases for migrations.' },
      { name: 'AI Forecast Analytics', price: 550, desc: 'Use machine learning to predict retail sales patterns.' }
    ],
    'Toys & Games': [
      { name: 'Robot Coding Kit STEM', price: 3200, desc: 'Programmable smart car kit with sensors and Arduino controller.' },
      { name: 'Wooden Building Blocks Set', price: 1200, desc: '100-piece natural wood blocks for creative kids construct.' },
      { name: 'Magnetic Tiles 60-pcs', price: 2200, desc: '3D magnetic building blocks toys for children development.' },
      { name: 'Classic Monopoly Board Game', price: 1500, desc: 'Real estate trading board game for family fun night.' },
      { name: 'RC Quadcopter Drone', price: 3500, desc: 'Mini drone with HD camera, altitude hold, and headless mode.' },
      { name: 'Plush Teddy Bear Large', price: 950, desc: 'Super soft, huggable giant stuffed toy teddy bear.' },
      { name: 'Kids Painting Art Studio', price: 850, desc: '120-piece drawing coloring set in portable wooden box.' },
      { name: 'Premium Poker Chips Set', price: 2400, desc: '300 casino-grade clay chips with aluminum case.' },
      { name: 'Speed Cube 3x3 Elite', price: 400, desc: 'Super smooth stickerless magic puzzle speed cube.' },
      { name: 'Water Gun Pump Shooter', price: 600, desc: 'High capacity pool squirt gun for summer outdoor games.' }
    ],
    'Sports & Outdoors': [
      { name: 'Yoga Mat Non-Slip 6mm', price: 1200, desc: 'High density eco-friendly TPE mat with alignment lines.' },
      { name: 'Adjustable Dumbbells Set', price: 4800, desc: '20kg iron weights dumbbells set in storage box.' },
      { name: 'Resistance Band Set 5-pcs', price: 850, desc: 'Stackable exercise bands with handles and ankle straps.' },
      { name: 'Waterproof Camping Tent', price: 4500, desc: '3-person double layer dome tent for hiking and outdoor.' },
      { name: 'Insulated Sleeping Bag', price: 2400, desc: 'Lightweight cold weather thermal sleeping bag.' },
      { name: 'Hydration Backpack 2L', price: 1500, desc: 'Cycling hydration pack with food-grade water bladder.' },
      { name: 'Professional Badminton Racket', price: 2800, desc: 'Carbon fiber frame lightweight rackets, set of 2.' },
      { name: 'Smart Jump Rope Counter', price: 950, desc: 'Digital skipping rope with calorie and jump counts.' },
      { name: 'Cycling Helmet Adjustable', price: 1800, desc: 'High impact safety bicycle helmet with visor and light.' },
      { name: 'Compact Foldable Camp Chair', price: 1300, desc: 'Heavy duty steel frame folding chair with cup holder.' }
    ],
    'Automotive': [
      { name: 'Car Dashboard Camera Dashcam', price: 3800, desc: '1080p full HD camera with G-sensor loop recording.' },
      { name: 'Portable Air Compressor Pump', price: 1950, desc: '12V DC digital tire inflator with auto shut-off.' },
      { name: 'Car Vacuum Cleaner Cordless', price: 1600, desc: 'High power portable vacuum for deep interior cleaning.' },
      { name: 'Microfiber Cleaning Cloths 6x', price: 450, desc: 'Ultra-soft scratch-free cloths for auto detailing.' },
      { name: 'Bluetooth FM Transmitter', price: 950, desc: 'Wireless radio adapter with QC3.0 charging port.' },
      { name: 'Car Seat Organizer Bag', price: 800, desc: 'Backseat multi-pocket organizer with tablet holder.' },
      { name: 'Memory Foam Seat Cushion', price: 1250, desc: 'Orthopedic comfort cushion for long driving hours.' },
      { name: 'Anti-Glare Night Driving Glasses', price: 600, desc: 'Polarized yellow lenses to reduce headlight glare.' },
      { name: 'Tire Pressure Gauge Digital', price: 500, desc: 'Backlit LCD monitor gauge for cars, trucks, bikes.' },
      { name: 'Car Scratch Remover Kit', price: 750, desc: 'Buffing paste compound with sponge to fix minor marks.' }
    ],
    'Jewelry': [
      { name: 'Sterling Silver Neck Chain', price: 2500, desc: '925 sterling silver snake chain necklace, 18-inch.' },
      { name: 'Zirconia Stud Earrings Set', price: 1200, desc: 'Brilliant round cut cubic zirconia studs in white gold.' },
      { name: 'Minimalist Cuff Gold Bracelet', price: 1800, desc: '18k gold plated stainless steel daily wear cuff.' },
      { name: 'Genuine Pearl Pendant', price: 2200, desc: 'Natural freshwater cultured white pearl neck pendant.' },
      { name: 'Titanium Wedding Ring Band', price: 1500, desc: 'Classic comfort-fit matte finish titanium ring.' },
      { name: 'Leather Wrap Beaded Bracelet', price: 700, desc: 'Handcrafted bohemian style beaded wrap bracelet.' },
      { name: 'Vintage Quartz Pocket Watch', price: 1400, desc: 'Engraved bronze pocket watch with long chain.' },
      { name: 'Jewelry Storage Box Case', price: 1600, desc: 'Double layer velvet storage organizer with key lock.' },
      { name: 'Crystal Heart Charm Anklet', price: 650, desc: 'Silver plated double layer link chain heart anklet.' },
      { name: 'Silver Hoop Earrings Classic', price: 900, desc: 'Lightweight round polished silver hoop earrings.' }
    ]
  };

  for (let i = 0; i < sellersInfo.length; i++) {
    const s = sellersInfo[i];
    const sellerNum = i + 1;

    // 1. Create or Update user account with VENDOR_ADMIN role
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        role: 'VENDOR_ADMIN',
        status: 'VERIFIED',
        passwordHash: passwordHash
      },
      create: {
        email: s.email,
        phone: s.phone,
        passwordHash: passwordHash,
        role: 'VENDOR_ADMIN',
        status: 'VERIFIED'
      }
    });

    console.log(`👤 Seller Account Created/Verified: ${s.email} | ID: ${user.id}`);

    // 2. Create or Update Profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { fullName: s.fullName },
      create: {
        userId: user.id,
        fullName: s.fullName
      }
    });

    // 3. Create or Update Store
    const store = await prisma.store.upsert({
      where: { name: s.name },
      update: {
        ownerId: user.id,
        isApproved: true
      },
      create: {
        name: s.name,
        description: `Futuristic shop specializing in premium ${s.category} products.`,
        ownerId: user.id,
        isApproved: true,
        commissionRate: 10.00
      }
    });

    console.log(`🏬 Shop Created/Verified: "${s.name}" | Store ID: ${store.id}`);

    // 4. Create or Retrieve Category
    const categorySlug = s.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
    const category = await prisma.category.upsert({
      where: { name: s.category },
      update: {},
      create: {
        name: s.category,
        slug: categorySlug
      }
    });

    // 5. Create 10 products
    const productList = productsByCategory[s.category];
    for (let k = 0; k < productList.length; k++) {
      const p = productList[k];
      const prodNum = k + 1;
      const sku = `SKU-SLR${sellerNum}-PRD${prodNum}`;

      // Create product
      const product = await prisma.product.create({
        data: {
          storeId: store.id,
          categoryId: category.id,
          name: p.name,
          description: p.desc,
          basePrice: p.price,
          status: 'PUBLISHED'
        }
      });

      // Create variant
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: sku,
          attributes: JSON.stringify({ variant: 'Standard' }),
          price: p.price
        }
      });
    }

    console.log(`📦 Added 10 products to "${s.name}"`);
  }

  console.log('✅ Successfully seeded 10 Sellers, 10 Shops, and 100 Products!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
