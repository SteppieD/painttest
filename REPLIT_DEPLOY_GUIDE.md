# 🚀 Replit Deployment Guide

## Project Overview
- **Type**: Next.js 14 Painting Quote Application
- **Database**: Supabase (external)
- **Key Features**: Access code auth, quote generation, mobile-responsive
- **Dependencies**: All Replit-compatible

## 📋 Pre-Deployment Checklist
✅ .replit configuration file created
✅ replit.nix dependencies configured  
✅ Package.json scripts optimized for Replit
✅ Environment variables identified
✅ Port configuration set (3000)

## 🔧 Deployment Steps

### 1. Create Replit Account & Project
1. Go to [replit.com](https://replit.com) and sign up/login
2. Click "Create Repl"
3. Choose "Import from GitHub" or "Upload files"
4. Select Node.js template if starting fresh

### 2. Upload Project Files
- Upload entire project folder to Replit
- Ensure all files including .replit and replit.nix are included
- Delete node_modules folder if present (Replit will reinstall)

### 3. Configure Environment Variables
In Replit Secrets (🔒 icon in sidebar):
```
GEMINI_API_KEY = [Your Gemini API Key]
NEXT_PUBLIC_SUPABASE_URL = [Your Supabase URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [Your Supabase Anon Key]
SUPABASE_SERVICE_ROLE_KEY = [Your Supabase Service Role Key]
NEXT_PUBLIC_APP_URL = https://[your-repl-name].[username].repl.co
```

### 4. Install Dependencies & Build
```bash
npm install
npm run build
```

### 5. Start Application
```bash
npm start
```

## 📱 Mobile Testing
- Your app will be available at: `https://[repl-name].[username].repl.co`
- Use access code: **DEMO2024** for testing
- Share URL directly with mobile testers
- App runs 24/7 on Replit's always-on feature

## 🔍 Troubleshooting

### Common Issues:
1. **Port binding**: Ensure port 3000 is configured
2. **Environment variables**: Double-check all secrets are set
3. **Build errors**: Run `npm run build` locally first
4. **Database connection**: Verify Supabase URLs and keys

### Performance Tips:
- Enable "Always On" in Replit for 24/7 availability
- Use Replit's built-in domain for HTTPS
- Monitor usage on free tier (limited compute hours)

## 🎯 Test Checklist
- [ ] App loads on desktop
- [ ] Mobile responsive design works
- [ ] Access code DEMO2024 authentication works
- [ ] Quote generation functions properly
- [ ] All pages and routes accessible
- [ ] Database operations work correctly