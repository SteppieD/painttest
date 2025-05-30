# 🚀 Paint Quote Bot - Quick Deploy Guide

## Option 1: Railway (Recommended - 2 minutes)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add mobile chat interface"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repo
   - Add environment variables from `.env.local`
   - Click "Deploy"

## Option 2: Render.com (Free tier)

1. **Push to GitHub** (same as above)

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - New > Web Service
   - Connect GitHub
   - Use these settings:
     - Build: `npm install && npm run build`
     - Start: `npm start`
   - Add env variables
   - Deploy

## Option 3: Direct VPS Deploy

```bash
# On your server (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Clone and setup
git clone [your-repo-url]
cd painttest
npm install
npm run build

# Create .env.local with your variables

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Make it Mobile-App-Like

### For iPhone:
1. Open Safari on iPhone
2. Go to your deployed URL/mobile-chat
3. Tap Share button
4. Select "Add to Home Screen"
5. Name it "Paint Quote"

### For Android:
1. Open Chrome
2. Go to your URL/mobile-chat
3. Tap menu (3 dots)
4. Select "Add to Home screen"

## Environment Variables Needed

```env
# Copy from your .env.local
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=https://your-deployed-url.com
```

## Test Your Deployment

1. Visit: `https://your-app.railway.app/mobile-chat`
2. It should look like a messaging app
3. Add to home screen for app-like experience

## Troubleshooting

### If deploy fails:
- Check all env variables are set
- Ensure Supabase bucket 'company-logos' exists
- Check build logs for errors

### If chat doesn't work:
- Verify API keys are correct
- Check browser console for errors
- Ensure CORS is configured in Supabase

## Next Steps

1. Customize the chat prompts in `/app/api/chat`
2. Add your branding to `/app/mobile-chat`
3. Configure PWA icons in `/public`
4. Set up custom domain