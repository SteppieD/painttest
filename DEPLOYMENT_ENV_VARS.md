# Deployment Environment Variables

## Required Environment Variables for Deployment

When deploying the Painting Quote App, you need to set the following environment variables in your deployment platform:

### 1. Google Gemini API
```
GEMINI_API_KEY=your_gemini_api_key_here
```
- Get this from: https://makersuite.google.com/app/apikey
- Required for AI chat functionality

### 2. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
- Get these from your Supabase project settings: https://supabase.com/dashboard/project/_/settings/api
- NEXT_PUBLIC_SUPABASE_URL: Found in "Project URL"
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Found in "Project API keys" > "anon public"
- SUPABASE_SERVICE_ROLE_KEY: Found in "Project API keys" > "service_role" (keep this secret!)

### 3. App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-deployed-app-url.vercel.app
```
- Replace with your actual deployment URL
- Used for authentication callbacks and API endpoints

### 4. Google OAuth (Optional - for Google login)
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
- Get these from Google Cloud Console: https://console.cloud.google.com/
- Create a new OAuth 2.0 Client ID
- Add authorized redirect URIs:
  - `https://your-deployed-app-url.vercel.app/auth/callback`
  - `https://your-supabase-project.supabase.co/auth/v1/callback`

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with its corresponding value
4. Make sure to select "Production" environment
5. Click "Save" after adding all variables

## Setting Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Click "Add a variable"
4. Add each variable with its corresponding value
5. Deploy or redeploy your site

## Important Notes

- Never commit `.env.local` to version control
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret - it has admin privileges
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- After setting environment variables, redeploy your application