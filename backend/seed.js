const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const { getCollection } = require('./config/db');

// Load env vars
dotenv.config();

const categories = [
  {
    name: 'Electronics & Accessories',
    slug: 'electronics',
    description: 'Latest gadgets and electronic accessories'
  },
  {
    name: 'Fashion & Lifestyle',
    slug: 'fashion',
    description: 'Trendy clothing and lifestyle products'
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Essential home and kitchen items'
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty',
    description: 'Beauty and grooming products'
  },
  {
    name: 'Fitness & Essentials',
    slug: 'fitness',
    description: 'Fitness equipment and wellness products'
  },
  {
    name: 'Stationery & Office',
    slug: 'stationery',
    description: 'Office supplies and stationery'
  }
];

// Product name to semantic image mapping - uses Unsplash with specific keywords for exact matches
const productImageMap = {
  'Wireless Bluetooth Earbuds Pro': 'https://loremflickr.com/600/600/earbuds,wireless,audio',
  'Smart Fitness Band Pro': 'https://loremflickr.com/600/600/smartwatch,fitness,band',
  'USB-C Fast Charging Cable': 'https://loremflickr.com/600/600/usb,cable,charging',
  'Wireless Mouse Pro': 'https://loremflickr.com/600/600/mouse,wireless,computer',
  'Power Bank 20000mAh': 'https://loremflickr.com/600/600/powerbank,battery,charger',
  'Mechanical Gaming Keyboard RGB': 'https://loremflickr.com/600/600/keyboard,gaming,rgb',
  'HD Webcam 1080P Pro': 'https://loremflickr.com/600/600/webcam,camera,video',
  'Phone Stand Adjustable': 'https://loremflickr.com/600/600/phone,stand,mount',
  'Laptop Cooling Pad LED': 'https://loremflickr.com/600/600/laptop,cooler,pad',
  'Portable SSD 1TB': 'https://loremflickr.com/600/600/ssd,storage,drive',
  'USB Hub 7 Port': 'https://loremflickr.com/600/600/usb,hub,ports',
  'Mechanical Keyboard Blue Switch': 'https://loremflickr.com/600/600/keyboard,mechanical,blue',
  'Gaming Mouse Pad XL': 'https://loremflickr.com/600/600/mousepad,gaming,desk',
  'Laptop Stand Aluminum': 'https://loremflickr.com/600/600/laptop,stand,desk',
  'Monitor Light Bar': 'https://loremflickr.com/600/600/monitor,light,bar',
  'Winter Jacket Premium': 'https://loremflickr.com/600/600/winter,jacket,clothing',
  'Cotton T-Shirt Basic': 'https://loremflickr.com/600/600/tshirt,clothing,cotton',
  'Denim Jeans Classic': 'https://loremflickr.com/600/600/jeans,denim,pants',
  'Sports Shoes Running': 'https://loremflickr.com/600/600/shoes,running,sports',
  'Casual Sneakers': 'https://loremflickr.com/600/600/sneakers,shoes,casual',
  'Fitness Tracking Watch': 'https://loremflickr.com/600/600/smartwatch,fitness,sport',
  'Sports Water Bottle': 'https://loremflickr.com/600/600/waterbottle,sports,bottle',
  'Yoga Mat Premium 6mm': 'https://loremflickr.com/600/600/yoga,mat,exercise',
  'Dumbbells Set 20kg': 'https://loremflickr.com/600/600/dumbbells,weights,fitness',
  'Resistance Bands Set': 'https://loremflickr.com/600/600/resistance,bands,fitness',
  'Yoga Blocks 2pcs': 'https://loremflickr.com/600/600/yoga,blocks,props',
  'Workout Gloves': 'https://loremflickr.com/600/600/gloves,workout,fitness',
  'Jump Rope Adjustable': 'https://loremflickr.com/600/600/jumprope,fitness,workout',
  'Kitchen Knife Set': 'https://loremflickr.com/600/600/knife,kitchen,cooking',
  'Non-Stick Cookware Set': 'https://loremflickr.com/600/600/cookware,pans,kitchen',
  'Blender 1000W': 'https://loremflickr.com/600/600/blender,kitchen,appliance',
  'Coffee Maker Automatic': 'https://loremflickr.com/600/600/coffee,maker,appliance',
  'Microwave Oven': 'https://loremflickr.com/600/600/microwave,oven,kitchen',
  'Air Fryer 5L': 'https://loremflickr.com/600/600/airfryer,kitchen,cooking',
  'Toaster 4 Slice': 'https://loremflickr.com/600/600/toaster,kitchen,appliance',
  'Face Wash Gel': 'https://loremflickr.com/600/600/skincare,facewash,beauty',
  'Moisturizer Cream': 'https://loremflickr.com/600/600/moisturizer,skincare,cream',
  'Hair Shampoo Natural': 'https://loremflickr.com/600/600/shampoo,hair,beauty',
  'Beard Oil Premium': 'https://loremflickr.com/600/600/beard,oil,grooming',
  'Toothbrush Electric': 'https://loremflickr.com/600/600/toothbrush,dental,hygiene',
  'Perfume Spray 50ml': 'https://loremflickr.com/600/600/perfume,fragrance,spray',
  'Face Mask Sheet': 'https://loremflickr.com/600/600/facemask,skincare,beauty',
  'Lip Balm SPF 30': 'https://loremflickr.com/600/600/lipbalm,skincare,beauty',
  'Notebook A4 100 Pages': 'https://loremflickr.com/600/600/notebook,stationery,writing',
  'Ballpoint Pen Set': 'https://loremflickr.com/600/600/pen,stationery,writing',
  'Desk Organizer Wooden': 'https://loremflickr.com/600/600/desk,organizer,office',
  'Sticky Notes Assorted': 'https://loremflickr.com/600/600/stickynotes,office,stationery',
  'Highlighter Markers': 'https://loremflickr.com/600/600/highlighter,markers,stationery',
  'File Folder Pack': 'https://loremflickr.com/600/600/folder,filing,office',
  'Desk Lamp LED': 'https://loremflickr.com/600/600/desklamp,light,office',
  'Pencil Case Canvas': 'https://loremflickr.com/600/600/pencilcase,stationery,office'
};

// Get product image - uses specific product mapping for exact name matches
const getProductImage = (productName, category = '') => {
  // Check if exact product name mapping exists
  if (productImageMap[productName]) {
    return productImageMap[productName];
  }
  
  // Fallback: use category keyword for generic semantic search
  const categoryKeywords = {
    'electronics': 'electronics,gadgets,tech',
    'fashion': 'fashion,clothing,apparel',
    'home-kitchen': 'kitchen,home,cooking',
    'beauty': 'beauty,skincare,grooming',
    'fitness': 'fitness,sports,exercise',
    'stationery': 'stationery,office,writing'
  };
  
  const keywords = categoryKeywords[category] || 'product';
  return `https://loremflickr.com/600/600/${keywords}`;
};

const sampleProducts = [
  // Electronics - 15 products
  {
    name: 'Wireless Bluetooth Earbuds Pro',
    slug: 'wireless-bluetooth-earbuds-pro',
    description: 'Premium sound quality with active noise cancellation. 24-hour battery life.',
    category: 'electronics',
    price: 1999,
    mrpPrice: 3999,
    stock: 50,
    brand: 'TechSound',
    thumbnailImage: getProductImage('Wireless Bluetooth Earbuds Pro'),
    isFeatured: true,
    popularityScore: 95
  },
  {
    name: 'Smart Fitness Band Pro',
    slug: 'smart-fitness-band-pro',
    description: 'Track your health and fitness with heart rate monitor, sleep tracking, and step counter.',
    category: 'electronics',
    price: 2499,
    mrpPrice: 4999,
    stock: 30,
    brand: 'FitTech',
    thumbnailImage: getProductImage('Smart Fitness Band Pro'),
    isFeatured: true,
    popularityScore: 88
  },
  {
    name: 'USB-C Fast Charging Cable',
    slug: 'usb-c-fast-charging-cable',
    description: 'Durable USB-C cable with 3A fast charging support. 2-meter length. Nylon braided.',
    category: 'electronics',
    price: 399,
    mrpPrice: 799,
    stock: 200,
    brand: 'ChargeMax',
    thumbnailImage: getProductImage('USB-C Fast Charging Cable'),
    popularityScore: 72
  },
  {
    name: 'Wireless Mouse Pro',
    slug: 'wireless-mouse-pro',
    description: 'High precision wireless mouse with ergonomic design. 18-month battery life.',
    category: 'electronics',
    price: 1299,
    mrpPrice: 2499,
    stock: 75,
    brand: 'TechGear',
    thumbnailImage: getProductImage('Wireless Mouse Pro'),
    isFeatured: true,
    popularityScore: 80
  },
  {
    name: 'Power Bank 20000mAh',
    slug: 'power-bank-20000mah',
    description: 'Fast charging power bank with dual USB ports and LED display. Ultra compact.',
    category: 'electronics',
    price: 1599,
    mrpPrice: 3299,
    stock: 60,
    brand: 'PowerTech',
    thumbnailImage: getProductImage('Power Bank 20000mAh'),
    popularityScore: 85
  },
  {
    name: 'Mechanical Gaming Keyboard RGB',
    slug: 'mechanical-gaming-keyboard-rgb',
    description: 'RGB backlit mechanical keyboard for gaming with 104 keys and anti-ghosting.',
    category: 'electronics',
    price: 4499,
    mrpPrice: 8999,
    stock: 40,
    brand: 'GameZone',
    thumbnailImage: getProductImage('Mechanical Gaming Keyboard RGB'),
    isFeatured: true,
    popularityScore: 90
  },
  {
    name: 'HD Webcam 1080P Pro',
    slug: 'hd-webcam-1080p-pro',
    description: 'Crystal clear 1080P HD webcam with built-in microphone for video calls and streaming.',
    category: 'electronics',
    price: 2199,
    mrpPrice: 4499,
    stock: 45,
    brand: 'VisionTech',
    thumbnailImage: getProductImage('HD Webcam 1080P Pro'),
    popularityScore: 76
  },
  {
    name: 'Phone Stand Adjustable',
    slug: 'phone-stand-adjustable',
    description: 'Universal phone stand with adjustable angles. Fits all smartphone sizes and tablets.',
    category: 'electronics',
    price: 299,
    mrpPrice: 699,
    stock: 150,
    brand: 'HoldTech',
    thumbnailImage: getProductImage('Phone Stand Adjustable'),
    popularityScore: 68
  },
  {
    name: 'Bluetooth Speaker Portable',
    slug: 'bluetooth-speaker-portable',
    description: '360-degree sound with 12-hour battery. Waterproof design for outdoor use.',
    category: 'electronics',
    price: 1899,
    mrpPrice: 3799,
    stock: 55,
    brand: 'SoundWave',
    thumbnailImage: getProductImage('Bluetooth Speaker Portable'),
    isFeatured: true,
    popularityScore: 87
  },
  {
    name: 'Tempered Glass Screen Protector',
    slug: 'tempered-glass-screen-protector',
    description: 'Tempered glass screen protector with oleophobic coating. Easy installation.',
    category: 'electronics',
    price: 399,
    mrpPrice: 799,
    stock: 300,
    brand: 'ShieldGuard',
    thumbnailImage: getProductImage('Tempered Glass Screen Protector'),
    popularityScore: 70
  },
  {
    name: 'USB Hub 4-Port 3.0',
    slug: 'usb-hub-4-port-30',
    description: '4-port USB 3.0 hub with fast data transfer. Compact design, plug and play.',
    category: 'electronics',
    price: 599,
    mrpPrice: 1199,
    stock: 80,
    brand: 'ConnectTech',
    thumbnailImage: getProductImage('USB Hub 4-Port 3.0'),
    popularityScore: 72
  },
  {
    name: 'HDMI 2.0 Cable 2M',
    slug: 'hdmi-20-cable-2m',
    description: '4K HDMI cable with high-speed transmission. Gold-plated connectors.',
    category: 'electronics',
    price: 399,
    mrpPrice: 899,
    stock: 200,
    brand: 'ConnectPro',
    thumbnailImage: getProductImage('HDMI 2.0 Cable 2M'),
    popularityScore: 68
  },
  {
    name: 'Laptop Cooling Pad Dual Fan',
    slug: 'laptop-cooling-pad-dual-fan',
    description: 'Dual fan laptop cooler with USB powered. Reduces temperature significantly.',
    category: 'electronics',
    price: 1299,
    mrpPrice: 2599,
    stock: 50,
    brand: 'CoolTech',
    thumbnailImage: getProductImage('Laptop Cooling Pad Dual Fan'),
    popularityScore: 74
  },
  {
    name: 'Phone Case Rugged Armor',
    slug: 'phone-case-rugged-armor',
    description: 'Heavy-duty protective case with shock absorption. Premium TPU material.',
    category: 'electronics',
    price: 599,
    mrpPrice: 1299,
    stock: 180,
    brand: 'ShieldMax',
    thumbnailImage: getProductImage('Phone Case Rugged Armor'),
    popularityScore: 75
  },
  {
    name: 'Wireless Charging Pad 15W',
    slug: 'wireless-charging-pad-15w',
    description: 'Fast wireless charging pad with LED indicator. Works with all Qi-enabled devices.',
    category: 'electronics',
    price: 1099,
    mrpPrice: 2199,
    stock: 70,
    brand: 'ChargePro',
    thumbnailImage: getProductImage('Wireless Charging Pad 15W'),
    isFeatured: true,
    popularityScore: 82
  },

  // Fashion - 14 products
  {
    name: 'Men\'s Casual Cotton Shirt',
    slug: 'mens-casual-cotton-shirt',
    description: 'Comfortable cotton shirt perfect for casual wear. Available in multiple colors.',
    category: 'fashion',
    price: 799,
    mrpPrice: 1599,
    stock: 100,
    brand: 'StyleHub',
    thumbnailImage: getProductImage('Men\'s Casual Cotton Shirt'),
    popularityScore: 75
  },
  {
    name: 'Women\'s Summer Dress',
    slug: 'womens-summer-dress',
    description: 'Light and breezy summer dress in multiple colors. Perfect for warm weather.',
    category: 'fashion',
    price: 1299,
    mrpPrice: 2499,
    stock: 80,
    brand: 'Fashion First',
    thumbnailImage: getProductImage('Women\'s Summer Dress'),
    isFeatured: true,
    popularityScore: 82
  },
  {
    name: 'Premium Denim Jeans',
    slug: 'premium-denim-jeans',
    description: 'Premium quality denim jeans with comfortable classic fit and perfect stretch.',
    category: 'fashion',
    price: 1499,
    mrpPrice: 2999,
    stock: 120,
    brand: 'DenimPro',
    thumbnailImage: getProductImage('Premium Denim Jeans'),
    isFeatured: true,
    popularityScore: 80
  },
  {
    name: 'Women\'s Athletic Leggings',
    slug: 'womens-athletic-leggings',
    description: 'Breathable and stretchable leggings perfect for workouts and yoga.',
    category: 'fashion',
    price: 899,
    mrpPrice: 1799,
    stock: 90,
    brand: 'FitStyle',
    thumbnailImage: getProductImage('Women\'s Athletic Leggings'),
    popularityScore: 77
  },
  {
    name: 'Men\'s Formal Blazer',
    slug: 'mens-formal-blazer',
    description: 'Elegant formal blazer for professional occasions and business meetings.',
    category: 'fashion',
    price: 3499,
    mrpPrice: 6999,
    stock: 40,
    brand: 'FormalWear',
    thumbnailImage: getProductImage('Men\'s Formal Blazer'),
    isFeatured: true,
    popularityScore: 85
  },
  {
    name: 'Cotton T-Shirt Combo Pack',
    slug: 'cotton-t-shirt-combo-pack',
    description: 'Pack of 3 premium cotton t-shirts in different colors. Perfect everyday wear.',
    category: 'fashion',
    price: 999,
    mrpPrice: 1999,
    stock: 150,
    brand: 'BasicWear',
    thumbnailImage: getProductImage('Cotton T-Shirt Combo Pack'),
    popularityScore: 78
  },
  {
    name: 'Women\'s Casual Jacket',
    slug: 'womens-casual-jacket',
    description: 'Stylish casual jacket perfect for all seasons. Lightweight and comfortable.',
    category: 'fashion',
    price: 1899,
    mrpPrice: 3799,
    stock: 60,
    brand: 'StyleHub',
    thumbnailImage: getProductImage('Women\'s Casual Jacket'),
    popularityScore: 78
  },
  {
    name: 'Men\'s Athletic Shorts',
    slug: 'mens-athletic-shorts',
    description: 'Comfortable athletic shorts with quick-dry fabric. Perfect for sports.',
    category: 'fashion',
    price: 599,
    mrpPrice: 1199,
    stock: 110,
    brand: 'SportsWear',
    thumbnailImage: getProductImage('Men\'s Athletic Shorts'),
    popularityScore: 70
  },
  {
    name: 'Denim Jacket Classic',
    slug: 'denim-jacket-classic',
    description: 'Timeless denim jacket for all seasons. Perfect layering piece.',
    category: 'fashion',
    price: 1799,
    mrpPrice: 3599,
    stock: 50,
    brand: 'DenimPro',
    thumbnailImage: getProductImage('Denim Jacket Classic'),
    isFeatured: true,
    popularityScore: 81
  },
  {
    name: 'Sports Bra Pro',
    slug: 'sports-bra-pro',
    description: 'High-performance sports bra with excellent support for intense workouts.',
    category: 'fashion',
    price: 799,
    mrpPrice: 1599,
    stock: 100,
    brand: 'SportsWear',
    thumbnailImage: getProductImage('Sports Bra Pro'),
    popularityScore: 74
  },
  {
    name: 'Women\'s Hooded Hoodie',
    slug: 'womens-hooded-hoodie',
    description: 'Comfortable and cozy hoodie perfect for casual outings and cool weather.',
    category: 'fashion',
    price: 1099,
    mrpPrice: 2199,
    stock: 75,
    brand: 'ComfortWear',
    thumbnailImage: getProductImage('Women\'s Hooded Hoodie'),
    popularityScore: 76
  },
  {
    name: 'Men\'s Polo Shirt',
    slug: 'mens-polo-shirt',
    description: 'Classic polo shirt perfect for casual and semi-formal occasions.',
    category: 'fashion',
    price: 899,
    mrpPrice: 1799,
    stock: 85,
    brand: 'StyleHub',
    thumbnailImage: getProductImage('Men\'s Polo Shirt'),
    popularityScore: 72
  },
  {
    name: 'Women\'s Silk Scarf',
    slug: 'womens-silk-scarf',
    description: 'Premium silk scarf with elegant designs. Perfect accessory for any outfit.',
    category: 'fashion',
    price: 599,
    mrpPrice: 1299,
    stock: 120,
    brand: 'Fashion First',
    thumbnailImage: getProductImage('Women\'s Silk Scarf'),
    popularityScore: 71
  },
  {
    name: 'Men\'s Leather Belt',
    slug: 'mens-leather-belt',
    description: 'Premium leather belt with polished buckle. Suitable for formal and casual wear.',
    category: 'fashion',
    price: 699,
    mrpPrice: 1499,
    stock: 95,
    brand: 'AccessoryPro',
    thumbnailImage: getProductImage('Men\'s Leather Belt'),
    popularityScore: 69
  },

  // Home & Kitchen - 14 products
  {
    name: 'Non-Stick Cookware Set',
    slug: 'non-stick-cookware-set',
    description: 'Complete non-stick cookware set with 8 pieces including pans and pots.',
    category: 'home-kitchen',
    price: 2499,
    mrpPrice: 4999,
    stock: 35,
    brand: 'CookPro',
    thumbnailImage: getProductImage('Non-Stick Cookware Set'),
    isFeatured: true,
    popularityScore: 84
  },
  {
    name: 'Stainless Steel Mixing Bowls',
    slug: 'stainless-steel-mixing-bowls',
    description: '5-piece stainless steel mixing bowl set with measurement marks.',
    category: 'home-kitchen',
    price: 1299,
    mrpPrice: 2599,
    stock: 55,
    brand: 'KitchenBasics',
    thumbnailImage: getProductImage('Stainless Steel Mixing Bowls'),
    isFeatured: true,
    popularityScore: 75
  },
  {
    name: 'Silicone Baking Mat Set',
    slug: 'silicone-baking-mat-set',
    description: 'Pack of 3 reusable silicone baking mats. Non-stick and durable.',
    category: 'home-kitchen',
    price: 599,
    mrpPrice: 1199,
    stock: 80,
    brand: 'BakePro',
    thumbnailImage: getProductImage('Silicone Baking Mat Set'),
    popularityScore: 70
  },
  {
    name: 'Kitchen Knife Set 6-Piece',
    slug: 'kitchen-knife-set-6-piece',
    description: 'High-quality stainless steel knife set with wooden block.',
    category: 'home-kitchen',
    price: 1999,
    mrpPrice: 3999,
    stock: 40,
    brand: 'KnifeMax',
    thumbnailImage: getProductImage('Kitchen Knife Set 6-Piece'),
    isFeatured: true,
    popularityScore: 82
  },
  {
    name: 'Bamboo Cutting Board Set',
    slug: 'bamboo-cutting-board-set',
    description: 'Set of 3 eco-friendly bamboo cutting boards. Antibacterial.',
    category: 'home-kitchen',
    price: 899,
    mrpPrice: 1799,
    stock: 70,
    brand: 'EcoKitchen',
    thumbnailImage: getProductImage('Bamboo Cutting Board Set'),
    popularityScore: 73
  },
  {
    name: 'Dish Drying Rack',
    slug: 'dish-drying-rack',
    description: 'Stainless steel dish drying rack with compartments for cups.',
    category: 'home-kitchen',
    price: 599,
    mrpPrice: 1199,
    stock: 90,
    brand: 'OrganizeMax',
    thumbnailImage: getProductImage('Dish Drying Rack'),
    popularityScore: 69
  },
  {
    name: 'Glass Food Storage Containers',
    slug: 'glass-food-storage-containers',
    description: 'Set of 6 glass containers with airtight lids. Microwave safe.',
    category: 'home-kitchen',
    price: 1499,
    mrpPrice: 2999,
    stock: 50,
    brand: 'StoragePro',
    thumbnailImage: getProductImage('Glass Food Storage Containers'),
    isFeatured: true,
    popularityScore: 78
  },
  {
    name: 'Electric Kettle Stainless Steel',
    slug: 'electric-kettle-stainless-steel',
    description: 'Fast electric kettle with auto shut-off. Temperature control available.',
    category: 'home-kitchen',
    price: 1299,
    mrpPrice: 2499,
    stock: 60,
    brand: 'KitchenTech',
    thumbnailImage: getProductImage('Electric Kettle Stainless Steel'),
    popularityScore: 76
  },
  {
    name: 'Spice Rack Organizer',
    slug: 'spice-rack-organizer',
    description: 'Wall-mounted spice rack with 12 containers and labels.',
    category: 'home-kitchen',
    price: 799,
    mrpPrice: 1599,
    stock: 85,
    brand: 'OrganizeMax',
    thumbnailImage: getProductImage('Spice Rack Organizer'),
    popularityScore: 71
  },
  {
    name: 'Utensil Holder Stainless Steel',
    slug: 'utensil-holder-stainless-steel',
    description: 'Modern stainless steel utensil holder. Space-saving design.',
    category: 'home-kitchen',
    price: 799,
    mrpPrice: 1599,
    stock: 75,
    brand: 'ModernKitchen',
    thumbnailImage: getProductImage('Utensil Holder Stainless Steel'),
    popularityScore: 71
  },
  {
    name: 'Measuring Spoon Set',
    slug: 'measuring-spoon-set',
    description: 'Stainless steel measuring spoon set with accurate markings.',
    category: 'home-kitchen',
    price: 399,
    mrpPrice: 799,
    stock: 150,
    brand: 'PrecisionTools',
    thumbnailImage: getProductImage('Measuring Spoon Set'),
    popularityScore: 68
  },
  {
    name: 'Microfiber Cleaning Cloth Set',
    slug: 'microfiber-cleaning-cloth-set',
    description: 'Set of 10 premium microfiber cleaning cloths. Lint-free and durable.',
    category: 'home-kitchen',
    price: 399,
    mrpPrice: 799,
    stock: 200,
    brand: 'CleanPro',
    thumbnailImage: getProductImage('Microfiber Cleaning Cloth Set'),
    popularityScore: 70
  },
  {
    name: 'Thermal Lunch Box',
    slug: 'thermal-lunch-box',
    description: 'Stainless steel thermal lunch box with multiple compartments. Keeps food hot/cold.',
    category: 'home-kitchen',
    price: 1299,
    mrpPrice: 2599,
    stock: 65,
    brand: 'FreshKeep',
    thumbnailImage: getProductImage('Thermal Lunch Box'),
    popularityScore: 77
  },
  {
    name: 'LED Kitchen Light Strip',
    slug: 'led-kitchen-light-strip',
    description: 'Under-cabinet LED light with motion sensor. Energy efficient.',
    category: 'home-kitchen',
    price: 899,
    mrpPrice: 1799,
    stock: 60,
    brand: 'BrightHome',
    thumbnailImage: getProductImage('LED Kitchen Light Strip'),
    popularityScore: 72
  },

  // Beauty & Personal Care - 14 products
  {
    name: 'Skincare Gift Set',
    slug: 'skincare-gift-set',
    description: 'Complete skincare routine with cleanser, toner, and moisturizer.',
    category: 'beauty',
    price: 1499,
    mrpPrice: 2999,
    stock: 40,
    brand: 'GlowCare',
    thumbnailImage: getProductImage('Skincare Gift Set'),
    isFeatured: true,
    popularityScore: 85
  },
  {
    name: 'Face Wash Gentle Formula',
    slug: 'face-wash-gentle-formula',
    description: 'Gentle face wash with natural ingredients. Suitable for all skin types.',
    category: 'beauty',
    price: 399,
    mrpPrice: 799,
    stock: 150,
    brand: 'SkinCare+',
    thumbnailImage: getProductImage('Face Wash Gentle Formula'),
    popularityScore: 79
  },
  {
    name: 'Sunscreen SPF 50',
    slug: 'sunscreen-spf-50',
    description: 'High SPF sunscreen with broad spectrum protection and water-resistant formula.',
    category: 'beauty',
    price: 799,
    mrpPrice: 1599,
    stock: 80,
    brand: 'SunShield',
    thumbnailImage: getProductImage('Sunscreen SPF 50'),
    isFeatured: true,
    popularityScore: 82
  },
  {
    name: 'Shampoo & Conditioner Combo',
    slug: 'shampoo-conditioner-combo',
    description: 'Sulfate-free shampoo and conditioner set for healthy hair.',
    category: 'beauty',
    price: 599,
    mrpPrice: 1199,
    stock: 100,
    brand: 'HairPro',
    thumbnailImage: getProductImage('Shampoo & Conditioner Combo'),
    popularityScore: 80
  },
  {
    name: 'Lip Balm Pack 3',
    slug: 'lip-balm-pack-3',
    description: 'Pack of 3 moisturizing lip balms with SPF. Various flavors.',
    category: 'beauty',
    price: 299,
    mrpPrice: 599,
    stock: 180,
    brand: 'LipCare',
    thumbnailImage: getProductImage('Lip Balm Pack 3'),
    popularityScore: 72
  },
  {
    name: 'Body Lotion Rich Hydration',
    slug: 'body-lotion-rich-hydration',
    description: 'Rich body lotion with shea butter and vitamin E.',
    category: 'beauty',
    price: 399,
    mrpPrice: 799,
    stock: 110,
    brand: 'SkinLux',
    thumbnailImage: getProductImage('Body Lotion Rich Hydration'),
    popularityScore: 74
  },
  {
    name: 'Face Serum Anti-Aging',
    slug: 'face-serum-anti-aging',
    description: 'Effective anti-aging face serum with vitamin C and hyaluronic acid.',
    category: 'beauty',
    price: 999,
    mrpPrice: 1999,
    stock: 50,
    brand: 'GlowCare',
    thumbnailImage: getProductImage('Face Serum Anti-Aging'),
    isFeatured: true,
    popularityScore: 83
  },
  {
    name: 'Face Mask Sheet Pack',
    slug: 'face-mask-sheet-pack',
    description: 'Pack of 10 hydrating face mask sheets with natural extracts.',
    category: 'beauty',
    price: 799,
    mrpPrice: 1599,
    stock: 70,
    brand: 'MaskMaster',
    thumbnailImage: getProductImage('Face Mask Sheet Pack'),
    popularityScore: 77
  },
  {
    name: 'Hair Oil Nourishing',
    slug: 'hair-oil-nourishing',
    description: 'Pure nourishing hair oil with coconut and argan oil blend.',
    category: 'beauty',
    price: 499,
    mrpPrice: 999,
    stock: 95,
    brand: 'NaturesCare',
    thumbnailImage: getProductImage('Hair Oil Nourishing'),
    popularityScore: 76
  },
  {
    name: 'Moisturizer Day Cream',
    slug: 'moisturizer-day-cream',
    description: 'Lightweight day cream with SPF protection and moisturizing ingredients.',
    category: 'beauty',
    price: 699,
    mrpPrice: 1399,
    stock: 80,
    brand: 'SkinCare+',
    thumbnailImage: getProductImage('Moisturizer Day Cream'),
    popularityScore: 78
  },
  {
    name: 'Eye Cream Dark Circles',
    slug: 'eye-cream-dark-circles',
    description: 'Targeted eye cream to reduce dark circles and fine lines.',
    category: 'beauty',
    price: 899,
    mrpPrice: 1799,
    stock: 60,
    brand: 'GlowCare',
    thumbnailImage: getProductImage('Eye Cream Dark Circles'),
    popularityScore: 81
  },
  {
    name: 'Beard Care Kit',
    slug: 'beard-care-kit',
    description: 'Complete beard care kit with oil, balm, and brush.',
    category: 'beauty',
    price: 799,
    mrpPrice: 1599,
    stock: 75,
    brand: 'BeardPro',
    thumbnailImage: getProductImage('Beard Care Kit'),
    popularityScore: 75
  },
  {
    name: 'Face Toner Hydrating',
    slug: 'face-toner-hydrating',
    description: 'Hydrating toner with rose water and glycerin for balanced skin.',
    category: 'beauty',
    price: 399,
    mrpPrice: 799,
    stock: 120,
    brand: 'SkinCare+',
    thumbnailImage: getProductImage('Face Toner Hydrating'),
    popularityScore: 73
  },
  {
    name: 'Deodorant Stick Fresh',
    slug: 'deodorant-stick-fresh',
    description: 'Long-lasting deodorant with fresh scent. 24-hour protection.',
    category: 'beauty',
    price: 299,
    mrpPrice: 599,
    stock: 150,
    brand: 'FreshScent',
    thumbnailImage: getProductImage('Deodorant Stick Fresh'),
    popularityScore: 70
  },

  // Fitness & Essentials - 14 products
  {
    name: 'Yoga Mat Premium 6mm',
    slug: 'yoga-mat-premium-6mm',
    description: 'Premium non-slip yoga mat with 6mm cushioning. Includes carrying strap.',
    category: 'fitness',
    price: 1299,
    mrpPrice: 2499,
    stock: 45,
    brand: 'YogaPro',
    thumbnailImage: getProductImage('Yoga Mat Premium 6mm'),
    isFeatured: true,
    popularityScore: 87
  },
  {
    name: 'Dumbbell Set 10kg',
    slug: 'dumbbell-set-10kg',
    description: 'Adjustable dumbbell set with 10kg total weight. Space-saving design.',
    category: 'fitness',
    price: 1499,
    mrpPrice: 2999,
    stock: 50,
    brand: 'FitGear',
    thumbnailImage: getProductImage('Dumbbell Set 10kg'),
    isFeatured: true,
    popularityScore: 82
  },
  {
    name: 'Resistance Band Set 5-Piece',
    slug: 'resistance-band-set-5-piece',
    description: 'Complete resistance band set for full-body workout.',
    category: 'fitness',
    price: 599,
    mrpPrice: 1199,
    stock: 70,
    brand: 'StrengthMax',
    thumbnailImage: getProductImage('Resistance Band Set 5-Piece'),
    popularityScore: 79
  },
  {
    name: 'Fitness Tracking Watch',
    slug: 'fitness-tracking-watch',
    description: 'Advanced fitness watch with GPS, heart rate monitor, and multiple sports modes.',
    category: 'fitness',
    price: 3999,
    mrpPrice: 7999,
    stock: 30,
    brand: 'SportTech',
    thumbnailImage: getProductImage('Fitness Tracking Watch'),
    isFeatured: true,
    popularityScore: 88
  },
  {
    name: 'Jump Rope Speed Training',
    slug: 'jump-rope-speed-training',
    description: 'Professional jump rope for speed training and cardio workouts.',
    category: 'fitness',
    price: 399,
    mrpPrice: 799,
    stock: 100,
    brand: 'SkipPro',
    thumbnailImage: getProductImage('Jump Rope Speed Training'),
    popularityScore: 72
  },
  {
    name: 'Push-Up Bar Set',
    slug: 'push-up-bar-set',
    description: 'Ergonomic push-up bars for enhanced training and muscle engagement.',
    category: 'fitness',
    price: 399,
    mrpPrice: 799,
    stock: 150,
    brand: 'CoreMax',
    thumbnailImage: getProductImage('Push-Up Bar Set'),
    popularityScore: 70
  },
  {
    name: 'Foam Roller Massage',
    slug: 'foam-roller-massage',
    description: 'High-density foam roller for muscle recovery and massage.',
    category: 'fitness',
    price: 599,
    mrpPrice: 1199,
    stock: 80,
    brand: 'RecoveryPro',
    thumbnailImage: getProductImage('Foam Roller Massage'),
    popularityScore: 76
  },
  {
    name: 'Protein Shaker Bottle',
    slug: 'protein-shaker-bottle',
    description: 'Convenient protein shaker bottle with mixer ball.',
    category: 'fitness',
    price: 299,
    mrpPrice: 599,
    stock: 200,
    brand: 'FitTools',
    thumbnailImage: getProductImage('Protein Shaker Bottle'),
    popularityScore: 69
  },
  {
    name: 'Workout Gloves Padded',
    slug: 'workout-gloves-padded',
    description: 'Padded workout gloves for weightlifting and training.',
    category: 'fitness',
    price: 599,
    mrpPrice: 1199,
    stock: 90,
    brand: 'GraspFit',
    thumbnailImage: getProductImage('Workout Gloves Padded'),
    popularityScore: 71
  },
  {
    name: 'Pull-Up Bar Doorway',
    slug: 'pull-up-bar-doorway',
    description: 'Adjustable doorway pull-up bar with ergonomic grip. Supports up to 300kg.',
    category: 'fitness',
    price: 899,
    mrpPrice: 1799,
    stock: 60,
    brand: 'StrengthMax',
    thumbnailImage: getProductImage('Pull-Up Bar Doorway'),
    isFeatured: true,
    popularityScore: 80
  },
  {
    name: 'Exercise Ball 65cm',
    slug: 'exercise-ball-65cm',
    description: 'Anti-burst exercise ball for core training and rehabilitation.',
    category: 'fitness',
    price: 799,
    mrpPrice: 1599,
    stock: 50,
    brand: 'FitBall',
    thumbnailImage: getProductImage('Exercise Ball 65cm'),
    popularityScore: 75
  },
  {
    name: 'Skipping Rope Digital Counter',
    slug: 'skipping-rope-digital-counter',
    description: 'Jump rope with digital counter for tracking workouts.',
    category: 'fitness',
    price: 699,
    mrpPrice: 1399,
    stock: 75,
    brand: 'SmartFit',
    thumbnailImage: getProductImage('Skipping Rope Digital Counter'),
    isFeatured: true,
    popularityScore: 79
  },
  {
    name: 'Ab Roller Wheel',
    slug: 'ab-roller-wheel',
    description: 'Efficient ab roller wheel for core strengthening exercises.',
    category: 'fitness',
    price: 499,
    mrpPrice: 999,
    stock: 85,
    brand: 'CoreMax',
    thumbnailImage: getProductImage('Ab Roller Wheel'),
    popularityScore: 73
  },
  {
    name: 'Water Bottle Sports',
    slug: 'water-bottle-sports',
    description: 'Durable sports water bottle with measurements markings. Leak-proof design.',
    category: 'fitness',
    price: 399,
    mrpPrice: 799,
    stock: 160,
    brand: 'HydroFit',
    thumbnailImage: getProductImage('Water Bottle Sports'),
    popularityScore: 74
  },

  // Stationery & Office - 14 products
  {
    name: 'Premium Notebook Set',
    slug: 'premium-notebook-set',
    description: 'Set of 3 premium notebooks with hardcover and quality paper.',
    category: 'stationery',
    price: 599,
    mrpPrice: 999,
    stock: 150,
    brand: 'NoteFlow',
    thumbnailImage: getProductImage('Premium Notebook Set'),
    isFeatured: true,
    popularityScore: 80
  },
  {
    name: 'Pen Set Professional 50pcs',
    slug: 'pen-set-professional-50pcs',
    description: 'Professional pen set with 50 pieces in various colors and tips.',
    category: 'stationery',
    price: 799,
    mrpPrice: 1599,
    stock: 80,
    brand: 'WritePro',
    thumbnailImage: getProductImage('Pen Set Professional 50pcs'),
    isFeatured: true,
    popularityScore: 78
  },
  {
    name: 'Desk Organizer Set',
    slug: 'desk-organizer-set',
    description: 'Complete desk organizer set with multiple compartments.',
    category: 'stationery',
    price: 799,
    mrpPrice: 1599,
    stock: 80,
    brand: 'OrganizeMax',
    thumbnailImage: getProductImage('Desk Organizer Set'),
    isFeatured: true,
    popularityScore: 72
  },
  {
    name: 'Index Card Set',
    slug: 'index-card-set',
    description: 'Pack of 500 index cards for note-taking and organization.',
    category: 'stationery',
    price: 299,
    mrpPrice: 599,
    stock: 200,
    brand: 'StudyHelper',
    thumbnailImage: getProductImage('Index Card Set'),
    popularityScore: 65
  },
  {
    name: 'Highlighter Marker Set',
    slug: 'highlighter-marker-set',
    description: 'Set of 12 bright color highlighter markers with fine tips.',
    category: 'stationery',
    price: 399,
    mrpPrice: 799,
    stock: 120,
    brand: 'ColorMaster',
    thumbnailImage: getProductImage('Highlighter Marker Set'),
    popularityScore: 68
  },
  {
    name: 'Sticky Notes Assorted Pack',
    slug: 'sticky-notes-assorted-pack',
    description: 'Assorted sticky notes in multiple colors and sizes.',
    category: 'stationery',
    price: 199,
    mrpPrice: 399,
    stock: 350,
    brand: 'StickyMax',
    thumbnailImage: getProductImage('Sticky Notes Assorted Pack'),
    popularityScore: 61
  },
  {
    name: 'Calculator Scientific',
    slug: 'calculator-scientific',
    description: 'Advanced scientific calculator with 240+ functions.',
    category: 'stationery',
    price: 1299,
    mrpPrice: 2599,
    stock: 50,
    brand: 'MathPro',
    thumbnailImage: getProductImage('Calculator Scientific'),
    popularityScore: 67
  },
  {
    name: 'Stapler Heavy Duty',
    slug: 'stapler-heavy-duty',
    description: 'Professional heavy-duty stapler for office use.',
    category: 'stationery',
    price: 499,
    mrpPrice: 999,
    stock: 120,
    brand: 'OfficePro',
    thumbnailImage: getProductImage('Stapler Heavy Duty'),
    popularityScore: 65
  },
  {
    name: 'File Folder Set 12',
    slug: 'file-folder-set-12',
    description: 'Set of 12 colorful file folders for organization.',
    category: 'stationery',
    price: 399,
    mrpPrice: 799,
    stock: 180,
    brand: 'OrganizeMax',
    thumbnailImage: getProductImage('File Folder Set 12'),
    popularityScore: 64
  },
  {
    name: 'Paper Clips Assorted Box',
    slug: 'paper-clips-assorted-box',
    description: 'Large box of assorted paper clips in different sizes and colors.',
    category: 'stationery',
    price: 199,
    mrpPrice: 399,
    stock: 400,
    brand: 'OfficeBasics',
    thumbnailImage: getProductImage('Paper Clips Assorted Box'),
    popularityScore: 60
  },
  {
    name: 'Envelope Pack 100',
    slug: 'envelope-pack-100',
    description: 'Pack of 100 standard office envelopes.',
    category: 'stationery',
    price: 249,
    mrpPrice: 499,
    stock: 300,
    brand: 'OfficeBasics',
    thumbnailImage: getProductImage('Envelope Pack 100'),
    popularityScore: 59
  },
  {
    name: 'Tape Dispenser Heavy Duty',
    slug: 'tape-dispenser-heavy-duty',
    description: 'Heavy-duty tape dispenser for office and packaging.',
    category: 'stationery',
    price: 399,
    mrpPrice: 799,
    stock: 150,
    brand: 'OfficePro',
    thumbnailImage: getProductImage('Tape Dispenser Heavy Duty'),
    popularityScore: 62
  },
  {
    name: 'Scissor Set Office',
    slug: 'scissor-set-office',
    description: 'Set of 3 office scissors with comfortable grip and sharp blades.',
    category: 'stationery',
    price: 499,
    mrpPrice: 999,
    stock: 100,
    brand: 'CutPro',
    thumbnailImage: getProductImage('Scissor Set Office'),
    popularityScore: 66
  },
  {
    name: 'Whiteboard Markers Pack',
    slug: 'whiteboard-markers-pack',
    description: 'Pack of 24 whiteboard markers in assorted colors.',
    category: 'stationery',
    price: 399,
    mrpPrice: 799,
    stock: 140,
    brand: 'WritePro',
    thumbnailImage: getProductImage('Whiteboard Markers Pack'),
    popularityScore: 63
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    
    console.log('🗑️ Clearing existing data...');
    await getCollection('users').deleteMany({});
    await getCollection('categories').deleteMany({});
    await getCollection('products').deleteMany({});

    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await getCollection('users').insertOne({
      name: 'Admin User',
      email: 'admin@urbancart.com',
      password: adminPassword,
      phone: '9999999999',
      role: 'admin',
      createdAt: new Date(),
      wishlist: []
    });

    console.log('📁 Creating categories...');
    const createdCats = await getCollection('categories').insertMany(
      categories.map(cat => ({ ...cat, isActive: true, createdAt: new Date() }))
    );
    console.log('✅ Created ' + createdCats.insertedCount + ' categories');

    console.log('📦 Creating products...');
    const catDocs = await getCollection('categories').find().toArray();
    const categoryMap = {};
    catDocs.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    const productsToInsert = sampleProducts.map((product) => ({
      ...product,
      category: categoryMap[product.category],
      isActive: true,
      rating: { average: 0, count: 0 },
      images: [],
      tags: [],
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const createdProds = await getCollection('products').insertMany(productsToInsert);
    console.log('✅ Created ' + createdProds.insertedCount + ' products');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();


