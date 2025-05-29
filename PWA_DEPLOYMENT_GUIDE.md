# PWA Deployment Guide - QuoteCraft Pro

## Quick Deploy to Vercel for PWA Testing

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy with Vercel
```bash
cd /Users/sepg/Desktop/painting-quote-app
vercel
```

### 3. Set Environment Variables in Vercel Dashboard
After deployment, go to your Vercel dashboard and add these environment variables:
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)

### 4. Test PWA Installation on Phone

1. **On iPhone:**
   - Open Safari and navigate to your deployed URL
   - Tap the Share button (square with arrow)
   - Scroll down and tap "Add to Home Screen"
   - Name it and tap "Add"

2. **On Android:**
   - Open Chrome and navigate to your deployed URL
   - Chrome should show an "Install App" banner
   - Or tap the menu (3 dots) and select "Add to Home Screen"

### PWA Features Included:
- ✅ Installable as an app
- ✅ Works offline (basic functionality)
- ✅ Full screen mode
- ✅ App shortcuts (New Quote, View Quotes)
- ✅ Theme color matches your brand

### Testing PWA Features:
1. Install the app on your phone
2. Open it - should launch in full screen
3. Turn on airplane mode and test offline page
4. Check that app icon appears correctly

### Next Steps for Production:
1. Replace placeholder icons with professional ones (192x192, 512x512)
2. Add more offline functionality
3. Implement push notifications (optional)
4. Add more app shortcuts as needed

### Temporary Icons:
Currently using a placeholder icon (/public/icon.svg). For production, create proper PNG icons using:
- https://realfavicongenerator.net/
- https://maskable.app/