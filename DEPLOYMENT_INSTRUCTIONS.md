# Deployment Instructions for Painting Quote App

## Prerequisites

Before deploying, ensure you have:
1. A Supabase account and project set up
2. Google Gemini API key
3. (Optional) Google OAuth credentials for login
4. Git repository with your code

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

Vercel is the native platform for Next.js applications and offers the best performance and developer experience.

#### Method A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. From the project root directory, run:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Link to existing project or create new
   - Configure project settings
   - Set environment variables when prompted

#### Method B: Using GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see DEPLOYMENT_ENV_VARS.md)
6. Click "Deploy"

### Option 2: Deploy to Netlify

1. Push your code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" > "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables (see DEPLOYMENT_ENV_VARS.md)
7. Click "Deploy site"

## Post-Deployment Setup

### 1. Update Supabase Authentication URLs

In your Supabase project dashboard:
1. Go to Authentication > URL Configuration
2. Update "Site URL" to your deployment URL (e.g., `https://your-app.vercel.app`)
3. Add to "Redirect URLs":
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/login`

### 2. Update Google OAuth Redirect URIs (if using)

In Google Cloud Console:
1. Go to your OAuth 2.0 Client ID
2. Add authorized redirect URIs:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-supabase-project.supabase.co/auth/v1/callback`

### 3. Update Environment Variables

Make sure to update `NEXT_PUBLIC_APP_URL` to your actual deployment URL in your deployment platform's environment variables.

## Testing Your Deployment

1. Visit your deployment URL
2. Test the following:
   - Login functionality
   - Chat interface
   - Quote generation
   - PDF download
   - Settings page

## Troubleshooting

### Build Failures
- Check that all dependencies are listed in package.json
- Ensure environment variables are properly set
- Check build logs for specific errors

### Authentication Issues
- Verify Supabase URLs are correct
- Check that redirect URLs match exactly
- Ensure API keys are valid

### API Timeouts
- The vercel.json includes extended timeout settings for API routes
- If issues persist, check function logs in Vercel/Netlify dashboard

### Database Connection Issues
- Verify Supabase credentials
- Check that service role key has proper permissions
- Ensure Supabase project is not paused

## Monitoring and Logs

### Vercel
- Function logs: Dashboard > Functions tab
- Build logs: Dashboard > Deployments
- Analytics: Dashboard > Analytics

### Netlify
- Function logs: Dashboard > Functions
- Build logs: Dashboard > Deploys
- Analytics: Dashboard > Analytics

## Updating Your Deployment

### Automatic Deployments
Both Vercel and Netlify support automatic deployments from GitHub:
- Push to main branch triggers production deployment
- Push to other branches creates preview deployments

### Manual Deployments
- Vercel: Run `vercel --prod` in project directory
- Netlify: Drag and drop build folder to Netlify dashboard

## Security Best Practices

1. Never expose sensitive keys in client-side code
2. Use environment variables for all secrets
3. Regularly rotate API keys
4. Monitor usage and set up alerts
5. Enable 2FA on all service accounts

## Performance Optimization

1. Enable caching in Vercel/Netlify settings
2. Use CDN for static assets
3. Monitor Core Web Vitals
4. Optimize images and fonts
5. Enable compression

## Need Help?

- Vercel Documentation: https://vercel.com/docs
- Netlify Documentation: https://docs.netlify.com
- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs