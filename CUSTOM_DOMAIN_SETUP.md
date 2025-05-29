# Custom Domain Setup Guide - zioadvertising.com/quotes/

## Overview
This guide sets up `zioadvertising.com/quotes/` as a subfolder on your main domain, pointing to your Vercel deployment.

## Option A: Custom Domain with Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your `painting-quote-app` project
3. Go to **Settings** → **Domains**
4. Click **"Add Domain"**
5. Enter: `zioadvertising.com`
6. Configure to serve from `/quotes/` subfolder

## Option B: Subdomain (Alternative)
1. Add domain: `quotes.zioadvertising.com`
2. Configure DNS CNAME to `cname.vercel-dns.com`

## Step 3: Deploy with Updated Environment
```bash
# Deploy to Vercel with production environment
vercel --prod
```

## Step 4: Update Google OAuth (Important!)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth client
3. Add to **Authorized redirect URIs**:
   - `https://quotes.zioadvertising.com/auth/callback`
   - `https://opcbwsfdhergcjjobryp.supabase.co/auth/v1/callback`

## Step 5: Update Supabase (Important!)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/opcbwsfdhergcjjobryp)
2. Go to **Authentication** → **URL Configuration**
3. Update **Site URL**: `https://quotes.zioadvertising.com`
4. Add to **Redirect URLs**: `https://quotes.zioadvertising.com/**`

## Testing
1. Wait 5-10 minutes for DNS propagation
2. Visit: `https://quotes.zioadvertising.com`
3. Should show your quote app with Google login
4. Test on mobile - should work perfectly

## User Access
- **Main site**: `zioadvertising.com`
- **Quote app**: `quotes.zioadvertising.com`
- **Mobile PWA**: Works on subdomain

## Benefits
- ✅ Professional branded URL
- ✅ SSL certificate (automatic)
- ✅ Mobile compatibility
- ✅ PWA installation works
- ✅ No localhost redirects

## Troubleshooting
- **DNS not working**: Wait up to 24 hours for full propagation
- **SSL errors**: Vercel handles this automatically
- **Google OAuth errors**: Double-check redirect URIs
- **Still redirects to Vercel**: Clear browser cache