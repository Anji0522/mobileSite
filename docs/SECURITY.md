# MobiVerse India — Security & Compliance Architecture

Security is central to MobiVerse India. The platform implements multi-layered defense-in-depth across the client, API gateway, authentication layer, and payment processing subsystems.

---

## 1. Payment Security & PCI-DSS Compliance

### 1.1 Strict Zero-Card-Data Mandate
In strict compliance with Reserve Bank of India (RBI) tokenization guidelines and PCI-DSS requirements:
- The server **NEVER** accepts, processes, logs, or stores sensitive payment credentials (credit/debit card numbers, CVVs, expiry dates, net banking passwords, or UPI PINs).
- All payment inputs are entered directly into Razorpay's PCI-DSS Level 1 hosted checkout modal.
- Only non-sensitive reference metadata is stored in the database:
  - `razorpayOrderId`
  - `razorpayPaymentId`
  - Transaction timestamp & status (`paid`, `pending`, `failed`)
  - Masked card identifiers (e.g. `**** **** **** 1234`), if supplied by the gateway callback.

### 1.2 Cryptographic HMAC Signature Verification
Every client-reported payment must be authenticated on the backend before an order status is marked `paid`:
```javascript
const body = razorpay_order_id + '|' + razorpay_payment_id;
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(body.toString())
  .digest('hex');

if (expectedSignature !== razorpay_signature) {
  throw new AppError('Payment signature verification failed. Possible tampering detected.', 400);
}
```

### 1.3 Double-Charge Prevention & Idempotency
- Payment capture endpoints and webhook listeners verify idempotency using the gateway transaction ID before updating order state. Duplicate webhook events are discarded harmlessly.
- Orders already marked `paid` immediately reject subsequent payment attempts.

---

## 2. Authentication & Authorization Security

### 2.1 Password Hashing & Complexity
- Passwords are encrypted using `bcryptjs` with a work factor (salt rounds) of `12`.
- Passwords must satisfy complexity requirements:
  - Minimum 8 characters
  - At least one uppercase letter (`[A-Z]`)
  - At least one lowercase letter (`[a-z]`)
  - At least one numeric digit (`[0-9]`)
  - At least one special symbol (`[@$!%*?&#^()_-]`)
- User password hashes are excluded by default in Mongoose queries (`select: false`).

### 2.2 Dual-Token Session Architecture
- **Access Tokens**: Short-lived (15 minutes), signed with `JWT_ACCESS_SECRET`. Transmitted in standard `Authorization: Bearer <token>` headers.
- **Refresh Tokens**: Long-lived (7 days), signed with `JWT_REFRESH_SECRET`. Stored exclusively in browser cookies configured with:
  - `httpOnly: true`: Inaccessible to malicious client-side JavaScript / XSS scripts.
  - `secure: true`: Transmitted only over encrypted HTTPS connections in production.
  - `sameSite: 'strict'` / `'lax'`: Mitigates Cross-Site Request Forgery (CSRF).

### 2.3 Role-Based Access Control (RBAC)
Endpoints are guarded by deterministic middleware:
- `protect`: Verifies token signature and checks if the user account is active.
- `restrictTo(...roles)`: Verifies role membership (`admin`, `provider`, `customer`). Unauthorized access attempts receive `403 Forbidden` and are logged.

---

## 3. Network & Application Defense

### 3.1 Security Headers (Helmet)
Express is configured with `helmet` to supply modern defense headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
- `Strict-Transport-Security` (forces HTTPS)
- `X-XSS-Protection: 0` (modern recommendation in favor of CSP)

### 3.2 Rate Limiting
Global API rate limiting is enforced via `express-rate-limit`:
- Maximum 300 requests per 15-minute window per IP.
- Payment, login, and registration endpoints have stricter thresholds to thwart credential stuffing and brute-force attacks.

### 3.3 NoSQL Injection & Sanitization
- `express-mongo-sanitize`: Strips dangerous characters (`$` and `.`) from request bodies, query strings, and params to prevent MongoDB operator injection attacks.
- `sanitize-html`: Sanitizes rich-text user reviews and contact messages to strip dangerous HTML tags and inline scripts.

### 3.4 Data Integrity & Scraping Policy
- MobiVerse strictly **does not scrape** websites that prohibit automated data collection.
- Price feeds and catalogue updates are ingested through authorized affiliate APIs, verified CSV imports, or provider-entered feeds via the extensible adapter interface.

---

## 4. Vulnerability Disclosure & Audit
To report security concerns or potential vulnerabilities, please contact the MobiVerse India Security Team at `security@mobiverse.in`.
