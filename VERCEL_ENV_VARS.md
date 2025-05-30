# Vercel Environment Variables

Add these environment variables in your Vercel project settings:

## Required Variables:

1. **GEMINI_API_KEY**
   - Your Google Gemini API key from Google AI Studio

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL (e.g., https://opcbwsfdhergcjjobryp.supabase.co)

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key

4. **SUPABASE_SERVICE_ROLE_KEY**
   - Your Supabase service role key (keep this secret!)

5. **NEXT_PUBLIC_APP_URL**
   - Set to your production URL (e.g., https://yourdomain.com/quotes)

6. **GOOGLE_CLIENT_ID**
   - Your Google OAuth client ID

7. **GOOGLE_CLIENT_SECRET**
   - Your Google OAuth client secret

## Important Notes:

- Don't forget to update Google OAuth redirect URIs to include your production domain
- The app is configured to run at /quotes subdirectory
- Make sure your Supabase database has all the required tables and migrations applied