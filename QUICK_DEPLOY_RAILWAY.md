# Quick Deploy to Railway - Get Online in 5 Minutes

## Why Railway?
- One-click PostgreSQL database setup
- Auto-detects Next.js
- No complex configuration needed
- Free tier available

## Steps:

### 1. Go to Railway
Visit: https://railway.app

### 2. Sign in with GitHub
Click "Login with GitHub"

### 3. Deploy from GitHub
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repo: `SteppieD/painttest`
- Railway will auto-detect Next.js

### 4. Add PostgreSQL Database
- In your project dashboard, click "+ New"
- Select "Database" → "Add PostgreSQL"
- It will automatically create DATABASE_URL

### 5. Add Environment Variables
Click on your app service, go to "Variables" tab and add:

```
GEMINI_API_KEY=AIzaSyCUIGerwUQl5gYegOEWd44m4QHd1XKQ51k
SESSION_SECRET=super-secret-painting-app-key-at-least-32-characters-change-this
NEXT_PUBLIC_APP_URL=(Railway will provide this after deploy)
```

### 6. Deploy
Railway will automatically:
- Install dependencies
- Run Prisma migrations
- Build your app
- Deploy it

## Your App Will Be Live At:
`https://your-app-name.up.railway.app`

## Testing Your App:
1. Visit your Railway URL
2. Click "Generate New Access Code"
3. Use the 6-digit code to login
4. Create a test quote

That's it! Your app will be online and ready to share with testers.