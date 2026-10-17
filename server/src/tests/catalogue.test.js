import request from 'supertest';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import { Mobile } from '../models/Mobile.js';
import { Accessory } from '../models/Accessory.js';
import { Brand } from '../models/Brand.js';

describe('Catalogue Endpoints (Mobiles & Accessories)', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.FORCE_MEMORY_DB = 'true';
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await Mobile.deleteMany({});
    await Accessory.deleteMany({});
    await Brand.deleteMany({});

    // Seed mock brands
    const samsungBrand = await Brand.create({ name: 'Samsung', slug: 'samsung', country: 'South Korea' });
    const appleBrand = await Brand.create({ name: 'Apple', slug: 'apple', country: 'USA' });
    await Brand.create({ name: 'OnePlus', slug: 'oneplus', country: 'China' });

    // Seed sample mobiles
    await Mobile.create([
      {
        brand: samsungBrand._id,
        brandName: 'Samsung',
        name: 'Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        status: 'available',
        approvalStatus: 'approved',
        price: {
          mrp: 134999,
          current: 129999,
          discountPercentage: 4
        },
        variants: [
          { sku: 'S24U-12-256-BLK', ram: '12GB', storage: '256GB', color: 'Titanium Black', mrp: 134999, price: 129999, stock: 15 }
        ],
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80']
      },
      {
        brand: appleBrand._id,
        brandName: 'Apple',
        name: 'iPhone 15 Pro',
        slug: 'apple-iphone-15-pro',
        status: 'available',
        approvalStatus: 'approved',
        price: {
          mrp: 134900,
          current: 127999,
          discountPercentage: 5
        },
        variants: [
          { sku: 'IP15P-8-128-NAT', ram: '8GB', storage: '128GB', color: 'Natural Titanium', mrp: 134900, price: 127999, stock: 10 }
        ],
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80']
      }
    ]);

    // Seed sample accessories
    await Accessory.create([
      {
        name: 'Samsung 45W Power Adapter',
        slug: 'samsung-45w-power-adapter',
        brand: 'Samsung',
        type: 'charger',
        price: {
          mrp: 3999,
          current: 3499,
          discountPercentage: 12
        },
        stock: 40,
        images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80']
      }
    ]);
  });

  it('should list all available mobiles with pagination', async () => {
    const res = await request(app).get('/api/v1/mobiles');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('should filter mobiles by brand', async () => {
    const res = await request(app).get('/api/v1/mobiles?brand=Samsung');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].brandName).toBe('Samsung');
  });

  it('should get mobile details by slug', async () => {
    const res = await request(app).get('/api/v1/mobiles/samsung-galaxy-s24-ultra');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mobile.name).toBe('Galaxy S24 Ultra');
  });

  it('should return 404 for non-existent mobile slug', async () => {
    const res = await request(app).get('/api/v1/mobiles/non-existent-phone');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should compare two mobiles side-by-side', async () => {
    const res = await request(app).get(
      '/api/v1/mobiles/compare?slugs=samsung-galaxy-s24-ultra,apple-iphone-15-pro'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('should list accessories and filter by type', async () => {
    const res = await request(app).get('/api/v1/accessories?type=charger');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].type).toBe('charger');
  });
});
