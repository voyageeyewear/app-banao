# 🚀 App-Banao Vercel Deployment Guide

## Overview
Deploy your App-Banao Shopify app to Vercel in minutes with this step-by-step guide.

## 🎯 **Quick Deploy (5 Minutes)**

### **Option 1: One-Click Deploy**
```bash
./deploy-vercel.sh
```

### **Option 2: Manual Deploy**
Follow the detailed steps below for complete control.

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Database Setup (Required)**

Your app needs a PostgreSQL database. Choose one of these options:

#### **Option A: Neon (Recommended - Free)**
1. Go to [neon.tech](https://neon.tech)
2. Create account & new project
3. Copy connection string
4. Format: `postgresql://username:password@hostname:port/database_name`

#### **Option B: PlanetScale**
1. Go to [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string from dashboard

#### **Option C: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Get PostgreSQL connection string

### **Step 2: Shopify App Setup**

1. **Get Shopify App Credentials**:
   - Go to [Shopify Partners Dashboard](https://partners.shopify.com)
   - Create/select your app
   - Note down API Key and API Secret

2. **Update App URLs** (Important!):
   - App URL: `https://your-app-name.vercel.app`
   - Allowed redirection URLs: `https://your-app-name.vercel.app/auth/callback`

### **Step 3: Vercel Deployment**

#### **3.1 Install Vercel CLI**
```bash
npm install -g vercel
```

#### **3.2 Login to Vercel**
```bash
vercel login
```

#### **3.3 Deploy**
```bash
# Build and deploy
npm run build
vercel --prod
```

#### **3.4 Set Environment Variables**
In Vercel Dashboard, add these environment variables:

```env
# Required Shopify App Credentials
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SCOPES=read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_themes,write_themes,read_content,write_content

# Database
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Session Storage
SESSION_SECRET=your_very_long_random_session_secret_here

# App Configuration
SHOPIFY_APP_URL=https://your-app-name.vercel.app
HOST=https://your-app-name.vercel.app

# Environment
NODE_ENV=production
```

### **Step 4: Database Migration**

Run database migrations:
```bash
# From your local machine
npx prisma migrate deploy --schema=prisma/schema.prisma
```

### **Step 5: Test Your App**

1. **Health Check**: Visit `https://your-app-name.vercel.app/health`
2. **App Function**: Install in a test store
3. **Builder**: Test drag-and-drop functionality
4. **PDP**: Test product detail page customization

---

## 🔧 **Vercel Configuration**

### **vercel.json** (Already Created)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "build/server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "build/server/index.js"
    }
  ],
  "functions": {
    "build/server/index.js": {
      "maxDuration": 30
    }
  }
}
```

### **Build Commands**
- **Build Command**: `npm run build`
- **Install Command**: `npm install && npm run setup`
- **Output Directory**: `build`

---

## 🎯 **Environment Variables Guide**

### **Required Variables**
| Variable | Description | Example |
|----------|-------------|---------|
| `SHOPIFY_API_KEY` | From Shopify Partners Dashboard | `abc123def456` |
| `SHOPIFY_API_SECRET` | From Shopify Partners Dashboard | `shpss_xxxxx` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Random 32+ character string | `super-secret-session-key-here` |
| `SHOPIFY_APP_URL` | Your Vercel app URL | `https://your-app.vercel.app` |
| `HOST` | Same as SHOPIFY_APP_URL | `https://your-app.vercel.app` |

### **Optional Variables**
| Variable | Description | Example |
|----------|-------------|---------|
| `VERCEL_ANALYTICS_ID` | Vercel Analytics ID | `prj_xxxxx` |
| `SENTRY_DSN` | Error tracking | `https://xxx@sentry.io/xxx` |

---

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **1. Database Connection Error**
```
Error: Can't reach database server
```
**Solution**: Check your `DATABASE_URL` format and network access.

#### **2. Shopify Authentication Error**
```
Error: Invalid API credentials
```
**Solution**: Verify `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` in Vercel dashboard.

#### **3. Build Timeout**
```
Error: Build timeout
```
**Solution**: Increase function timeout in `vercel.json` or optimize build process.

#### **4. App Not Loading**
```
Error: This page could not be found
```
**Solution**: Check your `vercel.json` routing configuration.

### **Debug Steps**
1. **Check Logs**: `vercel logs your-app-name`
2. **Health Check**: Visit `/health` endpoint
3. **Environment**: Verify all variables are set
4. **Database**: Test connection with `npx prisma studio`

---

## 🚀 **Production Checklist**

### **Before Going Live**
- [ ] Database setup and migrated
- [ ] All environment variables configured
- [ ] Shopify app URLs updated
- [ ] Health check passes
- [ ] Template saving/loading works
- [ ] PDP activation works
- [ ] Mobile preview works

### **After Going Live**
- [ ] Test in real Shopify store
- [ ] Monitor error logs
- [ ] Set up analytics
- [ ] Submit to Shopify App Store
- [ ] Add custom domain (optional)

---

## 📊 **Performance Optimization**

### **Vercel Specific**
- ✅ **Edge Functions**: Automatic geo-distributed
- ✅ **CDN**: Static assets cached globally
- ✅ **Compression**: Gzip/Brotli enabled
- ✅ **Analytics**: Built-in performance monitoring

### **App Optimization**
- ✅ **Code Splitting**: Remix handles automatically
- ✅ **Database**: Use connection pooling
- ✅ **Images**: Optimize with Vercel Image Optimization
- ✅ **Caching**: Implement cache strategies

---

## 💰 **Vercel Pricing**

### **Hobby Plan (Free)**
- ✅ **Perfect for testing**
- ✅ 100GB bandwidth
- ✅ 100 deployments/day
- ✅ Serverless functions

### **Pro Plan ($20/month)**
- ✅ **Production ready**
- ✅ 1TB bandwidth
- ✅ Analytics & monitoring
- ✅ Team collaboration

---

## 🔒 **Security Best Practices**

### **Environment Variables**
- ✅ Never commit secrets to Git
- ✅ Use Vercel dashboard for env vars
- ✅ Rotate secrets regularly
- ✅ Use strong SESSION_SECRET

### **Database Security**
- ✅ Use connection pooling
- ✅ Enable SSL connections
- ✅ Regular backups
- ✅ Monitor query performance

---

## 🎉 **Success! Your App is Live**

### **Final URLs**
- **App**: `https://your-app-name.vercel.app`
- **Health**: `https://your-app-name.vercel.app/health`
- **Builder**: `https://your-app-name.vercel.app/app/builder`

### **Next Steps**
1. **Test thoroughly** in a development store
2. **Submit to Shopify App Store**
3. **Monitor performance** and user feedback
4. **Scale** as your user base grows

### **Support**
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Shopify Partner Support**: [partners.shopify.com](https://partners.shopify.com)
- **Community**: Join Shopify developer communities

---

## 🚨 **Emergency Rollback**

If something goes wrong:
```bash
# Rollback to previous deployment
vercel --prod --rollback
```

---

**🎯 Ready to deploy? Run `./deploy-vercel.sh` to get started!** 