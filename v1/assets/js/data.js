(function (window) {
  'use strict';

  window.CM = window.CM || {};
  CM.brand = {
    name: 'Kavindu Online Store', hotline: '+94 11 234 5678', whatsapp: '94771234567',
    email: 'hello@kavindustore.lk', note: 'Demo info — to be confirmed'
  };

  const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
  CM.categories = [
    { id: 'refrigerators', name: 'Refrigerators', icon: 'fa-solid fa-box', image: photo('photo-1622372738946-62e02505feb3'), count: 28 },
    { id: 'washing-machines', name: 'Washing Machines', icon: 'fa-solid fa-shirt', image: photo('photo-1626806787461-102c1bfaaea1'), count: 16 },
    { id: 'tv-audio', name: 'TV & Audio', icon: 'fa-solid fa-tv', image: photo('photo-1593359677879-a4bb92f829d1'), count: 34 },
    { id: 'air-conditioners', name: 'Air Conditioners', icon: 'fa-solid fa-wind', image: photo('photo-1665826254141-bfa10685e002'), count: 22 },
    { id: 'kitchen-appliances', name: 'Kitchen Appliances', icon: 'fa-solid fa-kitchen-set', image: photo('photo-1556911220-bff31c812dba'), count: 42 },
    { id: 'furniture', name: 'Furniture', icon: 'fa-solid fa-couch', image: photo('photo-1555041469-a586c61ea9bc'), count: 58 },
    { id: 'laptops-phones', name: 'Laptops & Phones', icon: 'fa-solid fa-laptop', image: photo('photo-1496181133206-80ce9b88a853'), count: 31 },
    { id: 'small-appliances', name: 'Small Appliances', icon: 'fa-solid fa-blender', image: photo('photo-1570222094114-d054a817e56b'), count: 37 }
  ];

  const real = [
    { id: 'innovex-no-frost-inverter-fridge-250l', name: 'Innovex No Frost Refrigerator (Inverter) 250L', brand: 'Innovex', sku: 'INR240I', price: 131900, was: 149900, demoWas: true, category: 'refrigerators', specs: ['250L capacity', 'Inverter compressor', 'No Frost cooling', 'LED interior light'], description: 'A spacious no-frost inverter refrigerator designed for efficient everyday family cooling.', images: ['https://nextcominnovex.s3.ap-south-1.amazonaws.com/inble-01-jpg.jpeg'], warranty: '2 Year Manufacturer Warranty; 5 Years against Body Corrosion; 10 Years Compressor Warranty', rating: 4.8, reviews: 26, stock: 'In stock', badges: ['Easy Payment', 'New'] },
    { id: 'innovex-fully-auto-washer-6kg', name: 'Innovex Fully Automatic Washing Machine 6kg', brand: 'Innovex', sku: 'WMDFAN60POW', price: 85250, was: 94900, demoWas: true, category: 'washing-machines', specs: ['6kg capacity', 'Fully automatic', 'Multiple wash programmes', 'Child lock'], description: 'A practical fully automatic washer for efficient daily laundry in compact homes.', images: ['https://nextcominnovex.s3.ap-south-1.amazonaws.com/wm-1-09-jpg.jpeg'], warranty: '1 Year Manufacturer Warranty', rating: 4.6, reviews: 18, stock: 'In stock', badges: ['Easy Payment'] },
    { id: 'innovex-65-4k-google-qled-tv', name: 'Innovex 65" 4K Google QLED TV', brand: 'Innovex', sku: 'ITVE65G', price: 299900, was: 329900, demoWas: true, category: 'tv-audio', specs: ['65-inch 4K QLED display', 'Google TV', 'Dolby Audio', 'Built-in Chromecast'], description: 'A big-screen QLED Google TV for vivid home cinema and effortless streaming.', images: ['https://nextcominnovex.s3.ap-south-1.amazonaws.com/itve65g-innovex-thumb.jpg'], warranty: '2 Year Manufacturer Warranty', rating: 4.7, reviews: 34, stock: 'In stock', badges: ['Easy Payment', 'New'] },
    { id: 'innovex-gold-fin-inverter-ac', name: 'Innovex Gold Fin Inverter Air Conditioner (9,000 BTU)', brand: 'Innovex', sku: 'IAC099I', price: 219900, was: 239900, demoWas: true, category: 'air-conditioners', specs: ['9,000 BTU cooling', 'Inverter technology', 'Gold Fin coating', 'R32 refrigerant'], description: 'Efficient inverter cooling with a durable Gold Fin outdoor coil for Sri Lankan homes.', images: ['https://nextcominnovex.s3.ap-south-1.amazonaws.com/acnew-07-jpg.jpeg'], warranty: '2 Year Warranty for unit; 10 Year Warranty for compressor; Free 3 services', rating: 4.5, reviews: 12, stock: 'In stock', badges: ['Easy Payment', 'Deal'] },
    { id: 'arpico-nechama-sofa-set-321', name: 'Nechama Sofa Set 3+2+1', brand: 'Arpico Furniture', sku: '914994', price: 213700, category: 'furniture', specs: ['3+2+1 seating', 'Upholstered finish', 'Solid frame', 'Living-room set'], description: 'A balanced three-piece lounge set that brings comfortable seating to a modern home.', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=82'], warranty: 'Manufacturer warranty applies', rating: 4.6, reviews: 9, stock: 'In stock', badges: ['Easy Payment'] },
    { id: 'arpico-bedroom-set-plain-teak', name: 'Bed Room Set - Plain Teak', brand: 'Arpico Furniture', sku: '730112', price: 473200, category: 'furniture', specs: ['Plain teak finish', 'Bed, wardrobe and side tables', 'Natural wood look', 'Bedroom collection'], description: 'A warm plain-teak bedroom collection with a timeless, understated finish.', images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=82'], warranty: 'Manufacturer warranty applies', rating: 4.8, reviews: 7, stock: 'In stock', badges: ['Easy Payment', 'New'] },
    { id: 'arpico-dining-set-trion-8-seater', name: 'Dining Set Trion - 8 Seater', brand: 'Arpico Furniture', sku: '744339', price: 332800, category: 'furniture', specs: ['8-seater dining set', 'Dining table and chairs', 'Durable finish', 'Family-size design'], description: 'A generous eight-seater dining set made for shared meals and everyday hosting.', images: ['https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=900&q=82'], warranty: 'Manufacturer warranty applies', rating: 4.4, reviews: 11, stock: 'In stock', badges: ['Easy Payment'] },
    { id: 'singer-hp-laptop-15-fd0688tu', name: 'HP Laptop 15-FD0688TU, Core i5-1334U, 8GB, 512GB SSD', brand: 'HP', sku: 'HP-I5-13U-8-512-SLR', price: 299990, category: 'laptops-phones', specs: ['Intel Core i5-1334U 13th Gen', '8GB DDR4 RAM', '512GB NVMe SSD', '15.6-inch FHD display', 'Windows 11 Home'], description: 'A mainstream 15.6-inch Windows laptop for students and office use, with a 13th-gen i5 and fast SSD.', images: ['https://singerwebcdn.azureedge.net/resources/products/max/HP-I5-13U-8-512-SlIM-SLR-01.jpg'], warranty: '3 Years Manufacturer Warranty', rating: 4.7, reviews: 21, stock: 'In stock', badges: ['Easy Payment'] },
    { id: 'singer-apple-iphone-18-pro-256gb', name: 'Apple iPhone 18 Pro (12GB / 256GB) Black', brand: 'Apple', sku: 'AP-18-PRO-256GB-BLK', price: 627999, category: 'laptops-phones', specs: ['6.3-inch LTPO OLED 120Hz', 'Apple A20 Pro chip', '12GB RAM / 256GB storage', '48MP camera system', 'IP68 water resistance'], description: 'Apple flagship performance with a smooth OLED display and a versatile pro camera system.', images: ['https://singerwebcdn.azureedge.net/resources/products/max/AP-18-PRO-256GB-BLK-01.jpg', 'https://singerwebcdn.azureedge.net/resources/products/max/AP-18-PRO-256GB-BLK-02.jpg'], warranty: '1 Year Manufacturer Warranty', rating: 4.9, reviews: 43, stock: 'In stock', badges: ['New', 'Easy Payment'] },
    { id: 'innovex-air-fryer-5l', name: 'Innovex Air Fryer 5L', brand: 'Innovex', sku: 'IAF003', price: 28900, category: 'small-appliances', specs: ['5L capacity', '1500W', '12 functions', 'Digital display', 'Overheat protection'], description: 'A 5-litre digital air fryer with 12 preset functions and a see-through window.', images: ['https://nextcominnovex.s3.ap-south-1.amazonaws.com/new-air-fryer(1).jpg'], warranty: '1 Year Manufacturer Warranty', rating: 4.3, reviews: 15, stock: 'In stock', badges: ['Deal'] }
  ];

  const demo = [
    ['demo-side-by-side-fridge', 'Kavindu Side-by-Side Refrigerator 520L', 'Kavindu', 'refrigerators', 289900, 'photo-1622372738946-62e02505feb3', ['520L capacity', 'Inverter cooling', 'Water dispenser']],
    ['demo-front-load-washer', 'Kavindu Front Load Washing Machine 9kg', 'Kavindu', 'washing-machines', 149900, 'photo-1626806787461-102c1bfaaea1', ['9kg capacity', '15 programmes', 'Steam wash']],
    ['demo-55-inch-tv', 'Samsung 55" Crystal UHD Smart TV', 'Samsung', 'tv-audio', 219900, 'photo-1593359677879-a4bb92f829d1', ['55-inch 4K display', 'Smart TV', 'HDR support']],
    ['demo-ac-12000-btu', 'LG Dual Inverter AC 12,000 BTU', 'LG', 'air-conditioners', 259900, 'photo-1665826254141-bfa10685e002', ['12,000 BTU', 'Dual inverter', 'Fast cooling']],
    ['demo-l-shape-sofa', 'Modern L-Shape Fabric Sofa', 'Kavindu Home', 'furniture', 184900, 'photo-1555041469-a586c61ea9bc', ['L-shape layout', 'Washable fabric', 'Deep seating']],
    ['demo-queen-mattress', 'Sleepwell Queen Mattress', 'Sleepwell', 'furniture', 79900, 'photo-1631049307264-da0ec9d70304', ['Queen size', 'Memory foam', '10-year warranty']],
    ['demo-office-chair', 'Ergonomic Mesh Office Chair', 'Kavindu Home', 'furniture', 34900, 'photo-1586023492125-27b2c045efd7', ['Adjustable height', 'Lumbar support', 'Breathable mesh']],
    ['demo-microwave-oven', 'Panasonic 25L Microwave Oven', 'Panasonic', 'kitchen-appliances', 45900, 'photo-1585659722983-3a675dabf23d', ['25L capacity', '800W power', 'Auto menus']],
    ['demo-blender', 'Philips 1.5L Blender', 'Philips', 'small-appliances', 19900, 'photo-1570222094114-d054a817e56b', ['1.5L jar', '600W motor', 'Ice crushing']],
    ['demo-smartphone', 'Samsung Galaxy A56 5G', 'Samsung', 'laptops-phones', 129900, 'photo-1511707171634-5f897ff02aa9', ['5G connectivity', '128GB storage', 'AMOLED display']]
  ].map(([id, name, brand, category, price, image, specs]) => ({ id, name, brand, sku: id.toUpperCase(), price, category, specs, description: `A carefully selected ${name.toLowerCase()} for dependable everyday use.`, images: [photo(image)], warranty: '1 Year Manufacturer Warranty', rating: 4.5, reviews: 8, stock: 'In stock', badges: ['Easy Payment'], demo: true }));

  CM.products = real.concat(demo);
  CM.easyPayment = { note: 'Placeholder rates — WAITING ON CLIENT', minDownPct: 20, defaultDownPct: 25, tenures: [{ months: 6, markupPct: 8 }, { months: 12, markupPct: 16 }, { months: 18, markupPct: 24 }, { months: 24, markupPct: 32 }, { months: 36, markupPct: 45 }], defaultTenure: 12, minPrice: 15000 };
  CM.stores = [
    { name: 'Colombo 03', address: '125 Galle Road, Colombo 03', phone: '+94 11 234 5678', hours: '9:00 AM – 7:00 PM', mapQuery: 'Kavindu Online Store Colombo 03' },
    { name: 'Nugegoda', address: '48 High Level Road, Nugegoda', phone: '+94 11 234 5679', hours: '9:00 AM – 7:00 PM', mapQuery: 'Kavindu Online Store Nugegoda' },
    { name: 'Kandy', address: '22 Dalada Veediya, Kandy', phone: '+94 81 234 5678', hours: '9:00 AM – 6:30 PM', mapQuery: 'Kavindu Online Store Kandy' },
    { name: 'Kurunegala', address: '16 Rajapihilla Mawatha, Kurunegala', phone: '+94 37 234 5678', hours: '9:00 AM – 6:30 PM', mapQuery: 'Kavindu Online Store Kurunegala' },
    { name: 'Galle', address: '88 Wakwella Road, Galle', phone: '+94 91 234 5678', hours: '9:00 AM – 6:30 PM', mapQuery: 'Kavindu Online Store Galle' },
    { name: 'Negombo', address: '31 Main Street, Negombo', phone: '+94 31 234 5678', hours: '9:00 AM – 6:30 PM', mapQuery: 'Kavindu Online Store Negombo' }
  ];
  CM.banks0pct = [
    { name: 'Sampath', months: '0% up to 24 months' }, { name: 'Commercial Bank', months: '0% up to 24 months' },
    { name: 'HNB', months: '0% up to 18 months' }, { name: 'NTB / Amex', months: '0% up to 24 months' },
    { name: 'DFCC', months: '0% up to 12 months' }, { name: 'Seylan', months: '0% up to 12 months' }
  ];
})(window);
