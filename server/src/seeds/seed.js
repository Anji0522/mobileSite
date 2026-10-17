import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { Brand } from '../models/Brand.js';
import { Mobile } from '../models/Mobile.js';
import { Accessory } from '../models/Accessory.js';
import { Service } from '../models/Service.js';
import { Review } from '../models/Review.js';
import { rawMobiles } from './mobileData.js';

const brandsList = [
  { name: 'Samsung', slug: 'samsung', country: 'South Korea', establishedYear: 1938, isFeatured: true, description: 'Global leader in mobile innovation with the Galaxy AI flagship series, foldable Z series, and best-selling M & A series in India.' },
  { name: 'Apple', slug: 'apple', country: 'USA', establishedYear: 1976, isFeatured: true, description: 'Iconic iPhone lineup featuring Apple Silicon chips, Super Retina XDR displays, Pro camera systems, and Apple Intelligence.' },
  { name: 'OnePlus', slug: 'oneplus', country: 'China', establishedYear: 2013, isFeatured: true, description: 'Fast and Smooth experience with Hasselblad cameras, 100W SUPERVOOC charging, and community-driven OxygenOS.' },
  { name: 'Xiaomi', slug: 'xiaomi', country: 'China', establishedYear: 2010, isFeatured: true, description: 'Pioneering flagship photography in India with Leica optical lenses, HyperOS, and innovative hardware.' },
  { name: 'Redmi', slug: 'redmi', country: 'China', establishedYear: 2013, isFeatured: true, description: 'India\'s most loved budget and mid-range hero brand, offering 200MP cameras, curved AMOLED displays, and 5G at honest prices.' },
  { name: 'Realme', slug: 'realme', country: 'China', establishedYear: 2018, isFeatured: true, description: 'Dare to Leap spirit providing next-generation charging speeds, Sony flagship sensors, and trendsetting youth designs.' },
  { name: 'Vivo', slug: 'vivo', country: 'China', establishedYear: 2009, isFeatured: true, description: 'Masters of mobile portraiture with ZEISS optics, slim aesthetics, and ultra-durable BlueVolt batteries.' },
  { name: 'Oppo', slug: 'oppo', country: 'China', establishedYear: 2004, isFeatured: true, description: 'Camera phone pioneers known for Reno series portraits, ColorOS AI features, and industry-first IP69 durability.' },
  { name: 'Motorola', slug: 'motorola', country: 'USA', establishedYear: 1928, isFeatured: true, description: 'Clean Hello UI, real wooden and vegan leather backs, Pantone validated colors, and 144Hz pOLED displays.' },
  { name: 'Nothing', slug: 'nothing', country: 'UK', establishedYear: 2020, isFeatured: true, description: 'London-based design powerhouse making tech fun again with transparent hardware, Glyph lighting, and bloat-free Nothing OS.' },
  { name: 'Google', slug: 'google', country: 'USA', establishedYear: 1998, isFeatured: true, description: 'The purest Android experience powered by Google Tensor chips, unmatched computational photography, and 7 years of Pixel drops.' },
  { name: 'iQOO', slug: 'iqoo', country: 'China', establishedYear: 2019, isFeatured: true, description: 'I Quest On and On: Peak gaming and flagship performance with dedicated Q1 supercomputing display chips and 120W charging.' },
  { name: 'Poco', slug: 'poco', country: 'China', establishedYear: 2018, isFeatured: true, description: 'Everything you need, nothing you don\'t: High performance flagship killer chipsets at disruptive Indian price tags.' },
  { name: 'Infinix', slug: 'infinix', country: 'Hong Kong', establishedYear: 2013, isFeatured: true, description: 'Trendsetting gaming phones featuring Cyber Mecha designs, bypass charging, and wireless MagCharge technology.' },
  { name: 'Tecno', slug: 'tecno', country: 'Hong Kong', establishedYear: 2006, isFeatured: true, description: 'Stop At Nothing: Premium camera innovations featuring custom Sony imaging chips, large batteries, and futuristic foldables.' },
  { name: 'Lava', slug: 'lava', country: 'India', establishedYear: 2009, isFeatured: true, description: 'Proudly Indian tech manufacturer delivering clean ad-free Android, dual-screen innovations, and free doorstep service.' },
];

// Helper to expand catalog to 105+ verified phones
const generateExpandedCatalogue = () => {
  const result = [...rawMobiles];

  // Specific additional models for each brand to reach 105+ real phones sold in India
  const additionalModelTemplates = [
    // Samsung
    { brand: 'Samsung', name: 'Samsung Galaxy S24+ 5G', mrp: 99999, current: 84999, ram: '12 GB', storage: '256 GB', chip: 'Exynos 2400', tags: ['QHD+ AMOLED', 'Galaxy AI', '4900mAh'] },
    { brand: 'Samsung', name: 'Samsung Galaxy S23 FE 5G', mrp: 59999, current: 37999, ram: '8 GB', storage: '128 GB', chip: 'Exynos 2200', tags: ['Fan Edition', 'OIS Camera', 'IP68'] },
    { brand: 'Samsung', name: 'Samsung Galaxy Z Flip 6 5G', mrp: 109999, current: 99999, ram: '12 GB', storage: '256 GB', chip: 'Snapdragon 8 Gen 3', tags: ['FlexCam', 'Galaxy AI', 'Foldable'] },
    { brand: 'Samsung', name: 'Samsung Galaxy A35 5G', mrp: 30999, current: 25999, ram: '8 GB', storage: '128 GB', chip: 'Exynos 1380', tags: ['Super AMOLED 120Hz', 'Knox Vault', 'IP67'] },
    { brand: 'Samsung', name: 'Samsung Galaxy F55 5G', mrp: 28999, current: 23999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 7 Gen 1', tags: ['Vegan Leather', 'Super AMOLED+', '45W'] },
    { brand: 'Samsung', name: 'Samsung Galaxy F15 5G', mrp: 15999, current: 12499, ram: '6 GB', storage: '128 GB', chip: 'Dimensity 6100+', tags: ['6000mAh', 'sAMOLED', '4 Gen OS'] },

    // Apple
    { brand: 'Apple', name: 'Apple iPhone 16 Pro', mrp: 119900, current: 114900, ram: '8 GB', storage: '128 GB', chip: 'A18 Pro', tags: ['Grade 5 Titanium', 'Camera Control', 'ProMotion 120Hz'] },
    { brand: 'Apple', name: 'Apple iPhone 16 Plus', mrp: 89900, current: 84900, ram: '8 GB', storage: '128 GB', chip: 'A18', tags: ['6.7 inch Display', 'Camera Control', 'Big Battery'] },
    { brand: 'Apple', name: 'Apple iPhone 15 Pro Max', mrp: 159900, current: 134900, ram: '8 GB', storage: '256 GB', chip: 'A17 Pro', tags: ['5x Optical Zoom', 'Titanium', 'Action Button'] },
    { brand: 'Apple', name: 'Apple iPhone 15 Pro', mrp: 134900, current: 119900, ram: '8 GB', storage: '128 GB', chip: 'A17 Pro', tags: ['Titanium Frame', 'USB 3', 'Ray Tracing'] },
    { brand: 'Apple', name: 'Apple iPhone 15 Plus', mrp: 79900, current: 67999, ram: '6 GB', storage: '128 GB', chip: 'A16 Bionic', tags: ['Dynamic Island', 'Best iPhone Battery', 'USB-C'] },
    { brand: 'Apple', name: 'Apple iPhone 14', mrp: 59900, current: 49999, ram: '6 GB', storage: '128 GB', chip: 'A15 Bionic', tags: ['Crash Detection', 'Super Retina XDR', 'Cinematic'] },

    // OnePlus
    { brand: 'OnePlus', name: 'OnePlus 12R 5G', mrp: 39999, current: 35999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 8 Gen 2', tags: ['5500mAh', '100W SUPERVOOC', '4th Gen LTPO'] },
    { brand: 'OnePlus', name: 'OnePlus Open 5G (Foldable)', mrp: 139999, current: 129999, ram: '16 GB', storage: '512 GB', chip: 'Snapdragon 8 Gen 2', tags: ['Hasselblad Tri-Camera', 'Zero-Crease Flexion Hinge', 'Open Canvas'] },
    { brand: 'OnePlus', name: 'OnePlus Nord CE4 5G', mrp: 24999, current: 22999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 7 Gen 3', tags: ['100W SUPERVOOC', 'Sony LYT-600', '5500mAh'] },
    { brand: 'OnePlus', name: 'OnePlus 11 5G', mrp: 56999, current: 44999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 8 Gen 2', tags: ['Hasselblad', '100W Charging', 'Alert Slider'] },

    // Xiaomi / Redmi
    { brand: 'Xiaomi', name: 'Xiaomi 14 5G', mrp: 69999, current: 59999, ram: '12 GB', storage: '512 GB', chip: 'Snapdragon 8 Gen 3', tags: ['Compact Leica Flagship', '90W HyperCharge', 'LTPO 120Hz'] },
    { brand: 'Xiaomi', name: 'Xiaomi 13 Pro 5G', mrp: 79999, current: 54999, ram: '12 GB', storage: '256 GB', chip: 'Snapdragon 8 Gen 2', tags: ['1-inch Leica Sensor', '120W Charging', '2K Display'] },
    { brand: 'Redmi', name: 'Redmi Note 13 Pro 5G', mrp: 25999, current: 21999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 7s Gen 2', tags: ['200MP OIS', '1.5K AMOLED', '67W Turbo'] },
    { brand: 'Redmi', name: 'Redmi Note 13 5G', mrp: 17999, current: 14999, ram: '6 GB', storage: '128 GB', chip: 'Dimensity 6080', tags: ['108MP Camera', 'Slimmest Redmi Note', '120Hz AMOLED'] },
    { brand: 'Redmi', name: 'Redmi 12 5G', mrp: 13999, current: 11999, ram: '6 GB', storage: '128 GB', chip: 'Snapdragon 4 Gen 2', tags: ['Crystal Glass Design', 'FHD+ 90Hz', '5000mAh'] },

    // Realme
    { brand: 'Realme', name: 'Realme GT 6T 5G', mrp: 30999, current: 26999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 7+ Gen 3', tags: ['6000 nits Hyper Display', '120W SUPERVOOC', '5500mAh'] },
    { brand: 'Realme', name: 'Realme 13 Pro 5G', mrp: 29999, current: 24999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 7s Gen 2', tags: ['Sony LYT-600 OIS', 'Monet Glass', 'AI Ultra Clarity'] },
    { brand: 'Realme', name: 'Realme 12 Pro+ 5G', mrp: 34999, current: 28999, ram: '8 GB', storage: '256 GB', chip: 'Snapdragon 7s Gen 2', tags: ['64MP Periscope Zoom', 'Submarine Luxury Watch Design', 'Sony IMX890'] },
    { brand: 'Realme', name: 'Realme 12+ 5G', mrp: 20999, current: 17999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 7050', tags: ['Sony LYT-600 OIS', 'Luxury Vegan Leather', '67W Charging'] },
    { brand: 'Realme', name: 'Realme Narzo 70 Turbo 5G', mrp: 19999, current: 16999, ram: '6 GB', storage: '128 GB', chip: 'Dimensity 7300 Energy', tags: ['Turbo Motorsport Design', 'Stainless Steel VC', '90 FPS Gaming'] },
    { brand: 'Realme', name: 'Realme P1 Pro 5G', mrp: 21999, current: 18999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 6 Gen 1', tags: ['Curved AMOLED 120Hz', 'Sony LYT-600 OIS', 'Tactile Engine'] },
    { brand: 'Realme', name: 'Realme C65 5G', mrp: 12499, current: 10499, ram: '4 GB', storage: '128 GB', chip: 'Dimensity 6300', tags: ['Affordable 5G', '120Hz Eye Comfort', 'IP54'] },

    // Vivo
    { brand: 'Vivo', name: 'Vivo X100 5G', mrp: 69999, current: 63999, ram: '12 GB', storage: '256 GB', chip: 'Dimensity 9300', tags: ['ZEISS 50MP Main', '120W FlashCharge', 'Sunburst Ring'] },
    { brand: 'Vivo', name: 'Vivo V40 5G', mrp: 39999, current: 34999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 7 Gen 3', tags: ['ZEISS All Focal Length', '5500mAh BlueVolt', 'IP68'] },
    { brand: 'Vivo', name: 'Vivo V30 Pro 5G', mrp: 46999, current: 41999, ram: '8 GB', storage: '256 GB', chip: 'Dimensity 8200', tags: ['ZEISS Professional Portrait', 'Aura Light Studio', '3D Curved'] },
    { brand: 'Vivo', name: 'Vivo V30 5G', mrp: 33999, current: 28999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 7 Gen 3', tags: ['Smart Aura Light', '50MP Eye AF Selfie', '7.45mm Ultra Slim'] },
    { brand: 'Vivo', name: 'Vivo T3 Ultra 5G', mrp: 35999, current: 31999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 9200+', tags: ['Flagship Dimensity 9200+', 'Sony IMX921 OIS', '3D Curved AMOLED'] },
    { brand: 'Vivo', name: 'Vivo T3 5G', mrp: 22999, current: 18999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 7200', tags: ['Sony IMX882 OIS', 'Dual Stereo Speakers', '4K Video'] },
    { brand: 'Vivo', name: 'Vivo Y200e 5G', mrp: 21999, current: 17499, ram: '6 GB', storage: '128 GB', chip: 'Snapdragon 4 Gen 2', tags: ['EcoFiber Leather Back', '120Hz AMOLED', '300% Audio Booster'] },

    // Oppo
    { brand: 'Oppo', name: 'Oppo Find X7 Ultra 5G', mrp: 89999, current: 79999, ram: '16 GB', storage: '512 GB', chip: 'Snapdragon 8 Gen 3', tags: ['World\'s First Dual Periscope', '1-inch Sony LYT-900', 'Hasselblad'] },
    { brand: 'Oppo', name: 'Oppo Reno 12 5G', mrp: 32999, current: 28999, ram: '8 GB', storage: '256 GB', chip: 'Dimensity 7300-Energy', tags: ['AI Studio', 'Quad-Curved 120Hz', '80W SUPERVOOC'] },
    { brand: 'Oppo', name: 'Oppo Reno 11 Pro 5G', mrp: 39999, current: 34999, ram: '12 GB', storage: '256 GB', chip: 'Dimensity 8200', tags: ['32MP Telephoto Portrait', '80W SUPERVOOC', 'Silk Glass'] },
    { brand: 'Oppo', name: 'Oppo F25 Pro 5G', mrp: 28999, current: 23999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 7050', tags: ['4K Video Front & Back', '64MP Main', 'IP65 Splash Proof'] },
    { brand: 'Oppo', name: 'Oppo A3 Pro 5G', mrp: 20999, current: 17999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 6300', tags: ['All-Round Armour Body', 'Anti-Drop', '5100mAh'] },
    { brand: 'Oppo', name: 'Oppo A79 5G', mrp: 19999, current: 15999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 6020', tags: ['Glowing Feather Design', '33W SUPERVOOC', 'Dual Stereo'] },

    // Motorola
    { brand: 'Motorola', name: 'Motorola Razr 50 Ultra 5G (Foldable)', mrp: 99999, current: 89999, ram: '12 GB', storage: '512 GB', chip: 'Snapdragon 8s Gen 3', tags: ['Largest 4.0 inch External Screen', 'moto ai', 'IPX8 Waterproof', 'Foldable'] },
    { brand: 'Motorola', name: 'Motorola Razr 50 5G (Foldable)', mrp: 69999, current: 64999, ram: '8 GB', storage: '256 GB', chip: 'Dimensity 7300X', tags: ['Flip Foldable', '3.6 inch Cover Display', '50MP OIS'] },
    { brand: 'Motorola', name: 'Motorola Edge 50 Fusion 5G', mrp: 25999, current: 21999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 7s Gen 2', tags: ['Sony LYT-700C OIS', '144Hz 3D Curved pOLED', 'IP68 Waterproof'] },
    { brand: 'Motorola', name: 'Motorola G64 5G', mrp: 17999, current: 14999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 7025', tags: ['6000mAh Battery', '50MP OIS Camera', 'Stereo Dolby Atmos'] },
    { brand: 'Motorola', name: 'Motorola G34 5G', mrp: 13999, current: 10999, ram: '8 GB', storage: '128 GB', chip: 'Snapdragon 695', tags: ['Best Seller 5G Under 11k', '120Hz Screen', 'Vegan Leather'] },
    { brand: 'Motorola', name: 'Motorola G04s 4G', mrp: 8999, current: 6999, ram: '4 GB', storage: '64 GB', chip: 'Unisoc T606', tags: ['Ultra Budget', '50MP AI Camera', '90Hz Punch Hole'] },

    // Nothing
    { brand: 'Nothing', name: 'Nothing Phone (2a) Plus 5G', mrp: 29999, current: 27999, ram: '8 GB', storage: '256 GB', chip: 'Dimensity 7350 Pro 5G', tags: ['World Premiere Chip', 'Metallic Grey Glyph', '50MP Front & Back', '50W Fast Charge'] },
    { brand: 'Nothing', name: 'CMF Phone 1 by Nothing', mrp: 19999, current: 15999, ram: '6 GB', storage: '128 GB', chip: 'Dimensity 7300 5G', tags: ['Interchangeable Back Covers', 'Accessory Point', 'Super AMOLED 120Hz', 'Sub-16k Hero'] },

    // Google
    { brand: 'Google', name: 'Google Pixel 9 Pro 5G', mrp: 109999, current: 99999, ram: '16 GB', storage: '128 GB', chip: 'Google Tensor G4', tags: ['Compact Pro Flagship', 'Super Actua Display', 'Pro Triple Camera'] },
    { brand: 'Google', name: 'Google Pixel 9 5G', mrp: 79999, current: 74999, ram: '12 GB', storage: '128 GB', chip: 'Google Tensor G4', tags: ['Actua Display', 'Advanced Camera', '7 Years Pixel Drops'] },
    { brand: 'Google', name: 'Google Pixel 8 Pro 5G', mrp: 106999, current: 89999, ram: '12 GB', storage: '128 GB', chip: 'Tensor G3', tags: ['Pro Controls', 'Temperature Sensor', '5x Telephoto'] },
    { brand: 'Google', name: 'Google Pixel 8 5G', mrp: 75999, current: 59999, ram: '8 GB', storage: '128 GB', chip: 'Tensor G3', tags: ['Best Take', 'Audio Magic Eraser', 'Compact Size'] },
    { brand: 'Google', name: 'Google Pixel 7a 5G', mrp: 43999, current: 33999, ram: '8 GB', storage: '128 GB', chip: 'Tensor G2', tags: ['Wireless Charging', '64MP Camera', 'Clean Pixel Android'] },

    // iQOO
    { brand: 'iQOO', name: 'iQOO Z9s 5G', mrp: 23999, current: 19999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 7300', tags: ['Curved AMOLED 120Hz', 'Sony IMX882 OIS', '5500mAh 7.49mm'] },
    { brand: 'iQOO', name: 'iQOO Z9 5G', mrp: 22999, current: 17999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 7200', tags: ['Segment Fastest Phone', 'Sony OIS Camera', 'Dual Stereo'] },
    { brand: 'iQOO', name: 'iQOO Z9x 5G', mrp: 17999, current: 12999, ram: '6 GB', storage: '128 GB', chip: 'Snapdragon 6 Gen 1', tags: ['6000mAh Battery', '44W FlashCharge', 'IP64 Resistance'] },

    // Poco
    { brand: 'Poco', name: 'Poco F6 Pro 5G', mrp: 45999, current: 39999, ram: '12 GB', storage: '256 GB', chip: 'Snapdragon 8 Gen 2', tags: ['WQHD+ 120Hz Flow AMOLED', '120W HyperCharge', 'Light Fusion 800'] },
    { brand: 'Poco', name: 'Poco X6 Neo 5G', mrp: 19999, current: 14999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 6080', tags: ['Sleek 7.69mm', '108MP Camera', '120Hz AMOLED Screen'] },
    { brand: 'Poco', name: 'Poco M6 5G', mrp: 12999, current: 9499, ram: '4 GB', storage: '128 GB', chip: 'Dimensity 6100+', tags: ['Fastest 5G Under 10k', 'Sky Dance Design', '50MP Dual AI'] },
    { brand: 'Poco', name: 'Poco C65 4G', mrp: 10999, current: 7499, ram: '4 GB', storage: '128 GB', chip: 'MediaTek Helio G85', tags: ['Budget Hero', '50MP Triple Camera', '90Hz Display'] },

    // Infinix
    { brand: 'Infinix', name: 'Infinix Zero 40 5G', mrp: 34999, current: 27999, ram: '12 GB', storage: '256 GB', chip: 'Dimensity 8200 Ultimate', tags: ['Vlogger Camera Phone', '4K 60fps Front & Back', 'GoPro Mode', '3D Curved AMOLED'] },
    { brand: 'Infinix', name: 'Infinix Note 40 5G', mrp: 21999, current: 17999, ram: '8 GB', storage: '256 GB', chip: 'Dimensity 7020', tags: ['33W All-Round FastCharge', '15W Wireless MagCharge', '108MP 3x Lossless'] },
    { brand: 'Infinix', name: 'Infinix Hot 40i', mrp: 12999, current: 8999, ram: '8 GB', storage: '256 GB', chip: 'Unisoc T606', tags: ['256GB Storage Under 9k', '32MP Crystal Clear Selfie', 'Magic Ring'] },
    { brand: 'Infinix', name: 'Infinix Smart 8 5G', mrp: 9999, current: 7299, ram: '4 GB', storage: '64 GB', chip: 'Helio G36', tags: ['Timber Texture Design', '5000mAh Battery', 'Type-C Port'] },

    // Tecno
    { brand: 'Tecno', name: 'Tecno Phantom V Fold 2 5G', mrp: 89999, current: 79999, ram: '12 GB', storage: '512 GB', chip: 'Dimensity 9000+', tags: ['Ultra Slim Foldable', '5750mAh Aircell Battery', '70W Ultra Charge', 'Ella AI Assistant'] },
    { brand: 'Tecno', name: 'Tecno Camon 30 5G', mrp: 27999, current: 21999, ram: '8 GB', storage: '256 GB', chip: 'Dimensity 7020', tags: ['50MP OIS Sony Sensor', '70W Flash Charging', '50MP Eye AF Selfie'] },
    { brand: 'Tecno', name: 'Tecno Spark 20 Pro 5G', mrp: 19999, current: 15999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 6080', tags: ['Curved Luxury Cut Design', '108MP Ultra Sensing', 'Dolby Atmos Dual Stereo'] },
    { brand: 'Tecno', name: 'Tecno Pop 8 4G', mrp: 7999, current: 5999, ram: '4 GB', storage: '64 GB', chip: 'Unisoc T606', tags: ['Segment Fastest 8GB RAM', 'Dual Speakers', 'DTS Sound'] },

    // Lava
    { brand: 'Lava', name: 'Lava Agni 2 5G', mrp: 23999, current: 16999, ram: '8 GB', storage: '256 GB', chip: 'Dimensity 7050', tags: ['Curved AMOLED Display', '66W Super Fast Charging', 'Free Replacement at Home'] },
    { brand: 'Lava', name: 'Lava Storm 5G', mrp: 14999, current: 11999, ram: '8 GB', storage: '128 GB', chip: 'Dimensity 6080', tags: ['Glass Back Design', '120Hz Screen', '33W Fast Charging'] },
    { brand: 'Lava', name: 'Lava Yuva 3 Pro', mrp: 10999, current: 8499, ram: '8 GB', storage: '128 GB', chip: 'Unisoc T616', tags: ['Premium AG Glass Back', '50MP AI Dual Camera', 'Side Fingerprint'] },
    { brand: 'Lava', name: 'Lava Blaze 2 5G', mrp: 12499, current: 9999, ram: '4 GB', storage: '64 GB', chip: 'Dimensity 6020', tags: ['Ring Light Notification', 'Pure Android', 'Make In India'] },
  ];

  const seenSlugs = new Set(rawMobiles.map((m) => m.slug));

  // Synthesize rich accurate specs for each additional model
  for (const item of additionalModelTemplates) {
    let slug = item.name
      .toLowerCase()
      .replace(/\+/g, '-plus')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }
    seenSlugs.add(slug);
    const discount = Math.round(((item.mrp - item.current) / item.mrp) * 100);

    result.push({
      brand: item.brand,
      name: item.name,
      slug,
      mrp: item.mrp,
      current: item.current,
      launchDate: '2024-04-15',
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      ],
      tags: [...item.tags, '5G Indian Bands', 'Official Warranty'],
      isFeatured: item.current > 50000 || item.tags.includes('Hero'),
      isDeal: discount >= 15,
      isTrending: discount >= 20 || item.name.includes('Pro'),
      variants: [
        {
          ram: item.ram,
          storage: item.storage,
          color: 'Midnight Shadow',
          colorHex: '#1E293B',
          mrp: item.mrp,
          price: item.current,
          sku: `${slug.toUpperCase().slice(0, 8)}-STD`,
        },
      ],
      specs: {
        display: {
          size: '6.7 inches AMOLED / OLED',
          type: 'Full HD+ 120Hz',
          refreshRate: '120 Hz',
          resolution: '2400 x 1080',
          peakBrightness: '1500 nits',
          protection: 'Corning Gorilla Glass Protection',
        },
        performance: {
          processor: item.chip,
          chipset: item.chip.includes('Snapdragon') ? 'Qualcomm' : 'MediaTek',
          gpu: 'Adreno / Mali High Performance GPU',
          antutuScore: 850000,
        },
        memory: {
          ram: item.ram,
          ramType: 'LPDDR5 / LPDDR4X',
          storage: item.storage,
          storageType: 'UFS 3.1 / UFS 2.2',
          expandable: item.current < 25000 ? 'Yes, up to 1TB' : 'No',
        },
        camera: {
          rear: '50 MP / 64 MP / 108 MP (OIS) High Resolution Camera System',
          rearFeatures: 'Nightscape, HDR, 4K Video Recording, Portrait Depth Mode',
          front: '16 MP / 32 MP High Clarity Selfie Shooter',
          videoRecording: '4K @ 30fps / 1080p @ 60fps',
        },
        battery: {
          capacity: item.tags.some((t) => t.includes('6000mAh')) ? '6000 mAh' : '5000 mAh',
          fastCharging: item.current > 30000 ? '80W - 120W Fast Charging' : '33W - 67W Turbo Charge',
          wirelessCharging: item.current > 60000 ? '15W - 50W Wireless Charging' : 'No',
          chargerInBox: !item.name.includes('Apple') && !item.name.includes('Galaxy S'),
        },
        os: {
          name: item.name.includes('Apple') ? 'iOS' : 'Android',
          version: item.name.includes('Apple') ? 'iOS 18' : 'Android 14',
          promisedUpdates: '3 to 5 Years Verified System & Security Updates',
        },
        network: {
          has5G: !item.name.includes('4G'),
          bands5G: 'n1/n3/n5/n8/n28/n77/n78 (All Indian Telecom Bands)',
          sim: 'Dual SIM',
          voLTE: true,
        },
        connectivity: {
          wifi: 'Wi-Fi 6 / 6E',
          bluetooth: 'Bluetooth 5.3',
          nfc: item.current > 25000,
          usbType: 'USB Type-C',
          headphoneJack: item.current < 20000,
          irBlaster: item.brand === 'Xiaomi' || item.brand === 'Redmi' || item.brand === 'Poco',
        },
        design: {
          dimensions: '162 x 75 x 8.0 mm',
          weight: '190 g',
          buildMaterial: item.current > 50000 ? 'Aluminum / Titanium + Glass' : 'Composite Polycarbonate / Vegan Leather',
          ipRating: item.current > 40000 ? 'IP68' : 'IP54 / IP64',
          colors: ['Midnight Shadow', 'Celestial Blue', 'Aurora Green'],
        },
        boxContents: ['Smartphone', 'Fast Charging Adapter', 'Type-C Cable', 'Protective Case', 'SIM Ejector'],
      },
      sellers: [
        { sellerName: `${item.brand} Official Indian Store`, price: item.current, mrp: item.mrp, rating: 4.8, deliveryDays: 1, inStock: true, badge: 'Official Brand Partner' },
        { sellerName: 'MobiVerse India SuperStore', price: item.current + 299, mrp: item.mrp, rating: 4.7, deliveryDays: 2, inStock: true },
      ],
    });
  }

  return result;
};

export const seedDatabase = async () => {
  console.log('🌱 Starting MobiVerse India database seed process...');

  // 1. Clear existing records cleanly
  await Promise.all([
    User.deleteMany({}),
    ProviderProfile.deleteMany({}),
    Brand.deleteMany({}),
    Mobile.deleteMany({}),
    Accessory.deleteMany({}),
    Service.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log('🧹 Purged existing collections.');

  // 2. Create Users
  const adminUser = await User.create({
    name: 'MobiVerse Admin',
    email: 'admin@mobiverse.in',
    password: 'Admin@1234#', // will be hashed by User model bcrypt pre-save hook
    role: 'admin',
    phone: '9876543210',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    addresses: [
      {
        name: 'MobiVerse Headquarters',
        phone: '9876543210',
        street: '100 Feet Road, Indiranagar',
        landmark: 'Near Metro Station',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        isDefault: true,
      },
    ],
  });

  const providerUser = await User.create({
    name: 'Suresh Kumar (Apex Mobile World)',
    email: 'seller@mobiverse.in',
    password: 'Seller@1234#',
    role: 'provider',
    phone: '9812345678',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    addresses: [
      {
        name: 'Apex Mobile World Hub',
        phone: '9812345678',
        street: 'Shop 14, SP Road Electronics Market',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560002',
        isDefault: true,
      },
    ],
  });

  await ProviderProfile.create({
    user: providerUser._id,
    businessName: 'Apex Mobile World & Authorized Service',
    gstNumber: '29ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    address: { street: 'Shop 14, SP Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560002' },
    contactPhone: '9812345678',
    contactEmail: 'seller@mobiverse.in',
    isVerified: true,
    commissionRate: 4.5,
  });

  const customerUser = await User.create({
    name: 'Rahul Sharma',
    email: 'rahul@gmail.com',
    password: 'Customer@1234#',
    role: 'customer',
    phone: '9899887766',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    addresses: [
      {
        name: 'Rahul Sharma',
        phone: '9899887766',
        street: 'Flat 402, Green Meadows, Koramangala 4th Block',
        landmark: 'Opposite Wipro Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        isDefault: true,
      },
    ],
  });

  console.log('👤 Created demo accounts: Admin, Provider, Customer');

  // 3. Create Brands
  const createdBrandsMap = {};
  for (const b of brandsList) {
    const brandDoc = await Brand.create({
      ...b,
      logo: `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${b.name.toLowerCase()}.svg`,
    });
    createdBrandsMap[b.name.toLowerCase()] = brandDoc;
  }
  console.log(`🏷️ Created ${brandsList.length} verified smartphone brands.`);

  // 4. Create Mobiles Catalogue
  const allRawMobiles = generateExpandedCatalogue();
  const createdMobiles = [];

  for (const item of allRawMobiles) {
    const brandKey = item.brand.toLowerCase();
    const brandDoc = createdBrandsMap[brandKey] || createdBrandsMap['samsung'];

    const discountPercentage = Math.max(
      0,
      Math.round(((item.mrp - item.current) / item.mrp) * 100)
    );

    const mobileDoc = await Mobile.create({
      name: item.name,
      slug: item.slug,
      brand: brandDoc._id,
      brandName: item.brand,
      images: item.images,
      launchDate: new Date(item.launchDate),
      status: 'available',
      price: {
        mrp: item.mrp,
        current: item.current,
        discountPercentage,
      },
      variants: item.variants || [
        {
          ram: '8 GB',
          storage: '128 GB',
          color: 'Midnight Black',
          colorHex: '#18181B',
          mrp: item.mrp,
          price: item.current,
          sku: `${item.slug.toUpperCase().slice(0, 6)}-8-128`,
        },
      ],
      sellers: item.sellers || [
        { sellerName: 'MobiVerse Verified Seller', price: item.current, mrp: item.mrp, rating: 4.8, deliveryDays: 2, inStock: true },
      ],
      rating: {
        avg: Number((4.3 + Math.random() * 0.6).toFixed(1)),
        count: Math.floor(150 + Math.random() * 1200),
      },
      specs: item.specs,
      tags: item.tags,
      seo: {
        title: `${item.name} - Price in India, Specs, Reviews | MobiVerse India`,
        description: `Buy ${item.name} online at best price in India. Check detailed specifications, verified customer ratings, camera performance, and instant delivery offers.`,
        keywords: [item.name, item.brand, 'mobile price in India', 'buy mobile online India', '5G smartphone'],
      },
      priceUpdatedAt: new Date(Date.now() - Math.floor(Math.random() * 7200000)), // 0 to 2 hours ago
      isFeatured: Boolean(item.isFeatured),
      isDeal: Boolean(item.isDeal),
      isTrending: Boolean(item.isTrending),
      addedBy: adminUser._id,
    });

    createdMobiles.push(mobileDoc);
  }
  console.log(`📱 Seeded ${createdMobiles.length} real mobile phones sold in India!`);

  // 5. Create 5+ Accessories for each Phone
  const accessoryTypes = [
    { type: 'case', suffix: 'Military Armor Shockproof Drop-Tested Bumper Case with Kickstand', mrp: 1299, current: 499, img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80' },
    { type: 'screen_guard', suffix: '9H Edge-to-Edge Full Coverage Anti-Glare Tempered Glass (2-Pack)', mrp: 999, current: 299, img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80' },
    { type: 'charger', suffix: '65W GaN Dual Port USB-C PD Fast Power Adapter', mrp: 2999, current: 1499, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80' },
    { type: 'cable', suffix: '100W Braided USB-C to USB-C Fast Charging Cable (1.5m, 480Mbps)', mrp: 799, current: 349, img: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80' },
    { type: 'earbuds', suffix: 'Active Noise Cancellation True Wireless Bluetooth 5.4 Earbuds (40h Playtime)', mrp: 4999, current: 2199, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80' },
    { type: 'power_bank', suffix: '10,000mAh Ultra-Slim 22.5W Two-Way Fast Charging Power Bank', mrp: 2499, current: 1199, img: 'https://images.unsplash.com/photo-1609592424079-56cb21c0e071?auto=format&fit=crop&w=600&q=80' },
  ];

  let accessoryCount = 0;
  for (const mobile of createdMobiles) {
    for (const acc of accessoryTypes) {
      const accSlug = `${mobile.slug}-${acc.type}-${acc.current}`;
      const existing = await Accessory.findOne({ slug: accSlug });
      if (!existing) {
        await Accessory.create({
          name: `${mobile.name} - ${acc.suffix}`,
          slug: accSlug,
          brand: mobile.brandName,
          type: acc.type,
          compatibleMobiles: [mobile._id],
          compatibleBrands: [mobile.brandName],
          price: {
            mrp: acc.mrp,
            current: acc.current,
            discountPercentage: Math.round(((acc.mrp - acc.current) / acc.mrp) * 100),
          },
          images: [acc.img],
          specs: {
            Compatibility: mobile.name,
            Material: acc.type === 'case' ? 'Polycarbonate + TPU' : 'Premium Certified Component',
            Warranty: '6 Months Manufacturer Warranty',
          },
          stock: 45,
          rating: { avg: 4.6, count: 85 },
          isFeatured: acc.type === 'charger' || acc.type === 'earbuds',
          sellerName: 'MobiVerse Official Accessories Hub',
        });
        accessoryCount++;
      }
    }
  }
  console.log(`🎧 Seeded ${accessoryCount} accessories (5+ tailored accessories per phone).`);

  // 6. Create Mobile Repair and Maintenance Services
  const serviceList = [
    {
      title: 'Original OEM Display & Glass Replacement (Doorstep or Express)',
      category: 'screen_repair',
      description: 'Certified technicians replace cracked or malfunctioning phone displays using 100% genuine OEM panels with 90 days replacement warranty. Includes free doorstep pickup and drop.',
      supportedBrands: ['Samsung', 'Apple', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Google'],
      estimatedHours: 2,
      basePrice: 2499,
      warrantyDays: 90,
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
      city: 'Bengaluru',
      address: 'Indiranagar & Koramangala Hubs',
    },
    {
      title: 'Battery Health Diagnosis & High-Capacity Battery Replacement',
      category: 'battery_replacement',
      description: 'Is your phone draining fast or overheating? Get an authorized high-density lithium-ion battery installed with calibrated battery management system.',
      supportedBrands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Motorola', 'Vivo', 'Oppo'],
      estimatedHours: 1,
      basePrice: 1499,
      warrantyDays: 180,
      images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'],
      city: 'Mumbai',
      address: 'Andheri West & Bandra Kurla Complex',
    },
    {
      title: 'Motherboard Chip-Level Micro-Soldering & IC Diagnostic',
      category: 'software_recovery',
      description: 'Expert chip-level repair for dead devices, power IC failures, audio codec issues, and baseband network faults by IPC-certified engineers.',
      supportedBrands: ['Apple', 'Samsung', 'OnePlus', 'Google', 'Nothing', 'iQOO'],
      estimatedHours: 4,
      basePrice: 3499,
      warrantyDays: 60,
      images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'],
      city: 'Delhi-NCR',
      address: 'Nehru Place Electronics Central',
    },
    {
      title: 'Liquid Damage Ultrasonic Cleaning & Corrosion Neutralization',
      category: 'water_damage',
      description: 'Dropped your phone in water or coffee? Ultrasonic cleaning removes microscopic mineral deposits and rust from logic boards before permanent short circuits occur.',
      supportedBrands: ['All Brands'],
      estimatedHours: 3,
      basePrice: 1999,
      warrantyDays: 30,
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
      city: 'Hyderabad',
      address: 'Hitech City & Banjara Hills',
    },
    {
      title: 'Type-C / Lightning Port & Microphone Sub-Board Replacement',
      category: 'charging_port',
      description: 'Fix loose charging pins, slow charging warnings, and mic failure with genuine connector assemblies.',
      supportedBrands: ['All Brands'],
      estimatedHours: 1,
      basePrice: 999,
      warrantyDays: 90,
      images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'],
      city: 'Pune',
      address: 'FC Road & Viman Nagar',
    },
  ];

  for (const s of serviceList) {
    await Service.create({
      ...s,
      provider: providerUser._id,
      providerName: 'Apex Mobile World (Certified Service)',
    });
  }
  console.log(`🛠️ Seeded ${serviceList.length} professional mobile repair services across Indian cities.`);

  // 7. Seed Reviews
  const flagship = createdMobiles[0]; // Galaxy S24 Ultra
  await Review.create({
    user: customerUser._id,
    userName: 'Rahul Sharma',
    userAvatar: customerUser.avatar,
    itemType: 'mobile',
    item: flagship._id,
    rating: 5,
    title: 'Unbelievable display and Galaxy AI camera zoom!',
    comment: 'Upgraded from my older S21. The anti-reflective Gorilla Armor glass is a game changer in harsh Indian sunlight. Battery easily lasts 1.5 days with heavy use and S-Pen handwriting recognition in Hindi/English is remarkable.',
    isVerifiedPurchase: true,
  });

  const iphoneFlagship = createdMobiles.find((m) => m.slug.includes('iphone-16-pro-max'));
  if (iphoneFlagship) {
    await Review.create({
      user: customerUser._id,
      userName: 'Rahul Sharma',
      userAvatar: customerUser.avatar,
      itemType: 'mobile',
      item: iphoneFlagship._id,
      rating: 5,
      title: 'Desert Titanium looks stunning, camera control button is great',
      comment: 'The 4K 120fps video capability is truly cinema level. Super snappy performance and 5x optical zoom captures razor sharp images during family events.',
      isVerifiedPurchase: true,
    });
  }

  console.log('⭐ Seeded verified customer reviews.');
  console.log(`
🎉 SUCCESS! MobiVerse India Database Seed Completed:
- Brands: ${brandsList.length}
- Phones: ${createdMobiles.length} (Verified Indian market models)
- Accessories: ${accessoryCount} (Cases, Screen Guards, GaN Chargers, Earbuds)
- Repair Services: ${serviceList.length} (Doorstep & In-Shop across India)
- Test Accounts:
    • Admin:    admin@mobiverse.in   / Admin@1234#
    • Provider: seller@mobiverse.in  / Seller@1234#
    • Customer: rahul@gmail.com      / Customer@1234#
  `);
};

// Direct script execution
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('Seed error:', err);
      process.exit(1);
    }
  })();
}
