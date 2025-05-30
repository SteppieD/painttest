# Painting Quote Generator

**Deploy Status: Fixed and ready for production!**

A modern web application that helps painting contractors create professional quotes using AI assistance. Built with Next.js, Supabase, and Google Gemini AI.

## Features

- 🤖 AI-powered chat interface for gathering project details
- 💰 Dynamic markup adjustment for flexible pricing
- 📄 Professional PDF quote generation
- 🎨 Warm, professional design theme
- 📱 Mobile-responsive interface
- 🔐 Secure Google OAuth authentication
- 💾 Cloud-based storage with Supabase

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **AI**: Google Gemini 2.0 Flash
- **PDF Generation**: React PDF
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google Cloud Console account (for OAuth and Gemini API)
- A Vercel account (for deployment)

### 1. Clone and Install

```bash
cd /Users/sepg/Desktop/painting-quote-app
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase/schema.sql`
3. Go to Authentication > Providers and enable Google OAuth
4. Copy your project URL and anon key

### 3. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Authorized redirect URIs: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret

### 4. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 5. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (add these to Supabase dashboard, not here)
# GOOGLE_CLIENT_ID=your_client_id
# GOOGLE_CLIENT_SECRET=your_client_secret
```

### 6. Configure Supabase Google OAuth

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Google
3. Add your Google Client ID and Secret
4. Set the redirect URL in Google Console to match Supabase's callback URL

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

1. **Sign In**: Use Google OAuth to sign in
2. **First Time Setup**: Enter your company name
3. **Configure Costs**: Go to Settings to set your labor and paint costs
4. **Create Quote**: 
   - Click "New Quote"
   - Chat with the AI to provide project details
   - Review calculated costs
   - Select markup percentage
   - Generate and download PDF

## Project Structure

```
/painting-quote-app
├── /app                    # Next.js app directory
│   ├── /api               # API routes
│   ├── /(auth)            # Authentication pages
│   ├── /(dashboard)       # Protected app pages
│   └── /chat/[projectId]  # Chat interface
├── /components            # Reusable components
├── /lib                   # Utilities & configs
├── /hooks                 # Custom React hooks
├── /types                 # TypeScript types
├── /public               # Static assets
└── /supabase             # Database schema
```

## Key Features Explained

### Dynamic Markup
- Select from quick options (10%, 15%, 20%, 25%, 30%)
- Or enter a custom markup percentage
- See real-time price updates
- View profit calculations

### Cost Configuration
- Set your actual costs for:
  - Labor (per hour)
  - Paint (Good/Better/Best tiers)
  - Base supplies
- Costs are private to your account

### AI Chat Interface
- Natural conversation flow
- Gathers all necessary project details
- Calculates paint needed based on square footage
- Estimates labor hours automatically

### Quote Generation
- Professional PDF format
- Includes all project details
- Shows itemized pricing
- 30-day validity period
- Custom filename with address and markup

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Troubleshooting

### Common Issues

1. **Google OAuth not working**
   - Ensure redirect URIs match exactly
   - Check that Google+ API is enabled
   - Verify client ID and secret are correct

2. **Gemini API errors**
   - Check API key is valid
   - Ensure you have API quota remaining
   - Try using `gemini-1.5-flash` if 2.0 isn't available

3. **Database errors**
   - Run the schema.sql file completely
   - Check Row Level Security policies
   - Ensure service role key is correct

### Support

For issues or questions:
1. Check the Supabase logs for database errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly

## Future Enhancements

- [ ] Email quote delivery
- [ ] Customer management system
- [ ] Quote templates
- [ ] Team collaboration
- [ ] Invoice generation
- [ ] Payment processing
- [ ] Mobile app

## License

This project is private and proprietary.

---

Built with ❤️ for painting contractors
