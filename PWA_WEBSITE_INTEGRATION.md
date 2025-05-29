# PWA Website Integration Guide

## Two Options for Hosting Your PWA

### Option 1: Subdomain Approach (Recommended)
Host the PWA on a subdomain of your existing website:
- Your main site: `www.yoursite.com`
- PWA app: `app.yoursite.com` or `quotes.yoursite.com`

**Steps:**
1. Build the app: `npm run build`
2. Upload the contents of `.next` folder to your subdomain
3. Users visit `app.yoursite.com` to install the PWA

### Option 2: Subfolder Approach
Host the PWA in a subfolder of your existing website:
- Your main site: `www.yoursite.com`
- PWA app: `www.yoursite.com/quotetool/`

**Steps:**
1. Update `next.config.js` to add base path:
```javascript
module.exports = {
  basePath: '/quotetool',
  assetPrefix: '/quotetool/',
}
```

2. Build the app: `npm run build`
3. Upload to `/quotetool/` folder on your server

### Option 3: iframe Embed (Not Recommended for PWA)
You could iframe it, but users won't be able to install it as a PWA this way.

## What You Need on Your Server

### For Next.js Apps:
Your server needs Node.js support. If you have:

**Shared Hosting (cPanel, etc.):**
- Won't work directly
- Need to export as static site: `npm run build && npm run export`
- Then upload the `out` folder

**VPS/Cloud Hosting:**
- Install Node.js
- Upload all files
- Run: `npm install && npm run build && npm start`

**Vercel/Netlify (Easiest):**
- Deploy there and point a subdomain to it

## Testing Flow

1. **Deploy the PWA** to `app.yoursite.com`
2. **Share the link** with test users: "Visit app.yoursite.com on your phone"
3. **Users install it** via their browser's "Add to Home Screen"
4. **It becomes an app** on their phone

## Quick Static Export (If No Node.js)

```bash
# In next.config.js add:
module.exports = {
  output: 'export',
}

# Then:
npm run build
# Upload the 'out' folder to your server
```

## Simple Test URL Setup

On your main website, add a test page:

```html
<!-- On www.yoursite.com/test-app.html -->
<h1>Test Our New Quote App!</h1>
<p>Visit this link on your phone: <a href="https://app.yoursite.com">app.yoursite.com</a></p>
<p>Then add it to your home screen for the full app experience!</p>
```