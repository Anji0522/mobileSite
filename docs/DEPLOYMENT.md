# MobiVerse India — Production Deployment Guide

This guide details the step-by-step procedure to deploy MobiVerse India across free and standard cloud infrastructure:
- **Database**: MongoDB Atlas (Free M0 or dedicated cluster)
- **Backend API**: Render.com (Web Service) or Railway
- **Frontend SPA**: GitHub Pages, Vercel, or Netlify
- **Payment Gateway**: Razorpay (Test or Production Mode)

---

## 1. Database Provisioning (MongoDB Atlas)

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create an **M0 Free Tier** cluster (choose AWS `ap-south-1` Mumbai region for optimal latency across India).
3. Under **Security > Database Access**:
   - Add a new database user (e.g. `mobiverse_admin`) with password authentication.
4. Under **Security > Network Access**:
   - Add IP Access List entry: `0.0.0.0/0` (Allow access from anywhere) to allow connection from hosting providers like Render.
5. Under **Deployment > Database**:
   - Click **Connect** > **Drivers** > Copy the connection string.
   - Example:
     ```env
     MONGODB_URI=mongodb+srv://mobiverse_admin:<PASSWORD>@cluster0.abcde.mongodb.net/mobiverse?retryWrites=true&w=majority
     ```

---

## 2. Backend Deployment (Render.com)

1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New + > Web Service**.
3. Select your `mobileSite` GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `mobiverse-india-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations & logs |
   | `PORT` | `10000` | Port automatically assigned by Render |
   | `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
   | `JWT_ACCESS_SECRET` | *Strong 64-char random hex* | Signs short-lived access tokens |
   | `JWT_REFRESH_SECRET` | *Strong 64-char random hex* | Signs refresh cookies |
   | `CLIENT_URL` | `https://<your-username>.github.io` | Frontend domain for CORS |
   | `COOKIE_SECURE` | `true` | Restricts cookies to HTTPS only |
   | `COOKIE_SAME_SITE` | `none` | Cross-site cookie support between Render & GitHub Pages |
   | `RAZORPAY_KEY_ID` | `rzp_test_...` or `rzp_live_...` | Razorpay Merchant API key |
   | `RAZORPAY_KEY_SECRET`| *Razorpay API secret* | Razorpay HMAC secret |
   | `RAZORPAY_WEBHOOK_SECRET` | *Custom webhook secret* | Validates payment webhook callbacks |
   | `PRICE_SYNC_ADAPTER` | `mock` | Default adapter (`mock`, `provider`, `csv`) |
6. Click **Create Web Service**.
7. Once deployed, run the one-time catalog seed:
   - In Render dashboard, open the **Shell** tab and run:
     ```bash
     npm run seed
     ```
   - This seeds 116 Indian phones, 696 accessories, repair services, and initial demo accounts.

---

## 3. Frontend Deployment (GitHub Pages)

### Option A: Automatic Deployment with GitHub Actions
1. In `client/vite.config.js`, configure `base` if hosting in a subpath:
   ```javascript
   export default defineConfig({
     base: '/mobileSite/', // Replace with repository name
     plugins: [react()],
   });
   ```
2. In your GitHub repository settings:
   - Navigate to **Settings > Pages**.
   - Under **Build and deployment > Source**, select **GitHub Actions**.
3. Create `.github/workflows/deploy-client.yml`:
   ```yaml
   name: Deploy Frontend to GitHub Pages

   on:
     push:
       branches: [ main ]

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: 'npm'
             cache-dependency-path: 'client/package-lock.json'
         - name: Install & Build
           working-directory: ./client
           env:
             VITE_API_URL: https://mobiverse-india-api.onrender.com/api/v1
           run: |
             npm ci
             npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: ./client/dist
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

### Option B: Deploying to Vercel or Netlify (Zero Configuration)
- Import the repo into Vercel or Netlify.
- Set **Root Directory** to `client`.
- Add environment variable `VITE_API_URL=https://mobiverse-india-api.onrender.com/api/v1`.
- Deploy!

---

## 4. Razorpay Webhook Configuration

1. In the [Razorpay Dashboard](https://dashboard.razorpay.com), go to **Settings > Webhooks**.
2. Click **Add New Webhook**.
3. Set **Webhook URL** to:
   ```
   https://mobiverse-india-api.onrender.com/api/v1/payments/webhook
   ```
4. Enter the same Secret defined in `RAZORPAY_WEBHOOK_SECRET`.
5. Select active events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.processed`
6. Click **Save Webhook**.

---

## 5. Production Smoke Testing Checklist

- [ ] `/api/v1/health` returns `{ "status": "UP" }`.
- [ ] Storefront loads featured phones and accessories on the home page.
- [ ] User can register a new account with a valid 10-digit Indian phone number (`9876543210`).
- [ ] Adding a phone variant to cart computes 18% GST and free shipping threshold (> ₹999).
- [ ] Initiating Razorpay payment launches the modal overlay and generates an order ID.
- [ ] Doorstep repair booking confirms appointment in selected Indian city.
- [ ] Logging in as `admin@mobiverse.in` displays the metrics and price-sync trigger buttons.
