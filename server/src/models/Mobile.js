import mongoose from 'mongoose';

const VariantSchema = new mongoose.Schema({
  ram: { type: String, required: true },
  storage: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: { type: String, default: '#333333' },
  mrp: { type: Number, required: true },
  price: { type: Number, required: true },
  sku: { type: String, required: true },
  stock: { type: Number, default: 25 },
  image: { type: String, default: '' },
});

const SellerOfferingSchema = new mongoose.Schema({
  sellerName: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  deliveryDays: { type: Number, default: 2 },
  inStock: { type: Boolean, default: true },
  link: { type: String, default: '#' },
  badge: { type: String, default: 'Authorized Seller' },
});

const MobileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Mobile name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    images: {
      type: [String],
      validate: [(val) => val.length > 0, 'At least one image is required'],
    },
    launchDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['available', 'upcoming', 'discontinued', 'pending_review'],
      default: 'available',
      index: true,
    },
    price: {
      mrp: { type: Number, required: true },
      current: { type: Number, required: true },
      discountPercentage: { type: Number, default: 0 },
    },
    variants: [VariantSchema],
    sellers: [SellerOfferingSchema],
    rating: {
      avg: { type: Number, default: 4.5, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    specs: {
      display: {
        size: { type: String, default: '6.7 inches' },
        type: { type: String, default: 'AMOLED' },
        refreshRate: { type: String, default: '120 Hz' },
        resolution: { type: String, default: '1080 x 2400 pixels (FHD+)' },
        peakBrightness: { type: String, default: '1500 nits' },
        protection: { type: String, default: 'Corning Gorilla Glass Victus 2' },
      },
      performance: {
        processor: { type: String, default: 'Snapdragon 8 Gen 3' },
        chipset: { type: String, default: 'Qualcomm / MediaTek' },
        gpu: { type: String, default: 'Adreno 750' },
        antutuScore: { type: Number, default: 1500000 },
      },
      memory: {
        ram: { type: String, default: '12 GB' },
        ramType: { type: String, default: 'LPDDR5X' },
        storage: { type: String, default: '256 GB' },
        storageType: { type: String, default: 'UFS 4.0' },
        expandable: { type: String, default: 'No' },
      },
      camera: {
        rear: { type: String, default: '50 MP + 50 MP + 12 MP OIS' },
        rearFeatures: { type: String, default: 'HDR, 8K Video, 5x Optical Zoom, Nightography' },
        front: { type: String, default: '32 MP Auto-Focus' },
        videoRecording: { type: String, default: '4K @ 60fps, 8K @ 30fps' },
      },
      battery: {
        capacity: { type: String, default: '5000 mAh' },
        fastCharging: { type: String, default: '80W SuperVOOC / FlashCharge' },
        wirelessCharging: { type: String, default: '15W Qi Wireless' },
        chargerInBox: { type: Boolean, default: true },
      },
      os: {
        name: { type: String, default: 'Android' },
        version: { type: String, default: 'Android 14' },
        promisedUpdates: { type: String, default: '4 Years OS + 5 Years Security' },
      },
      network: {
        has5G: { type: Boolean, default: true },
        bands5G: { type: String, default: 'n1/n3/n5/n8/n28/n77/n78 (All Indian Bands)' },
        sim: { type: String, default: 'Dual Nano-SIM + eSIM' },
        voLTE: { type: Boolean, default: true },
      },
      connectivity: {
        wifi: { type: String, default: 'Wi-Fi 7 (802.11be)' },
        bluetooth: { type: String, default: 'Bluetooth 5.4' },
        nfc: { type: Boolean, default: true },
        usbType: { type: String, default: 'USB Type-C 3.2 Gen 1' },
        headphoneJack: { type: Boolean, default: false },
        irBlaster: { type: Boolean, default: false },
      },
      design: {
        dimensions: { type: String, default: '162.3 x 75.1 x 8.2 mm' },
        weight: { type: String, default: '198 g' },
        buildMaterial: { type: String, default: 'Titanium / Aluminium frame + Glass back' },
        ipRating: { type: String, default: 'IP68 water and dust resistant' },
        colors: [String],
      },
      sensors: [String],
      warranty: { type: String, default: '1 Year Manufacturer Warranty for Phone and 6 Months for Box Accessories' },
      boxContents: [String],
    },
    tags: [String],
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      keywords: [String],
    },
    priceUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeal: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    source: {
      type: String,
      default: 'official_feed',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes
MobileSchema.index({ name: 'text', brandName: 'text', tags: 'text' });
MobileSchema.index({ brandName: 1, 'price.current': 1 });
MobileSchema.index({ 'price.current': 1, status: 1 });
MobileSchema.index({ 'rating.avg': -1 });

export const Mobile = mongoose.model('Mobile', MobileSchema);
