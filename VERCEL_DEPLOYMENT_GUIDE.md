# Vercel Deployment Guide

## Current Issue
The app uses SQLite with Prisma, which doesn't work on Vercel's serverless environment. We need to use a cloud database.

## Quick Fix Options

### Option 1: Use Vercel PostgreSQL (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to Storage tab
3. Create a new PostgreSQL database
4. Copy the connection string
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   GEMINI_API_KEY=your_api_key
   SESSION_SECRET=your_secret_key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

### Option 2: Use External PostgreSQL
1. Create a PostgreSQL database on:
   - Railway
   - Supabase 
   - PlanetScale
   - Neon
2. Get the connection string
3. Add to Vercel environment variables

## Environment Variables Needed

```
DATABASE_URL=postgresql://user:password@host:port/database
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_secret_session_key_at_least_32_chars
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Database Setup
After setting the environment variables, the database will be automatically set up on first deployment thanks to Prisma.

## Features Working
- ✅ Access code authentication 
- ✅ Company management
- ✅ Project tracking
- ✅ Quote generation with AI
- ✅ Quote versioning
- ✅ Client quote acceptance

## Testing the App
1. Visit your deployed URL
2. Click "Generate New Access Code" 
3. Use the 6-digit code to sign in
4. Start creating quotes

## Current Authentication System
- No traditional user accounts
- Access code based (6-digit codes)
- Company-centric (each code = one company)
- Session-based with iron-session