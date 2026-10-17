# MobiVerse India — REST API Documentation

All API routes are served under the versioned base path: `/api/v1`
Responses follow a predictable, standardized envelope:

**Success Response Envelope**:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "meta": { "total": 116, "page": 1, "limit": 12, "totalPages": 10 }
}
```

**Error Response Envelope**:
```json
{
  "success": false,
  "message": "Detailed error message",
  "errors": [
    { "field": "phone", "message": "Valid 10-digit Indian phone number required" }
  ]
}
```

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### `POST /auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "password": "Password@123",
    "phone": "9876543210",
    "role": "customer"
  }
  ```
- **Status Codes**: `201 Created`, `409 Conflict`, `422 Unprocessable Entity`

### `POST /auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "aarav@example.com",
    "password": "Password@123"
  }
  ```
- **Response**: Returns `{ user, accessToken }` and sets `mv_token` and `mv_refreshToken` httpOnly cookies.
- **Status Codes**: `200 OK`, `401 Unauthorized`, `422 Unprocessable Entity`

### `POST /auth/logout`
- **Access**: Authenticated
- **Response**: Clears authentication cookies and invalidates refresh tokens.
- **Status Codes**: `200 OK`

### `POST /auth/refresh`
- **Access**: Public (Cookie-based)
- **Response**: Issues new short-lived access token from valid refresh token.
- **Status Codes**: `200 OK`, `401 Unauthorized`

### `GET /auth/me`
- **Access**: Authenticated (`customer`, `provider`, `admin`)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: Current authenticated user profile with addresses.
- **Status Codes**: `200 OK`, `401 Unauthorized`

### `PUT /auth/me`
- **Access**: Authenticated
- **Body**: `{ "name": "...", "phone": "..." }`
- **Status Codes**: `200 OK`, `400 Bad Request`

### `POST /auth/forgot-password`
- **Access**: Public
- **Body**: `{ "email": "aarav@example.com" }`
- **Status Codes**: `200 OK`

### `POST /auth/reset-password/:token`
- **Access**: Public
- **Body**: `{ "password": "NewPassword@123" }`
- **Status Codes**: `200 OK`, `400 Bad Request`

---

## 2. Mobile Catalogue Endpoints (`/api/v1/mobiles`)

### `GET /mobiles`
- **Access**: Public
- **Query Params**:
  - `q`: Search query string
  - `brand`: Brand name (e.g. `Samsung`, `Apple`, `OnePlus`)
  - `minPrice`, `maxPrice`: Numeric INR bounds
  - `ram`: RAM filter (e.g. `8GB`, `12GB`)
  - `storage`: Storage filter (e.g. `128GB`, `256GB`)
  - `has5G`: `true` or `false`
  - `minRating`: Minimum average rating (`1` to `5`)
  - `sort`: `price_asc`, `price_desc`, `rating_desc`, `newest`, `popular`
  - `page`: Page number (default `1`)
  - `limit`: Items per page (default `12`, max `50`)
- **Response**: Array of mobile models with pagination metadata in `meta`.
- **Status Codes**: `200 OK`

### `GET /mobiles/:slug`
- **Access**: Public
- **Response**: Single mobile document with full specifications, compatible accessories, similar models, and recent verified reviews.
- **Status Codes**: `200 OK`, `404 Not Found`

### `GET /mobiles/featured`
- **Access**: Public
- **Response**: Groups of deals, trending phones, and newly launched devices.
- **Status Codes**: `200 OK`

### `GET /mobiles/compare?slugs=slug1,slug2,slug3`
- **Access**: Public
- **Response**: Side-by-side array of phone documents matching given slugs.
- **Status Codes**: `200 OK`, `400 Bad Request`

### `POST /mobiles`
- **Access**: Protected (`provider`, `admin`)
- **Body**: Complete mobile schema. (Admin creations default to `available`; provider creations default to `pending_review`).
- **Status Codes**: `201 Created`, `403 Forbidden`

### `PUT /mobiles/:id`
- **Access**: Protected (`admin` or owner `provider`)
- **Status Codes**: `200 OK`, `403 Forbidden`, `404 Not Found`

---

## 3. Accessories Endpoints (`/api/v1/accessories`)

### `GET /accessories`
- **Access**: Public
- **Query Params**: `type`, `brand`, `mobileId`, `minPrice`, `maxPrice`, `page`, `limit`
- **Status Codes**: `200 OK`

### `GET /accessories/:slug`
- **Access**: Public
- **Status Codes**: `200 OK`, `404 Not Found`

---

## 4. Cart & Shopping Endpoints (`/api/v1/cart`)

### `GET /cart`
- **Access**: Authenticated (`customer`)
- **Response**: User's persisted cart with live pricing and computed totals.
- **Status Codes**: `200 OK`

### `POST /cart/items`
- **Access**: Authenticated (`customer`)
- **Body**:
  ```json
  {
    "itemType": "mobile",
    "mobileId": "64f1...",
    "variantSku": "S24U-12-256",
    "quantity": 1
  }
  ```
- **Status Codes**: `200 OK`, `400 Bad Request`

### `PUT /cart/items/:itemId`
- **Access**: Authenticated (`customer`)
- **Body**: `{ "quantity": 2 }`
- **Status Codes**: `200 OK`

### `DELETE /cart/items/:itemId`
- **Access**: Authenticated (`customer`)
- **Status Codes**: `200 OK`

### `POST /cart/apply-coupon`
- **Access**: Authenticated (`customer`)
- **Body**: `{ "couponCode": "MOBI10" }`
- **Status Codes**: `200 OK`, `400 Bad Request`

---

## 5. Orders & Payments Endpoints (`/api/v1/orders`, `/api/v1/payments`)

### `POST /orders`
- **Access**: Authenticated (`customer`)
- **Body**:
  ```json
  {
    "shippingAddress": {
      "fullName": "Priya Patel",
      "phone": "9876543211",
      "street": "Flat 402, Lotus Greens, Indiranagar",
      "city": "Bengaluru",
      "state": "Karnataka",
      "pincode": "560038"
    },
    "paymentMethod": "razorpay"
  }
  ```
- **Status Codes**: `201 Created`, `400 Bad Request`

### `GET /orders/my`
- **Access**: Authenticated (`customer`)
- **Status Codes**: `200 OK`

### `GET /orders/:id`
- **Access**: Authenticated (Owner or `admin`)
- **Status Codes**: `200 OK`, `403 Forbidden`, `404 Not Found`

### `POST /orders/:id/cancel`
- **Access**: Authenticated (Owner or `admin`)
- **Body**: `{ "reason": "Customer changed mind" }`
- **Status Codes**: `200 OK`, `400 Bad Request`

### `POST /payments/create-order`
- **Access**: Authenticated (`customer`)
- **Body**: `{ "orderId": "64f1..." }`
- **Response**: `{ "razorpayOrderId": "order_xxx", "amount": 6499900, "currency": "INR" }`
- **Status Codes**: `200 OK`, `400 Bad Request`

### `POST /payments/verify`
- **Access**: Authenticated (`customer`)
- **Body**:
  ```json
  {
    "orderId": "64f1...",
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_yyy",
    "razorpay_signature": "sha256_hmac_hex"
  }
  ```
- **Status Codes**: `200 OK`, `400 Bad Request`

### `POST /payments/webhook`
- **Access**: Public (Verified via `X-Razorpay-Signature` header)
- **Status Codes**: `200 OK`, `400 Bad Request`

---

## 6. Services & Doorstep Repair Endpoints (`/api/v1/services`)

### `GET /services`
- **Access**: Public
- **Query Params**: `city`, `category` (e.g. `Screen Replacement`, `Battery Swap`)
- **Status Codes**: `200 OK`

### `POST /services/book`
- **Access**: Authenticated (`customer`)
- **Body**:
  ```json
  {
    "serviceId": "64f1...",
    "mobileModel": "iPhone 13",
    "issueDescription": "Display glass shattered",
    "appointmentDate": "2026-10-25T10:00:00Z",
    "address": {
      "street": "12th Cross, Indiranagar",
      "city": "Bengaluru",
      "pincode": "560038"
    }
  }
  ```
- **Status Codes**: `201 Created`, `400 Bad Request`

---

## 7. Admin & Moderation Endpoints (`/api/v1/admin`)

- `GET /admin/dashboard`: Platform overview metrics (GMV, orders, active users, catalog counts).
- `GET /admin/users`: User management with role filtering and pagination.
- `PATCH /admin/users/:id`: Modify user roles or ban/activate accounts.
- `GET /admin/catalogue/pending`: Listings submitted by providers awaiting approval.
- `PATCH /admin/catalogue/:id/approve`: Approve or reject submitted listings.
- `POST /admin/price-sync/trigger`: On-demand execution of the price synchronization job.
- `GET /admin/price-sync/history`: Historical log of detected price fluctuations.
