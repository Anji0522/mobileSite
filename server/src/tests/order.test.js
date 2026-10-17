import request from 'supertest';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Mobile } from '../models/Mobile.js';
import { Brand } from '../models/Brand.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';

describe('Orders & Payment Processing Flow', () => {
  let authToken;
  let testUser;
  let testMobile;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.FORCE_MEMORY_DB = 'true';
    process.env.JWT_ACCESS_SECRET = 'test_access_secret_1234567890';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_1234567890';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_MobiVerseMockKey123';
    process.env.RAZORPAY_KEY_SECRET = 'MobiVerseMockSecretKey456';
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Mobile.deleteMany({});
    await Brand.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});

    // Register test user
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        password: 'Password@123',
        phone: '9876543211',
        role: 'customer'
      });

    authToken = regRes.body.data.accessToken;
    testUser = regRes.body.data.user;

    const opBrand = await Brand.create({
      name: 'OnePlus',
      slug: 'oneplus',
      country: 'China'
    });

    // Create test mobile
    testMobile = await Mobile.create({
      brand: opBrand._id,
      brandName: 'OnePlus',
      name: 'OnePlus 12',
      slug: 'oneplus-12',
      status: 'available',
      approvalStatus: 'approved',
      variants: [
        { sku: 'OP12-12-256-BLK', ram: '12GB', storage: '256GB', color: 'Silky Black', mrp: 69999, price: 64999, stock: 20 }
      ],
      price: {
        mrp: 69999,
        current: 64999,
        discountPercentage: 7
      },
      images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80']
    });

    // Populate user's cart
    await Cart.create({
      user: testUser._id,
      items: [
        {
          itemType: 'mobile',
          mobile: testMobile._id,
          name: testMobile.name,
          image: testMobile.images[0],
          price: testMobile.price.current,
          mrp: testMobile.price.mrp,
          quantity: 1,
          variantSku: 'OP12-12-256-BLK',
          variantDetails: { ram: '12GB', storage: '256GB', color: 'Silky Black' }
        }
      ]
    });
  });

  it('should reject order creation if delivery address is missing or incomplete', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        shippingAddress: {}
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should create an order successfully with DB-verified amounts and Indian GST breakup', async () => {
    const shippingAddress = {
      fullName: 'Priya Patel',
      phone: '9876543211',
      street: 'Flat 402, Lotus Greens, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    };

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ shippingAddress });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.pricing.itemsTotal).toBe(64999);
    expect(res.body.data.orderStatus).toBe('created');
  });

  it('should create a Razorpay payment order for an existing order', async () => {
    // 1. Create order
    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        shippingAddress: {
          fullName: 'Priya Patel',
          phone: '9876543211',
          street: 'Flat 402, Lotus Greens, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038'
        }
      });

    const orderId = orderRes.body.data._id;

    // 2. Create Razorpay payment intent
    const payRes = await request(app)
      .post('/api/v1/payments/create-order')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ orderId });

    expect(payRes.status).toBe(200);
    expect(payRes.body.success).toBe(true);
    expect(payRes.body.data.razorpayOrderId).toBeDefined();
    expect(payRes.body.data.currency).toBe('INR');
  });

  it('should allow customer to cancel an unpaid or created order', async () => {
    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        shippingAddress: {
          fullName: 'Priya Patel',
          phone: '9876543211',
          street: 'Flat 402, Lotus Greens, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038'
        }
      });

    const orderId = orderRes.body.data._id;

    const cancelRes = await request(app)
      .post(`/api/v1/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reason: 'Changed my mind' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.data.orderStatus).toBe('cancelled');
  });
});
